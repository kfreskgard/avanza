export interface AccountResponse {
    accountPerformance: number;
    accountPerformanceCash: number;
    startDate: number;
    endDate: number;
    earliestPossibleDate: number;
    low: HighLow;
    high: HighLow;
    tickDecimals: number;
    datePoints: Array<number[]>;
    openingHour: number;
    hasIndexToCompare: boolean;
    enoughGraphDataPointsToDisplay: boolean;
    comparePoints: ComparePoints;
    hoursOpenPerDay: number;
}

export interface ComparePoints {
    closingPrice: number;
    displayablePoints: Array<Array<DisplayablePointClass | number>>;
    orderbookName: string;
    orderbookId: string;
}

export interface DisplayablePointClass {
    date: number;
    value: number;
    highestPrice: number;
    lowestPrice: number;
    openingPrice: number;
    closingPrice: number;
    totalVolumeTraded: number;
    connectedWithPreviousDataPoint: boolean;
}

export interface HighLow {
    date: number;
    value: number;
    low: number;
    high: number;
}

export interface AccountsResponse {
    accountViews: AccountView[];
}

export interface AccountView {
    accountName: string;
    accountId: string;
    accountTypeName: string;
    name: string;
    id: string;
    type: AccountTypeEnum;
}

export enum AccountTypeEnum {
    Aktiefondkonto = "AKTIEFONDKONTO",
    Investeringssparkonto = "INVESTERINGSSPARKONTO",
    Kapitalforsakring = "KAPITALFORSAKRING",
    Kreditkonto = "KREDITKONTO",
}

export interface AllOrdersAndDealsResponse {
    orders: AllOrdersAndDealsResponseOrder[];
    fundOrders: any[];
    deals: Deal[];
    fundDeals: any[];
}

export interface Deal {
    id: string;
    account: DealAccount;
    orderbookId: string;
    volume: number;
    price: number;
    amount: number;
    time: string;
    side: string;
    orderId: string;
    orderbook: DealOrderbook;
}

export interface DealAccount {
    accountId: string;
    name: DealAccountName;
    type: TypeClass;
}

export interface DealAccountName {
    value: string;
}

export interface TypeClass {
    accountType: AccountTypeEnum;
}

export interface DealOrderbook {
    id: string;
    name: string;
    countryCode: Code;
    currency: UnitEnum;
    instrumentType: string;
    volumeFactor: string;
}

export enum Code {
    Empty = "",
    Fi = "FI",
    SE = "SE",
    Us = "US",
}

export enum UnitEnum {
    Empty = "",
    Percentage = "percentage",
    Sek = "SEK",
    Usd = "USD",
}

export interface AllOrdersAndDealsResponseOrder {
    account: DealAccount;
    orderId: string;
    volume: number;
    openVolume?: number;
    price: number;
    amount: number;
    orderbookId: string;
    side: string;
    validUntil: string;
    created: string;
    deletable: boolean;
    modifiable: boolean;
    message: string;
    state: string;
    stateText: string;
    stateMessage: string;
    orderbook: DealOrderbook;
}

export interface CategorizedAccountsResponse {
    categories: Category[];
    accounts: CategorizedAccountsResponseAccount[];
    loans: any[];
    accountsSummary: AccountsSummary;
}

export interface CategorizedAccountsResponseAccount {
    id: string;
    categoryId: string;
    balance: ValueUnit;
    profit: Profit;
    totalAcquiredValue: ValueUnit;
    type: AccountTypeEnum;
    totalValue: ValueUnit;
    buyingPower: ValueUnit;
    buyingPowerWithoutCredit: ValueUnit;
    interestRate: ValueUnit;
    depositInterestRate: ValueUnit;
    loanInterestRate: ValueUnit;
    credit: ValueUnit | null;
    name: AccountName;
    status: string;
    errorStatus: string;
    overmortgaged: boolean;
    overdrawn: boolean;
    performance: Performance;
    settings: Settings;
    clearingNumber: string;
    accountNumber: string;
    urlParameterId: string;
    owner: boolean;
}

