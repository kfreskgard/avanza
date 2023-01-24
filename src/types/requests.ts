export interface AuthenticateRequest {
    username: string;
    password: string;
    secret: string;
}

export interface AuthenticateResponse {
    authenticationSession: string;
    pushSubscriptionId: string;
    customerId: string;
    registrationComplete: boolean;
}

export interface ChartRequest {
    instrument: string,
    resolution?: "minute" | "two_minutes" | "five_minutes" | "ten_minutes" | "thirty_minutes" | "hour" | "day",
    timePeriod?: "today" | "one_week" | "one_month" | "three_months" | "this_year" | "one_year" | "three_years" | "five_years" | "infinity",
    from?: string, //YY-MM-DD
    to?: string //YY-MM-DD
}

export interface DeleteOrderRequest {
    accountId: string;
    orderId: string;
}

export interface ModifyOrderRequest {
    orderId: string;
    price: number;
    volume: number;
    openVolume?: number | null;
    accountId: string;
    validUntil?: string;
    condition?: "NORMAL" | "FILL_OR_KILL" | "FILL_AND_KILL";
}

export interface NewOrderRequest {
    isDividendReinvestment?: boolean;
    requestId?: string;
    price: number;
    volume: number;
    openVolume?: number | null;
    accountId: string;
    side: "BUY" | "SELL";
    orderbookId: string;
    validUntil?: string;
    condition?: "NORMAL" | "FILL_OR_KILL" | "FILL_AND_KILL";
    orderShortSellIntent?: boolean;
}