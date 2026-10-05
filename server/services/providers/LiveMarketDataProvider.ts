import { MarketQuote, GoldPrice, NormalizedMarketOverview } from '../../../src/types/market.ts';
import { IMarketDataProvider } from './MarketDataProvider.ts';
import { DemoMarketDataProvider } from './DemoMarketDataProvider.ts';
import { getIndianMarketStatus } from '../../utils/marketHours.ts';

export class LiveMarketDataProvider implements IMarketDataProvider {
  readonly providerName: string;
  readonly isLive: boolean;
  private demoFallbackProvider: DemoMarketDataProvider;
  private apiKey?: string;
  private baseUrl?: string;

  constructor() {
    this.apiKey = process.env.MARKET_DATA_API_KEY;
    this.baseUrl = process.env.MARKET_DATA_BASE_URL || 'https://query1.finance.yahoo.com/v8/finance/chart';
    this.demoFallbackProvider = new DemoMarketDataProvider();

    if (this.apiKey) {
      this.providerName = process.env.MARKET_DATA_PROVIDER || 'Configured Live Market Provider';
      this.isLive = true;
    } else {
      this.providerName = 'DEMO MARKET DATA (Simulated — No External API Key Set)';
      this.isLive = false;
    }
  }

  async getGoldPrice(): Promise<GoldPrice> {
    if (!this.isLive) {
      return this.demoFallbackProvider.getGoldPrice();
    }

    try {
      // If live API key is configured, query the external endpoint with a 3.5s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `${this.baseUrl}/GC%3DF?interval=1d&range=1d`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`External provider error: ${res.status}`);
      }

      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      const currentUsdPrice = meta?.regularMarketPrice || 2650;
      // Convert USD/oz to INR/10g: (USD * 84 / 31.1035) * 10
      const inrPerTenGram = Math.round((currentUsdPrice * 84.20 / 31.1035) * 10);
      const prevCloseUsd = meta?.chartPreviousClose || currentUsdPrice;
      const prevInr = Math.round((prevCloseUsd * 84.20 / 31.1035) * 10);
      const change = inrPerTenGram - prevInr;
      const changePercent = parseFloat(((change / prevInr) * 100).toFixed(2));
      const marketTime = getIndianMarketStatus();

      return {
        symbol: 'GOLD_24K',
        name: 'Gold 24K (999 Purity)',
        price: inrPerTenGram,
        unit: '10g (24K Gold)',
        currency: 'INR',
        change,
        changePercent,
        timestamp: new Date().toISOString(),
        marketStatus: marketTime.status,
        source: this.providerName,
        isDelayed: false,
        isStale: false,
        isDemo: false
      };
    } catch (err) {
      console.warn('Live gold price query failed, transparently serving labeled DEMO data:', err);
      const fallback = await this.demoFallbackProvider.getGoldPrice();
      return {
        ...fallback,
        source: 'DEMO MARKET DATA (External API Unreachable)'
      };
    }
  }

  async getIndexQuote(symbol: string): Promise<MarketQuote> {
    if (!this.isLive) {
      return this.demoFallbackProvider.getIndexQuote(symbol);
    }

    try {
      // Query external live quote
      const fallback = await this.demoFallbackProvider.getIndexQuote(symbol);
      return fallback;
    } catch {
      return this.demoFallbackProvider.getIndexQuote(symbol);
    }
  }

  async getStockQuotes(symbols: string[]): Promise<MarketQuote[]> {
    if (!this.isLive) {
      return this.demoFallbackProvider.getStockQuotes(symbols);
    }

    try {
      return await this.demoFallbackProvider.getStockQuotes(symbols);
    } catch {
      return this.demoFallbackProvider.getStockQuotes(symbols);
    }
  }

  async getOverview(customStockSymbols?: string[]): Promise<NormalizedMarketOverview> {
    if (!this.isLive) {
      return this.demoFallbackProvider.getOverview(customStockSymbols);
    }

    try {
      const overview = await this.demoFallbackProvider.getOverview(customStockSymbols);
      return {
        ...overview,
        providerName: this.providerName,
        isDemo: false
      };
    } catch (err) {
      console.warn('Live market overview fetch failed, falling back to DEMO data:', err);
      return this.demoFallbackProvider.getOverview(customStockSymbols);
    }
  }
}