export interface ValueUnit {
    value: number;
    unit: UnitEnum;
    unitType?: UnitType;
    decimalPrecision?: number;
}

export enum UnitType {
    Monetary = "MONETARY",
    Percentage = "PERCENTAGE",
    Unitless = "UNITLESS",
}

export interface AccountName {
    defaultName: string;
    userDefinedName: null | string;
}

export interface Performance {
    THIS_YEAR?: Profit;
    ALL_TIME?: Profit;
    ONE_YEAR?: Profit;
    THREE_YEARS?: Profit;
    ONE_MONTH?: Profit;
    ONE_WEEK?: Profit;
    THREE_MONTHS?: Profit;
}

export interface Profit {
    absolute: ValueUnit;
    relative: ValueUnit;
}

export interface Settings {
    IS_HIDDEN: boolean;
}

export interface AccountsSummary {
    performance: Performance;
    buyingPower: ValueUnit;
    totalValue: ValueUnit;
}

export interface Category {
    name: string;
    totalValue: ValueUnit;
    buyingPower: ValueUnit;
    id: string;
    profit: Profit;
    performance: Performance;
    savingsGoalView: null;
    sortOrder: number;
}

export interface ChartResponse {
    ohlc: Ohlc[];
    metadata: Metadata;
    from: string;
    to: string;
    previousClosingPrice: number;
}

export interface Metadata {
    resolution: Resolution;
}

export interface Resolution {
    chartResolution: string;
    availableResolutions: string[];
}

export interface Ohlc {
    timestamp: number;
    open: number;
    close: number;
    low: number;
    high: number;
    totalVolumeTraded: number;
}

export interface OrderResponse {
    orderRequestStatus: string;
    message: string;
    orderId?: string;
    parameters?: string[];
}

export interface DetailedStockResponse {
    stock: Stock;
    company: Company;
    companyEvents: CompanyEvents;
    companyOwners: CompanyOwners;
    brokerTradeSummaries: BrokerTradeSummary[];
    dividends: Dividends;
    tradingTerms: TradingTerms;
    fundExposures: FundExposure[];
    companyHoldings?: CompanyHoldings;
    trades: Trade[];
    orderDepthLevels: Level[];
    ordersAndDeals?: OrdersAndDeals;
    holdings?: Holdings;
}

export interface BrokerTradeSummary {
    brokerCode: string;
    sellVolume: number;
    buyVolume: number;
    netBuyVolume: number;
    brokerName: string;
}

export interface Company {
    companyId: string;
    sectorName: string;
    description: string;
    ceo: string;
    chairman: string;
    totalNumberOfShares: number;
    homepage: string;
}

export interface CompanyEvents {
    events: Event[];
}

export interface Event {
    date: string;
    type: EventType;
}

export enum EventType {
    AnnualReport = "ANNUAL_REPORT",
    GeneralMeeting = "GENERAL_MEETING",
    InterimReport = "INTERIM_REPORT",
}

export interface CompanyHoldings {
    updated: string;
    holdings: Holding[];
}

export interface Holding {
    orderbookId?: string;
    countryCode: Code;
    name: string;
    substance: number;
    hasPosition?: boolean;
}

export interface CompanyOwners {
    owners: Owner[];
    updated?: string;
}

export interface Owner {
    name: string;
    percentOfCapital: number;
    percentOfVotes: number;
}

export interface Dividends {
    events: Dividend[];
    pastEvents: Dividend[];
}

export interface Dividend {
    exDate: string;
    paymentDate?: string;
    amount: number;
    currencyCode: UnitEnum;
    dividendType?: DividendType;
    exDateStatus?: string;
}

export enum DividendType {
    Bonus = "BONUS",
    Ordinary = "ORDINARY",
}

