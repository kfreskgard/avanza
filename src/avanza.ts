import { AllOrdersAndDealsResponse, OrderResponse, ChartResponse, PositionsResponse, OrderDepthResponse, StockResponse, DetailedStockResponse, QuoteResponse, CategorizedAccountsResponse } from "./types/response";
import axios, { AxiosRequestConfig } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import TOTP from 'totp-generator';
import { URL } from "./constants";
import { AuthenticateResponse, AuthenticateRequest, ChartRequest, DeleteOrderRequest, ModifyOrderRequest, NewOrderRequest } from "./types/requests";
import { AvanzaError } from "./avanzaError";
export class Avanza {

  #client = wrapper(axios.create({ jar: new CookieJar() }));
  #authInfo: AuthenticateResponse;

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

  getPushSubscriptionId(): string {
    return this.#authInfo.pushSubscriptionId;
  }

  getCategorizedAccounts() {
    return this.get<CategorizedAccountsResponse>(URL.CATEGORIZEDACCOUNTS);
  }
}
