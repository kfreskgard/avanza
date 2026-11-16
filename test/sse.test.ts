import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import { SseStream } from '../src/sse';

/** Serves each request with the next handler, the last one for every request after that. */
async function server(...handlers: ((res: ServerResponse) => void)[]) {
  const times: number[] = [];
  const srv = createServer((_req, res) => {
    times.push(Date.now());
    handlers[Math.min(times.length, handlers.length) - 1](res);
  });
  await new Promise<void>(resolve => srv.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(srv.address() as AddressInfo).port}/`;
  return { url, times, close: () => { srv.closeAllConnections(); srv.close(); } };
}

const status = (code: number, headers: Record<string, string> = {}, body = '') => (res: ServerResponse) => res.writeHead(code, headers).end(body);
const gaps = (times: number[]) => times.slice(1).map((t, i) => t - times[i]);
const until = async (condition: () => boolean, timeoutMs = 5000) => {
  const start = Date.now();
  while (!condition() && Date.now() - start < timeoutMs) {
    await new Promise(resolve => setTimeout(resolve, 5));
  }
};

test('error includes Retry-After and the response body', async () => {
  const srv = await server(status(429, { 'Retry-After': '0' }, 'Too many requests'));
  const stream = new SseStream(srv.url, () => ({}), 10_000);
  const error = await new Promise<Error>(resolve => stream.once('error', resolve).start());
  stream.close();
  srv.close();
  assert.equal(error.message, `HTTP 429 from ${srv.url} (Retry-After: 0): Too many requests`);
});

test('retries back off exponentially while errors repeat', async () => {
  const srv = await server(status(500));
  const stream = new SseStream(srv.url, () => ({}), 40, 1000, 10_000).on('error', () => {}).start();
  await until(() => srv.times.length >= 5);
  stream.close();
  srv.close();
  // Jitter keeps each wait within [half, full] of 40, 80, 160 and 320 ms.
  const waits = gaps(srv.times);
  [40, 80, 160, 320].forEach((base, i) => {
    assert.ok(waits[i] >= base / 2 - 5 && waits[i] <= base + 50, `wait ${i} was ${waits[i]} ms, expected ${base / 2}-${base}`);
  });
});

test('backoff is capped at maxRetryMs', async () => {
  const srv = await server(status(500));
  const stream = new SseStream(srv.url, () => ({}), 40, 1000, 60).on('error', () => {}).start();
  await until(() => srv.times.length >= 6);
  stream.close();
  srv.close();
  assert.ok(Math.max(...gaps(srv.times)) <= 60 + 50);
});

test('waits at least as long as Retry-After', async () => {
  const srv = await server(status(429, { 'Retry-After': '1' }), status(500));
  const stream = new SseStream(srv.url, () => ({}), 10).on('error', () => {}).start();
  await until(() => srv.times.length >= 2);
  stream.close();
  srv.close();
  assert.ok(gaps(srv.times)[0] >= 1000 - 5);
});

test('a successful connection resets the backoff', async () => {
  const fail = status(500);
  const open = (res: ServerResponse) => res.writeHead(200, { 'Content-Type': 'text/event-stream' }).end('data: hello\n\n');
  const srv = await server(fail, fail, fail, open, fail, fail);
  const stream = new SseStream(srv.url, () => ({}), 40, 0, 10_000).on('error', () => {}).start();
  await until(() => srv.times.length >= 6);
  stream.close();
  srv.close();
  // Request 4 connects and ends, request 5 is an immediate reconnect that fails, so request 6 waits the first backoff step again.
  assert.ok(gaps(srv.times)[4] <= 40 + 50, `wait after reconnect was ${gaps(srv.times)[4]} ms`);
});

test('close stops a stream that is waiting to retry', async () => {
  const srv = await server(status(429, { 'Retry-After': '3600' }));
  const stream = new SseStream(srv.url, () => ({}));
  await new Promise(resolve => stream.once('error', resolve).start());
  stream.close();
  await new Promise(resolve => setImmediate(resolve));
  srv.close();
  assert.equal(srv.times.length, 1);
  assert.ok(!process.getActiveResourcesInfo().includes('Timeout'), 'a retry timer is still pending after close');
});