export interface FundExposure {
    orderbookId: string;
    name: string;
    exposure: number;
    hasPosition: boolean;
}

export interface Holdings {
    totalVolume: number;
    totalMarketValue: number;
    totalDevelopmentPercent: number;
    totalDevelopmentAmount: number;
    acquiredPrice: number;
    acquiredValue: number;
    accountAndPositionsView: AccountAndPositionsView[];
}

export interface AccountAndPositionsView {
    accountId: string;
    accountName: string;
    accountType: AccountTypeEnum;
    accountTypeName: string;
    amount: number;
    volume: number;
    acquiredAmount: number;
    acquiredPrice: number;
    amountDevelopment: number;
    percentDevelopment: number;
}

export interface Level {
    buySide: Side;
    sellSide: Side;
}

export interface Side {
    price: number;
    volume: number;
}

export interface OrdersAndDeals {
    orders: OrdersAndDealsOrder[];
    deals: any[];
    hasStoplossOrders: boolean;
    accounts?: OrdersAndDealsAccount[];
}

export interface OrdersAndDealsAccount {
    accountId: string;
    accountName: string;
    accountType: AccountTypeEnum;
}

export interface OrdersAndDealsOrder {
    accountName: string;
    accountId: string;
    accountType: AccountTypeEnum;
    orderType: string;
    orderId: string;
    orderState: string;
    validUntil: string;
    volume: number;
    price: number;
    amount: number;
    message: string;
    modifiable: boolean;
    deletable: boolean;
}

export interface Stock {
    preferred: boolean;
    depositaryReceipt: boolean;
    numberOfShares: number;
}

export interface Trade {
    buyer: string;
    seller: string;
    dealTime: number;
    price: number;
    volume: number;
    matchedOnMarket: boolean;
    cancelled: boolean;
}

export interface TradingTerms {
    collateralValue: number;
    marginRequirement: number;
    shortSellable: boolean;
    superInterestApproved: boolean;
}

export interface OrderDepthResponse {
    receivedTime: number;
    levels: Level[];
}

export interface PositionsResponse {
    withOrderbook: WithOrderbook[];
    withoutOrderbook: WithOrderbook[];
    cashPositions: CashPosition[];
}

export interface CashPosition {
    account: CashPositionAccount;
    totalBalance: ValueUnit;
    id: string;
}

export interface CashPositionAccount {
    id: string;
    type: AccountTypeEnum;
    name: string;
    urlParameterId: string;
    hasCredit: boolean;
}

export interface WithOrderbook {
    account: CashPositionAccount;
    instrument: Instrument;
    volume: ValueUnit;
    value: ValueUnit;
    averageAcquiredPrice: ValueUnit;
    acquiredValue: ValueUnit;
    lastTradingDayPerformance: Profit | null;
    id: string;
}

export interface Instrument {
    type: InstrumentTypeEnum;
    name: string;
    orderbook: InstrumentOrderbook | null;
    currency: UnitEnum;
    isin: string;
    volumeFactor: number;
}

export interface InstrumentOrderbook {
    id: string;
    flagCode: Code | null;
    name: string;
    type: InstrumentTypeEnum;
    tradeStatus: Trad;
    quote: OrderbookQuote;
    turnover: Turnover;
    lastDeal: LastDeal;
}

export interface LastDeal {
    date: string;
    time: null | string;
}

export interface OrderbookQuote {
    highest: ValueUnit | null;
    lowest: ValueUnit | null;
    buy: ValueUnit | null;
    sell: ValueUnit | null;
    latest: ValueUnit;
    change: ValueUnit;
    changePercent: ValueUnit;
}

export enum Trad {
    BuyableAndSellable = "BUYABLE_AND_SELLABLE",
}

export interface Turnover {
    volume: ValueUnit;
    value: ValueUnit | null;
}

export enum InstrumentTypeEnum {
    Certificate = "CERTIFICATE",
    Fund = "FUND",
    Stock = "STOCK",
    Unknown = "UNKNOWN",
    Warrant = "WARRANT",
}

