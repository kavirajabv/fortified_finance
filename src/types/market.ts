export type MarketStatus = 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'UNKNOWN';

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  timestamp: string; // ISO string
  marketStatus: MarketStatus;
  source: string; // e.g. 'Live Provider' | 'DEMO MARKET DATA'
  isDelayed: boolean;
  isStale: boolean;
  isDemo?: boolean;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
}

export interface GoldPrice {
  symbol: string;
  name: string;
  price: number; // in INR
  unit: string; // '10g (24K Gold)'
  currency: string; // 'INR'
  change: number;
  changePercent: number;
  timestamp: string;
  marketStatus: MarketStatus;
  source: string;
  isDelayed: boolean;
  isStale: boolean;
  isDemo?: boolean;
}

export interface NormalizedMarketOverview {
  success: boolean;
  timestamp: string;
  marketStatus: MarketStatus;
  marketStatusMessage: string;
  marketHoursNotice: string;
  gold: GoldPrice;
  indices: MarketQuote[];
  stocks: MarketQuote[];
  providerName: string;
  isDemo: boolean;
}

export interface UserMarketSettings {
  userId: string;
  marketWatchEnabled: boolean;
  customWatchlist: string[];
  refreshIntervalMs: number;
}
