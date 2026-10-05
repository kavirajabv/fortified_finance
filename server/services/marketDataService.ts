import { NormalizedMarketOverview, GoldPrice, MarketQuote, UserMarketSettings, MarketStatus } from '../../src/types/market.ts';
import { IMarketDataProvider } from './providers/MarketDataProvider.ts';
import { LiveMarketDataProvider } from './providers/LiveMarketDataProvider.ts';
import { getIndianMarketStatus, MarketTimeDetails } from '../utils/marketHours.ts';

interface CacheItem<T> {
  data: T;
  cachedAt: number;
}

export class MarketDataService {
  private static provider: IMarketDataProvider = new LiveMarketDataProvider();
  private static cache: Map<string, CacheItem<any>> = new Map();
  private static CACHE_TTL_MS = 15000; // 15 seconds cache to protect API rate limits
  private static STALE_THRESHOLD_MS = 120000; // 2 minutes threshold for stale indicator

  // Persistent in-memory user preferences
  // Default: marketWatchEnabled = false to prevent unwanted network usage
  private static userSettingsStore: Map<string, UserMarketSettings> = new Map([
    ['usr_001', { userId: 'usr_001', marketWatchEnabled: false, customWatchlist: [], refreshIntervalMs: 30000 }],
    ['usr_002', { userId: 'usr_002', marketWatchEnabled: false, customWatchlist: [], refreshIntervalMs: 30000 }],
    ['usr_isolated_empty', { userId: 'usr_isolated_empty', marketWatchEnabled: false, customWatchlist: [], refreshIntervalMs: 30000 }]
  ]);

  /**
   * Set custom provider for testing or external switching
   */
  static setProvider(newProvider: IMarketDataProvider) {
    this.provider = newProvider;
    this.cache.clear();
  }

  /**
   * Retrieve user preference for Market Watch
   */
  static getUserSettings(userId: string): UserMarketSettings {
    const existing = this.userSettingsStore.get(userId);
    if (existing) return existing;

    const defaultSetting: UserMarketSettings = {
      userId,
      marketWatchEnabled: false, // Default is OFF
      customWatchlist: [],
      refreshIntervalMs: 30000
    };
    this.userSettingsStore.set(userId, defaultSetting);
    return defaultSetting;
  }

  /**
   * Update user preference for Market Watch
   */
  static updateUserSettings(userId: string, updates: Partial<UserMarketSettings>): UserMarketSettings {
    const current = this.getUserSettings(userId);
    const updated: UserMarketSettings = {
      userId,
      marketWatchEnabled: updates.marketWatchEnabled !== undefined ? updates.marketWatchEnabled : current.marketWatchEnabled,
      customWatchlist: updates.customWatchlist !== undefined ? updates.customWatchlist : (current.customWatchlist || []),
      refreshIntervalMs: updates.refreshIntervalMs !== undefined ? updates.refreshIntervalMs : (current.refreshIntervalMs || 30000)
    };
    this.userSettingsStore.set(userId, updated);
    return updated;
  }

  /**
   * Check if data is stale
   */
  private static checkIsStale(timestampIso: string): boolean {
    const age = Date.now() - new Date(timestampIso).getTime();
    return age > this.STALE_THRESHOLD_MS;
  }

  /**
   * Get Indian market status and trading hours
   */
  static getMarketStatus(): MarketTimeDetails {
    return getIndianMarketStatus();
  }

  /**
   * Retrieves gold price with in-memory caching and stale detection
   */
  static async getGoldPrice(): Promise<GoldPrice> {
    const cacheKey = 'gold_price';
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.cachedAt < this.CACHE_TTL_MS) {
      return {
        ...cached.data,
        isStale: this.checkIsStale(cached.data.timestamp)
      };
    }

    const gold = await this.provider.getGoldPrice();
    this.cache.set(cacheKey, { data: gold, cachedAt: now });
    return gold;
  }

  /**
   * Retrieves index quote with in-memory caching
   */
  static async getIndexQuote(symbol: string): Promise<MarketQuote> {
    const cleanSym = symbol.toUpperCase().trim();
    const cacheKey = `idx_${cleanSym}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.cachedAt < this.CACHE_TTL_MS) {
      return {
        ...cached.data,
        isStale: this.checkIsStale(cached.data.timestamp)
      };
    }

    const quote = await this.provider.getIndexQuote(cleanSym);
    this.cache.set(cacheKey, { data: quote, cachedAt: now });
    return quote;
  }

  /**
   * Retrieves stock quotes with in-memory caching
   */
  static async getStockQuotes(symbols: string[]): Promise<MarketQuote[]> {
    return this.provider.getStockQuotes(symbols);
  }

  /**
   * Retrieves complete market overview for the authenticated user
   */
  static async getOverview(userId: string): Promise<NormalizedMarketOverview> {
    const settings = this.getUserSettings(userId);
    const watchlist = Array.isArray(settings.customWatchlist) ? settings.customWatchlist : [];
    const cacheKey = `overview_${[...watchlist].sort().join('_')}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.cachedAt < this.CACHE_TTL_MS) {
      const data: NormalizedMarketOverview = cached.data;
      return {
        ...data,
        gold: {
          ...data.gold,
          isStale: this.checkIsStale(data.gold.timestamp)
        },
        indices: data.indices.map((idx) => ({
          ...idx,
          isStale: this.checkIsStale(idx.timestamp)
        })),
        stocks: data.stocks.map((stk) => ({
          ...stk,
          isStale: this.checkIsStale(stk.timestamp)
        }))
      };
    }

    const overview = await this.provider.getOverview(watchlist);
    this.cache.set(cacheKey, { data: overview, cachedAt: now });
    return overview;
  }
}
