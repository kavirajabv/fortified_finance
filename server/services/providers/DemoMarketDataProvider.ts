import { MarketQuote, GoldPrice, NormalizedMarketOverview } from '../../../src/types/market.ts';
import { IMarketDataProvider, SYMBOL_MAP } from './MarketDataProvider.ts';
import { getIndianMarketStatus } from '../../utils/marketHours.ts';

// Deterministic realistic baseline data for Indian Markets
interface StockBaseline {
  name: string;
  basePrice: number;
  baseChange: number;
  baseChangePercent: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
}

const BASELINE_STOCKS: Record<string, StockBaseline> = {
  'RELIANCE': { name: 'Reliance Industries Ltd.', basePrice: 2942.50, baseChange: 18.20, baseChangePercent: 0.62, dayHigh: 2955.00, dayLow: 2928.00, previousClose: 2924.30 },
  'TCS': { name: 'Tata Consultancy Services', basePrice: 4280.00, baseChange: -22.50, baseChangePercent: -0.52, dayHigh: 4310.00, dayLow: 4265.00, previousClose: 4302.50 },
  'HDFCBANK': { name: 'HDFC Bank Ltd.', basePrice: 1682.40, baseChange: 14.80, baseChangePercent: 0.89, dayHigh: 1690.00, dayLow: 1670.00, previousClose: 1667.60 },
  'INFY': { name: 'Infosys Ltd.', basePrice: 1895.20, baseChange: 12.40, baseChangePercent: 0.66, dayHigh: 1908.00, dayLow: 1880.00, previousClose: 1882.80 },
  'ICICIBANK': { name: 'ICICI Bank Ltd.', basePrice: 1248.60, baseChange: 9.30, baseChangePercent: 0.75, dayHigh: 1255.00, dayLow: 1238.00, previousClose: 1239.30 },
  'BHARTIARTL': { name: 'Bharti Airtel Ltd.', basePrice: 1642.00, baseChange: 21.00, baseChangePercent: 1.30, dayHigh: 1652.00, dayLow: 1625.00, previousClose: 1621.00 },
  'ITC': { name: 'ITC Ltd.', basePrice: 504.30, baseChange: -1.20, baseChangePercent: -0.24, dayHigh: 508.00, dayLow: 501.50, previousClose: 505.50 },
  'SBIN': { name: 'State Bank of India', basePrice: 792.10, baseChange: 6.40, baseChangePercent: 0.82, dayHigh: 796.50, dayLow: 785.00, previousClose: 785.70 },
  'LT': { name: 'Larsen & Toubro Ltd.', basePrice: 3590.00, baseChange: 35.50, baseChangePercent: 1.00, dayHigh: 3610.00, dayLow: 3560.00, previousClose: 3554.50 },
  'AXISBANK': { name: 'Axis Bank Ltd.', basePrice: 1184.20, baseChange: -4.80, baseChangePercent: -0.40, dayHigh: 1195.00, dayLow: 1178.00, previousClose: 1189.00 },
  // Additional watchable stocks
  'TATAMOTORS': { name: 'Tata Motors Ltd.', basePrice: 968.40, baseChange: 11.20, baseChangePercent: 1.17, dayHigh: 974.00, dayLow: 955.00, previousClose: 957.20 },
  'WIPRO': { name: 'Wipro Ltd.', basePrice: 532.80, baseChange: -2.10, baseChangePercent: -0.39, dayHigh: 538.00, dayLow: 529.00, previousClose: 534.90 },
  'MARUTI': { name: 'Maruti Suzuki India Ltd.', basePrice: 12450.00, baseChange: 85.00, baseChangePercent: 0.69, dayHigh: 12520.00, dayLow: 12380.00, previousClose: 12365.00 },
  'SUNPHARMA': { name: 'Sun Pharmaceutical Ltd.', basePrice: 1876.50, baseChange: 15.20, baseChangePercent: 0.82, dayHigh: 1888.00, dayLow: 1860.00, previousClose: 1861.30 }
};

const BASELINE_INDICES: Record<string, { name: string; basePrice: number; baseChange: number; baseChangePercent: number; dayHigh: number; dayLow: number; previousClose: number }> = {
  'NIFTY50': { name: 'NIFTY 50', basePrice: 24852.40, baseChange: 142.35, baseChangePercent: 0.58, dayHigh: 24910.00, dayLow: 24780.00, previousClose: 24710.05 },
  'NIFTYBANK': { name: 'NIFTY BANK', basePrice: 51420.80, baseChange: 312.60, baseChangePercent: 0.61, dayHigh: 51580.00, dayLow: 51210.00, previousClose: 51108.20 },
  'SENSEX': { name: 'S&P BSE SENSEX', basePrice: 81380.60, baseChange: 425.20, baseChangePercent: 0.53, dayHigh: 81540.00, dayLow: 81150.00, previousClose: 80955.40 }
};

export class DemoMarketDataProvider implements IMarketDataProvider {
  readonly providerName = 'DEMO MARKET DATA (Simulated)';
  readonly isLive = false;

