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
    orders: Order[];
    fundOrders: Order[];
    deals: Deal[];
    fundDeals: Deal[];
}

export interface Deal {
    id: string;
    account: DealAccount;
    orderbookId: string;
    volume: number;
    price: number;
    amount: number;
    time: string;
    side: OrderType;
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
    countryCode: string;
    currency: string;
    instrumentType: string;
    volumeFactor: string;
    isin?: string;
    mic?: string;
}

export enum OrderType {
    Buy = "BUY",
    Sell = "SELL",
}

export interface Order {
    account: DealAccount;
    orderId: string;
    price: number;
    amount: number;
    orderbookId: string;
    side: OrderType;
    validUntil: string;
    created: string;
    deletable: boolean;
    modifiable: boolean;
    message: string;
    state: string;
    stateText: string;
    stateMessage: string;
    orderbook: DealOrderbook;
    additionalParameters?: EmptyObject;
    visibleOnAccountDate?: string;
    stopTime?: string;
    volume?: number;
    openVolume?: number;
}

export interface EmptyObject {
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
    depositInterestRate: ValueUnit;
    loanInterestRate: ValueUnit;
    credit: ValueUnit | null;
    name: AccountName;
    status: string;
    errorStatus: string;
    overmortgaged: null;
    currencyBalances: ValueUnit[];
    overdrawn: any[];
    performance: Performance;
    settings: Settings;
    externalAccountNumber: string;
    urlParameterId: string;
    owner: boolean;
}

