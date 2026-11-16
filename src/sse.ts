import { EventEmitter } from 'events';

export interface SseMessage {
  event: string;
  data: string;
}

/**
 * Minimal server-sent events client on top of fetch.
 * Emits "message" for every event, "end" when the server ends the stream and "error" when the stream fails.
 * Reconnects until closed: right away after an end, with backoff after an error.
 */
export class SseStream extends EventEmitter {
  #abort?: AbortController;
  #closed = false;
  #lastEventId?: string;
  #failures = 0;
  #wake?: () => void;

  /**
   * @param retryMs Wait before the first retry after an error. It doubles with every error in a row, up to
   * maxRetryMs, and each wait is randomized between half and all of that so streams that fail together
   * don't retry together. A Retry-After header from the server is waited out in full.
   * @param minLifetimeMs A stream the server ends sooner than this is retried after retryMs instead of
   * right away, so a server that keeps ending the stream isn't hammered.
   */
  constructor(private url: string, private headers: () => Record<string, string>, private retryMs = 5000, private minLifetimeMs = 1000, private maxRetryMs = 60_000) {
    super();
  }

  start() {
    this.run();
    return this;
  }

  close() {
    this.#closed = true;
    this.#abort?.abort();
    this.#wake?.();
  }

  private async run() {
    while (!this.#closed) {
      this.#abort = new AbortController();
      const started = Date.now();
      let delay = this.retryMs;
      let retryAfterMs = 0;
      try {
        const headers: Record<string, string> = { Accept: 'text/event-stream', ...this.headers() };
        if (this.#lastEventId) {
          headers['Last-Event-ID'] = this.#lastEventId;
        }
        const res = await fetch(this.url, { headers, signal: this.#abort.signal });
        if (!res.ok || !res.body) {
          const retryAfter = res.headers.get('retry-after');
          retryAfterMs = parseRetryAfter(retryAfter);
          const body = (await res.text().catch(() => '')).trim().slice(0, 500);
          throw new Error(`HTTP ${res.status} from ${this.url}`
            + (retryAfter ? ` (Retry-After: ${retryAfter})` : '')
            + (body ? `: ${body}` : ''));
        }
        this.#failures = 0;
        await this.read(res.body);
        if (!this.#closed) {
          this.emit('end');
          if (Date.now() - started >= this.minLifetimeMs) {
            delay = 0;
          }
        }
      } catch (err) {
        if (this.#closed) {
          return;
        }
        this.#failures++;
        const backoff = Math.min(this.maxRetryMs, this.retryMs * 2 ** (this.#failures - 1));
        delay = Math.max(backoff / 2 + Math.random() * backoff / 2, retryAfterMs);
        this.emit('error', err);
      }
      if (!this.#closed && delay > 0) {
        await this.sleep(delay);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise<void>(resolve => {
      const timer = setTimeout(resolve, ms);
      this.#wake = () => {
        clearTimeout(timer);
        resolve();
      };
    });
  }

  private async read(body: ReadableStream<Uint8Array>) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let event = 'message';
    let data: string[] = [];

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        return;
      }
      buffer += decoder.decode(value, { stream: true });

      let newline: number;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline).replace(/\r$/, '');
        buffer = buffer.slice(newline + 1);

        if (line === '') {
          if (data.length > 0) {
            this.emit('message', { event, data: data.join('\n') } as SseMessage);
          }
          event = 'message';
          data = [];
        } else if (!line.startsWith(':')) { // Lines starting with ':' are keep-alive comments
          const colon = line.indexOf(':');
          const field = colon < 0 ? line : line.slice(0, colon);
          const value = colon < 0 ? '' : line.slice(colon + 1).replace(/^ /, '');
          if (field === 'event') {
            event = value;
          } else if (field === 'data') {
            data.push(value);
          } else if (field === 'id' && !value.includes('\0')) {
            // Sent as Last-Event-ID on reconnect.
            this.#lastEventId = value;
          }
        }
      }
    }
  }
}

/** Retry-After is either seconds or an HTTP date. */
function parseRetryAfter(value: string | null): number {
  if (!value) {
    return 0;
  }
  const seconds = Number(value);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }
  const date = Date.parse(value);
  return Number.isNaN(date) ? 0 : Math.max(0, date - Date.now());
}