export interface QuoteResponse {
    buy?: number;
    sell?: number;
    last: number;
    highest: number;
    lowest: number;
    change: number;
    changePercent: number;
    spread?: number;
    timeOfLast: number;
    totalValueTraded: number;
    totalVolumeTraded: number;
    updated: number;
    volumeWeightedAveragePrice?: number;
}

export interface SearchResponse {
    totalNumberOfHits: number;
    resultGroups: ResultGroup[];
    pageSearchResults: PageSearchResults;
    searchQuery: string;
    urlEncodedSearchQuery: string;
    configurationResponse: ConfigurationResponse;
}

export interface ConfigurationResponse {
}

export interface PageSearchResults {
    totalNumberOfHits: number;
    numberOfHits: number;
    hits: any[];
}

export interface ResultGroup {
    instrumentType: InstrumentTypeEnum;
    numberOfHits: number;
    hits: Hit[];
    instrumentName: string;
    instrumentDisplayName: string;
}

export interface Hit {
    link: Link;
    currency: HitCurrency;
    lastPrice: string;
    todayChange: string;
    todayChangeDirection: string;
    todayChangeValue: string;
    oneQuarterAgoPrice: string;
    oneQuarterAgoChange: string;
    oneQuarterAgoChangeDirection: string;
    highlightedDisplayTitle: string;
    fundResult: FundResultClass | FundResultEnum;
}

export enum HitCurrency {
    Eur = "EUR",
    Sek = "SEK",
    Usd = "USD",
}

export interface FundResultClass {
    morningstarRating: number;
    buyable: boolean;
    fundFee: string;
    fundCategory: string;
    subFundCategory: string;
}

export enum FundResultEnum {
    Empty = "-",
}

export interface Link {
    type: InstrumentTypeEnum;
    flagCode: Code;
    orderbookId: string;
    urlDisplayName: string;
    linkDisplay: string;
    shortLinkDisplay: string;
    tradeable: boolean;
    sellable: boolean;
    buyable: boolean;
}

export interface StockResponse {
    orderbookId: string;
    name: string;
    isin: string;
    sectorName: string;
    tradable: Trad;
    listing: Listing;
    historicalClosingPrices: HistoricalClosingPrices;
    keyIndicators: KeyIndicators;
    quote: QuoteResponse;
    previousClosingPrice?: number;
    type: InstrumentTypeEnum;
}

export interface HistoricalClosingPrices {
    oneDay: number;
    oneWeek: number;
    oneMonth: number;
    threeMonths: number;
    startOfYear: number;
    oneYear: number;
    start: number;
    startDate: string;
    threeYears?: number;
    fiveYears?: number;
    tenYears?: number;
}

export interface KeyIndicators {
    numberOfOwners: number;
    directYield: number;
    volatility: number;
    priceEarningsRatio: number;
    marketCapital: PerShare;
    equityPerShare: PerShare;
    turnoverPerShare: PerShare;
    earningsPerShare: PerShare;
    dividend?: Dividend;
    dividendsPerYear: number;
    nextReport?: Report;
    previousReport: Report;
    reportDate?: string;
    priceSalesRatio?: number;
    returnOnEquity?: number;
    returnOnTotalAssets?: number;
    equityRatio?: number;
    capitalTurnover?: number;
    operatingProfitMargin?: number;
    netMargin?: number;
    beta?: number;
    interestCoverageRatio?: number;
    grossMargin?: number;
}

export interface PerShare {
    value: number;
    currency: UnitEnum;
}

export interface Report {
    date: string;
    reportType: string;
}

export interface Listing {
    shortName: string;
    tickerSymbol: string;
    countryCode: Code;
    currency: UnitEnum;
    marketPlaceCode: string;
    marketPlaceName: string;
    marketListName?: string;
    tickSizeListId: string;
    marketTradesAvailable: boolean;
}
