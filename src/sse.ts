import { EventEmitter } from 'events';

export interface SseMessage {
  event: string;
  data: string;
}

/**
 * Minimal server-sent events client on top of fetch.
 * Emits "message" for every event, "end" when the server ends the stream and "error" when the stream fails.
 * Reconnects until closed: right away after an end, after retryMs after an error.
 */
export class SseStream extends EventEmitter {
  #abort?: AbortController;
  #closed = false;
  #lastEventId?: string;

  /**
   * @param minLifetimeMs A stream the server ends sooner than this is retried after retryMs instead of
   * right away, so a server that keeps ending the stream isn't hammered.
   */
  constructor(private url: string, private headers: () => Record<string, string>, private retryMs = 5000, private minLifetimeMs = 1000) {
    super();
  }

  start() {
    this.run();
    return this;
  }

  close() {
    this.#closed = true;
    this.#abort?.abort();
  }

  private async run() {
    while (!this.#closed) {
      this.#abort = new AbortController();
      const started = Date.now();
      let delay = this.retryMs;
      try {
        const headers: Record<string, string> = { Accept: 'text/event-stream', ...this.headers() };
        if (this.#lastEventId) {
          headers['Last-Event-ID'] = this.#lastEventId;
        }
        const res = await fetch(this.url, { headers, signal: this.#abort.signal });
        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status} from ${this.url}`);
        }
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
        this.emit('error', err);
      }
      if (!this.#closed && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
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