  private getRandomMicroVariation(): number {
    // Micro jitter (-0.08% to +0.08%) to simulate realistic live movements when requested
    return (Math.random() - 0.5) * 0.0016;
  }

  async getGoldPrice(): Promise<GoldPrice> {
    const marketTime = getIndianMarketStatus();
    const baseGoldPrice = 75820; // INR per 10 grams of 24K (999 pure gold)
    const variation = this.getRandomMicroVariation();
    const currentPrice = Math.round(baseGoldPrice * (1 + variation));
    const previousClose = 75350;
    const change = currentPrice - previousClose;
    const changePercent = parseFloat(((change / previousClose) * 100).toFixed(2));

    return {
      symbol: 'GOLD_24K',
      name: 'Gold 24K (999 Purity)',
      price: currentPrice,
      unit: '10g (24K Gold)',
      currency: 'INR',
      change,
      changePercent,
      timestamp: new Date().toISOString(),
      marketStatus: marketTime.status,
      source: this.providerName,
      isDelayed: false,
      isStale: false,
      isDemo: true
    };
  }

  async getIndexQuote(symbol: string): Promise<MarketQuote> {
    const cleanSym = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const baseline = BASELINE_INDICES[cleanSym] || BASELINE_INDICES['NIFTY50'];
    const marketTime = getIndianMarketStatus();

    const variation = this.getRandomMicroVariation();
    const price = parseFloat((baseline.basePrice * (1 + variation)).toFixed(2));
    const change = parseFloat((price - baseline.previousClose).toFixed(2));
    const changePercent = parseFloat(((change / baseline.previousClose) * 100).toFixed(2));

    return {
      symbol: cleanSym,
      name: baseline.name,
      price,
      change,
      changePercent,
      currency: 'INR',
      timestamp: new Date().toISOString(),
      marketStatus: marketTime.status,
      source: this.providerName,
      isDelayed: false,
      isStale: false,
      isDemo: true,
      dayHigh: Math.max(baseline.dayHigh, price),
      dayLow: Math.min(baseline.dayLow, price),
      previousClose: baseline.previousClose
    };
  }

  async getStockQuotes(symbols: string[]): Promise<MarketQuote[]> {
    const marketTime = getIndianMarketStatus();
    const results: MarketQuote[] = [];

    for (const sym of symbols) {
      const cleanSym = sym.toUpperCase().trim();
      const baseline = BASELINE_STOCKS[cleanSym];
      if (!baseline) {
        // Fallback for custom stock
        const fallbackPrice = 1000 + Math.floor(Math.random() * 2500);
        results.push({
          symbol: cleanSym,
          name: SYMBOL_MAP[cleanSym]?.name || `${cleanSym} India`,
          price: fallbackPrice,
          change: 15.5,
          changePercent: 1.25,
          currency: 'INR',
          timestamp: new Date().toISOString(),
          marketStatus: marketTime.status,
          source: this.providerName,
          isDelayed: false,
          isStale: false,
          isDemo: true,
          previousClose: fallbackPrice - 15.5
        });
        continue;
      }

      const variation = this.getRandomMicroVariation();
      const price = parseFloat((baseline.basePrice * (1 + variation)).toFixed(2));
      const change = parseFloat((price - baseline.previousClose).toFixed(2));
      const changePercent = parseFloat(((change / baseline.previousClose) * 100).toFixed(2));

      results.push({
        symbol: cleanSym,
        name: baseline.name,
        price,
        change,
        changePercent,
        currency: 'INR',
        timestamp: new Date().toISOString(),
        marketStatus: marketTime.status,
        source: this.providerName,
        isDelayed: false,
        isStale: false,
        isDemo: true,
        dayHigh: Math.max(baseline.dayHigh, price),
        dayLow: Math.min(baseline.dayLow, price),
        previousClose: baseline.previousClose
      });
    }

    return results;
  }

  async getOverview(customStockSymbols?: string[]): Promise<NormalizedMarketOverview> {
    const marketTime = getIndianMarketStatus();
    const gold = await this.getGoldPrice();

    const indicesPromises = ['NIFTY50', 'NIFTYBANK', 'SENSEX'].map((s) => this.getIndexQuote(s));
    const indices = await Promise.all(indicesPromises);

    const defaultStocks = [
      'RELIANCE',
      'TCS',
      'HDFCBANK',
      'INFY',
      'ICICIBANK',
      'BHARTIARTL',
      'ITC',
      'SBIN',
      'LT',
      'AXISBANK'
    ];

    const finalStockSymbols = customStockSymbols && customStockSymbols.length > 0
      ? Array.from(new Set([...defaultStocks, ...customStockSymbols]))
      : defaultStocks;

    const stocks = await this.getStockQuotes(finalStockSymbols);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      marketStatus: marketTime.status,
      marketStatusMessage: marketTime.statusMessage,
      marketHoursNotice: `${marketTime.hoursNotice} • Current time: ${marketTime.istTime}`,
      gold,
      indices,
      stocks,
      providerName: this.providerName,
      isDemo: true
    };
  }
}