export interface ValueUnit {
    value: number;
    unit: string;
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
    THREE_MONTHS?: Profit;
    THREE_YEARS?: Profit;
    THIS_YEAR?: Profit;
    ONE_MONTH?: Profit;
    ONE_YEAR?: Profit;
    ALL_TIME?: Profit;
    ONE_WEEK?: Profit;
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

export interface DealEvent {
    dealId: string;
    accountId: string;
    orderbook: EventOrderbook;
    orderType: OrderType;
    price: number;
    volume: number;
    dealTime: number;
    pushAction: Action;
    orderId: string;
    sum: number;
}

export interface EventOrderbook {
    id: string;
    name: string;
    tickerSymbol: string;
    marketplaceName: string;
    countryCode: string;
    instrumentType: InstrumentTypeEnum;
    tradable: boolean;
    volumeFactor: number;
    currencyCode: string;
    flagCode: string;
}

export enum InstrumentTypeEnum {
    Certificate = "CERTIFICATE",
    Fund = "FUND",
    Stock = "STOCK",
    Unknown = "UNKNOWN",
    Warrant = "WARRANT",
}

export enum Action {
    Deleted = "DELETED",
    New = "NEW",
    Updated = "UPDATED",
}

export interface DealsResponse {
    deals: Deal[];
    fundDeals: Deal[];
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
    holdings?: Holdings;
    companyOwners: CompanyOwners;
    brokerTradeSummaries: BrokerTradeSummary[];
    dividends: Dividends;
    tradingTerms: TradingTerms;
    fundExposures: FundExposure[];
    ordersAndDeals?: OrdersAndDeals;
    esgView?: EsgView;
    trades: Trade[];
    orderDepthLevels: Level[];
    companyHoldings?: CompanyHoldings;
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
    description: string;
    ceo: string;
    chairman: string;
    totalNumberOfShares: number;
    homepage: string;
    sectorName?: string;
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
    countryCode: string;
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
    currencyCode: string;
    dividendType?: DividendType;
    exDateStatus?: string;
}

export enum DividendType {
    Bonus = "BONUS",
    Ordinary = "ORDINARY",
}

export interface EsgView {
    companyEqualityView: CompanyEqualityView;
    sustainabilityDevelopmentGoals: ProductInvolvement[];
    productInvolvements: ProductInvolvement[];
}

export interface CompanyEqualityView {
    womenOnBoard: number;
    womenInSeniorManagment: number;
    womenInWorkforce: number;
    womenOnBoardYear: number;
    womenInSeniorManagmentYear: number;
    womenInWorkforceYear: number;
}

export interface ProductInvolvement {
    year: number;
    value: number;
    name: string;
    title: string;
}

export interface FundExposure {
    orderbookId: string;
    name: string;
    exposure: number;
    instrumentType?: InstrumentTypeEnum;
    countryCode?: string;
    hasPosition: boolean;
}

export interface Holdings {
    totalVolume: number;
    totalMarketValue: number;
    totalDevelopmentPercent: number;
    totalDevelopmentAmount: number;
    acquiredPrice: number;
    acquiredValue: number;
    averageAcquiredPriceOrderbookCurrency?: number;
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
    averageAcquiredPriceOrderbookCurrency?: number;
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
    deals: OrdersAndDealsDeal[];
    hasStoplossOrders: boolean;
    accounts?: OrdersAndDealsAccount[];
}

export interface OrdersAndDealsAccount {
    accountId: string;
    accountName: string;
    accountType: AccountTypeEnum;
    accountTypeName?: string;
}

export interface OrdersAndDealsDeal {
    accountId: string;
    accountName: string;
    accountType: AccountTypeEnum;
    orderType: OrderType;
    dealId: string;
    dealTimeMillis: number;
    volume: number;
    price: number;
    amount: number;
}

export interface OrdersAndDealsOrder {
    accountName: string;
    accountId: string;
    accountType: AccountTypeEnum;
    orderType: OrderType;
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
    depositoryReceipt?: boolean;
    numberOfShares: number;
    depositaryReceipt?: boolean;
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

export interface OrderBookResponse {
    id: string;
    name: string;
    isin: string;
    instrumentId: string;
    marketPlace: string;
    countryCode: string;
    orderbookStatus: string;
    tickSizeList: TickSizeList;
    collateralValue: number;
    currency: string;
    minValidUntil: string;
    maxValidUntil: string;
    instrumentType: InstrumentTypeEnum;
    volumeFactor: number;
    featureSupport: FeatureSupport;
    priceType: UnitType;
    tradingUnit: number;
    tickerSymbol: string;
}

export interface FeatureSupport {
    stopLoss: boolean;
    fillAndOrKill: boolean;
    openVolume: boolean;
    marketTrades: boolean;
    marketTradesSummary: boolean;
}

export interface TickSizeList {
    tickSizeEntries: TickSizeEntry[];
}

export interface TickSizeEntry {
    min: number;
    max: number;
    tick: number;
}

export interface OrderDepthResponse {
    receivedTime: number;
    levels: Level[];
}

export interface OrderEvent {
    id: string;
    accountId: string;
    orderbook: EventOrderbook;
    currentVolume: number;
    openVolume: null;
    price: number;
    validDate: string;
    type: OrderType;
    state: State;
    action: Action;
    modifiable: boolean;
    deletable: boolean;
    sum: number;
    visibleDate: null;
    orderDateTime: number;
    eventTimeStamp: number;
    uniqueId: string;
    additionalParameters?: null;
}

export interface State {
    value: string;
    description: string;
    name: string;
}

export interface OrdersResponse {
    orders: Order[];
    fundOrders: Order[];
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
    currency: string;
    isin: string;
    volumeFactor: number;
}

export interface InstrumentOrderbook {
    id: string;
    flagCode: null | string;
    name: string;
    type: InstrumentTypeEnum;
    tradeStatus: string;
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

export interface Turnover {
    volume: ValueUnit;
    value: ValueUnit | null;
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
    configurationResponse: EmptyObject;
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
    currency: string;
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
    flagCode: string;
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
    tradable: string;
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
    currency: string;
}

export interface Report {
    date: string;
    reportType: string;
}

export interface Listing {
    shortName: string;
    tickerSymbol: string;
    countryCode: string;
    currency: string;
    marketPlaceCode: string;
    marketPlaceName: string;
    marketListName?: string;
    tickSizeListId: string;
    marketTradesAvailable: boolean;
}
