import { AllOrdersAndDealsResponse, OrderResponse, ChartResponse, PositionsResponse, OrderDepthResponse, StockResponse, DetailedStockResponse, QuoteResponse, CategorizedAccountsResponse, OrderBookResponse, OrdersResponse, DealsResponse, QuotePush, DealEvent, OrderEvent, SearchResponse } from "./types/response";
import axios, { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { TOTP } from 'totp-generator';
import { URL } from "./constants";
import { AuthenticateResponse, AuthenticateRequest, ChartRequest, DeleteOrderRequest, ModifyOrderRequest, NewOrderRequest } from "./types/requests";
import { AvanzaError } from "./avanzaError";
import { EventEmitter } from 'events';
import { SseMessage, SseStream } from "./sse";

// Avanza rejects some push streams from clients that don't look like a browser.
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

export class Avanza extends EventEmitter {
  #cookieJar = new CookieJar();
  #client: AxiosInstance = wrapper(axios.create({ jar: this.#cookieJar } as CreateAxiosDefaults) as any);
  #authInfo: AuthenticateResponse;
  #quoteStreams = new Map<string, SseStream>();
  #tradingStreams: SseStream[] = [];
  #recentEvents = new Set<string>();

  constructor() {
    super();
  }

  private async post<T>(url: string, data: any): Promise<T> {
    try {
      return (await this.#client.post<T>(url, data)).data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new AvanzaError(err.message, { response: err.response.data, code: err.response.status });
      } else {
        throw new AvanzaError(err);
      }
    }
  }

  private async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      return (await this.#client.get<T>(url, config)).data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new AvanzaError(err.message, { response: err.response.data, code: err.response.status });
      } else {
        throw new AvanzaError(err);
      }
    }
  }

  public async authenticate(options: AuthenticateRequest) {
    const { username, password, secret } = options;
    await this.post(URL.AUTHNCREDENTIALS, { username, password });
    const { otp } = await TOTP.generate(secret, { explicitZeroPad: true });
    const response = await this.post<AuthenticateResponse>(URL.AUTHNTOTP, {
      "totpCode": otp,
      "method": "TOTP"
    });

    this.#authInfo = response;
    const cookies = this.#cookieJar.getCookiesSync(URL.AVANZA);
    const cookie = cookies.find(c => c.key === "AZACSRF");
    this.#client.defaults.headers.common['x-securitytoken'] = cookie.value;

    // Close the streams from a previous login, otherwise every event is emitted once per login.
    this.closeTradingStreams();
    this.#tradingStreams = [
      this.tradingStream(URL.DEALEVENT, "DEAL", (deal: DealEvent) => deal.dealId && `${deal.dealId}:${deal.pushAction}`),
      this.tradingStream(URL.ORDEREVENT, "ORDER", (order: OrderEvent) => order.uniqueId)
    ];

    return response;
  }

  /** Closes the deal/order streams and all quote streams. */
  close() {
    this.closeTradingStreams();
    for (const orderbookId of [...this.#quoteStreams.keys()]) {
      this.quoteUnsubscribe(orderbookId);
    }
  }

  private tradingStream(url: string, event: "DEAL" | "ORDER", eventKey: (data: any) => string | undefined) {
    const stream = new SseStream(url, () => this.streamHeaders());
    stream.on('message', (message: SseMessage) => {
      if (message.event !== event) {
        return;
      }
      // Event data is a JSON string; emit it parsed so listeners get the DealEvent/OrderEvent types.
      let data: any;
      try {
        data = JSON.parse(message.data);
      } catch {
        this.emit(event, message.data);
        return;
      }
      // Avanza sometimes re-sends an identical event (same dealId/uniqueId) within a second.
      const key = eventKey(data);
      if (key) {
        const id = `${event}:${key}`;
        if (this.#recentEvents.has(id)) {
          return;
        }
        this.#recentEvents.add(id);
        if (this.#recentEvents.size > 1000) {
          this.#recentEvents.delete(this.#recentEvents.values().next().value);
        }
      }
      this.emit(event, data);
    });
    stream.on('error', (error) => this.emit("STREAM_ERROR", { stream: event, error }));
    stream.on('end', () => this.emit("STREAM_END", { stream: event }));
    return stream.start();
  }

  private closeTradingStreams() {
    this.#tradingStreams.forEach(stream => stream.close());
    this.#tradingStreams = [];
  }

  async getAllOrdersAndDeals() {
    return this.get<AllOrdersAndDealsResponse>(URL.ALLORDERSANDDEALS);
  }

  async newOrder(order: NewOrderRequest) {
    order.requestId ??= await this.get<string>(URL.REQUESTID);
    order.openVolume ??= null;
    order.condition ??= "NORMAL";
    order.isDividendReinvestment ??= false;
    order.validUntil ??= new Date().toISOString().split('T')[0];

    return this.post<OrderResponse>(`${URL.ORDER}/new`, order);
  }

  async modifyOrder(order: ModifyOrderRequest) {
    order.openVolume ??= null;
    order.condition ??= "NORMAL";
    order.validUntil ??= new Date().toISOString().split('T')[0];

    return this.post<OrderResponse>(`${URL.ORDER}/modify`, order);
  }

  async deleteOrder(order: DeleteOrderRequest) {
    return this.post<OrderResponse>(`${URL.ORDER}/delete`, order);
  }

  async getStock(id: string) {
    return this.get<StockResponse>(`${URL.MARKETGUIDE}/stock/${id}`);
  }

  async getStockDetails(id: string) {
    return this.get<DetailedStockResponse>(`${URL.MARKETGUIDE}/stock/${id}/details`);
  }

  async search(query: string, types: string[] = ["STOCK"]) {
    return this.post<SearchResponse>(URL.SEARCH, { query, searchFilter: { types }, pagination: { from: 0, size: 10 } });
  }

  async getChart(req: ChartRequest) {
    let parameters: any = {};
    let url = `${URL.CHART}/${req.instrument}`;
    if (req.resolution) {
      parameters.resolution = req.resolution;
    }
    if (req.timePeriod) {
      parameters.timePeriod = req.timePeriod;
    } else if (req.from && req.to) {
      parameters.to = req.to;
      parameters.from = req.from;
    }
    return this.get<ChartResponse>(url, { params: parameters });
  }

  /** Resolves to null (HTTP 200) for an unknown orderbook id, unlike getStock which throws a 404. */
  async getQuote(id: string) {
    return this.get<QuoteResponse>(`${URL.MARKETGUIDE}/stock/${id}/quote`);
  }

  async getOrderDepth(id: string) {
    return this.get<OrderDepthResponse>(`${URL.MARKETGUIDE}/stock/${id}/orderdepth`);
  }

  async getPositions() {
    return this.get<PositionsResponse>(URL.POSITIONS);
  }

  async getAccountsForPush() {
    return this.get<string[]>(URL.ACCOUNTSFORPUSH);
  }

  /**
   * Streams quotes for an orderbook until quoteUnsubscribe is called. Reconnects automatically;
   * connection problems are emitted as "STREAM_ERROR" events.
   */
  quoteSubscribe(orderbookId: string, cb: (quote: QuotePush) => void) {
    this.quoteUnsubscribe(orderbookId);
    const stream = new SseStream(`${URL.QUOTEEVENT}/${orderbookId}`, () => this.streamHeaders());
    stream.on('message', (message: SseMessage) => {
      if (message.event === 'info') {
        return;
      }
      let data: unknown;
      try {
        data = JSON.parse(message.data);
      } catch {
        return;
      }
      if (data && typeof data === 'object') {
        cb({ ...data, orderbookId });
      }
    });
    stream.on('error', (error) => this.emit("STREAM_ERROR", { orderbookId, error }));
    stream.on('end', () => this.emit("STREAM_END", { orderbookId }));
    this.#quoteStreams.set(orderbookId, stream.start());
  }

  quoteUnsubscribe(orderbookId: string) {
    this.#quoteStreams.get(orderbookId)?.close();
    this.#quoteStreams.delete(orderbookId);
  }

  private streamHeaders(): Record<string, string> {
    return {
      'Cookie': this.#cookieJar.getCookieStringSync(URL.AVANZA),
      'User-Agent': BROWSER_USER_AGENT
    };
  }

  getCategorizedAccounts() {
    return this.get<CategorizedAccountsResponse>(URL.CATEGORIZEDACCOUNTS);
  }

  getOrderBook(id: string) {
    return this.get<OrderBookResponse>(URL.ORDERBOOK + `/${id}`);
  }

  getOrders() {
    return this.get<OrdersResponse>(URL.ORDERS);
  }

  getDeals() {
    return this.get<DealsResponse>(URL.DEALS);
  }
}
