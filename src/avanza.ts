import { AllOrdersAndDealsResponse, OrderResponse, ChartResponse, PositionsResponse, OrderDepthResponse, StockResponse, DetailedStockResponse, QuoteResponse, CategorizedAccountsResponse, OrderBookResponse, OrdersResponse, DealsResponse, QuotePush } from "./types/response";
import axios, { AxiosRequestConfig } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import TOTP from 'totp-generator';
import { URL } from "./constants";
import { AuthenticateResponse, AuthenticateRequest, ChartRequest, DeleteOrderRequest, ModifyOrderRequest, NewOrderRequest } from "./types/requests";
import { AvanzaError } from "./avanzaError";
import EventSource from 'eventsource';
import { EventEmitter } from 'events';
import { SseMessage, SseStream } from "./sse";

// Avanza rejects some push streams from clients that don't look like a browser.
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

export class Avanza extends EventEmitter {
  #cookieJar = new CookieJar();
  #client = wrapper(axios.create({ jar: this.#cookieJar }));
  #authInfo: AuthenticateResponse;
  #quoteStreams = new Map<string, SseStream>();

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
    const totp = TOTP(secret);
    const response = await this.post<AuthenticateResponse>(URL.AUTHNTOTP, {
      "totpCode": totp.toString(),
      "method": "TOTP"
    });

    this.#authInfo = response;
    const cookies = this.#client.defaults.jar.getCookiesSync(URL.AVANZA);
    const cookie = cookies.find(c => c.key === "AZACSRF");
    this.#client.defaults.headers.common['x-securitytoken'] = cookie.value;

    const eventSourceInitDict = { headers: this.streamHeaders() };

    const dealEvent = new EventSource(URL.DEALEVENT, eventSourceInitDict);
    const orderEvent = new EventSource(URL.ORDEREVENT, eventSourceInitDict);
    dealEvent.addEventListener("DEAL", (deal) => this.emit("DEAL", deal.data));
    orderEvent.addEventListener("ORDER", (order) => this.emit("ORDER", order.data));

    return response;
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
