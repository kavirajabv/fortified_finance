import { MarketQuote, GoldPrice, NormalizedMarketOverview } from '../../../src/types/market.ts';

/**
 * Common symbol mapping layer.
 * Translates FortiFi's standard internal symbols to provider-specific tickers.
 */
export const SYMBOL_MAP: Record<string, { name: string; nseSymbol: string; bseCode: string; yahooSymbol: string; category: 'index' | 'stock' | 'commodity' }> = {
  // Indices
  'NIFTY50': { name: 'NIFTY 50', nseSymbol: '^NSEI', bseCode: 'NIFTY50', yahooSymbol: '^NSEI', category: 'index' },
  'NIFTYBANK': { name: 'NIFTY BANK', nseSymbol: '^NSEBANK', bseCode: 'BANKNIFTY', yahooSymbol: '^NSEBANK', category: 'index' },
  'SENSEX': { name: 'S&P BSE SENSEX', nseSymbol: '^BSESN', bseCode: 'SENSEX', yahooSymbol: '^BSESN', category: 'index' },

  // Commodity
  'GOLD_24K': { name: 'Gold 24K (999 Purity)', nseSymbol: 'GOLD', bseCode: 'GOLD', yahooSymbol: 'GC=F', category: 'commodity' },

  // Important Indian Stocks (NIFTY 50 Heavyweights)
  'RELIANCE': { name: 'Reliance Industries Ltd.', nseSymbol: 'RELIANCE.NS', bseCode: '500325', yahooSymbol: 'RELIANCE.NS', category: 'stock' },
  'TCS': { name: 'Tata Consultancy Services', nseSymbol: 'TCS.NS', bseCode: '532540', yahooSymbol: 'TCS.NS', category: 'stock' },
  'HDFCBANK': { name: 'HDFC Bank Ltd.', nseSymbol: 'HDFCBANK.NS', bseCode: '500180', yahooSymbol: 'HDFCBANK.NS', category: 'stock' },
  'INFY': { name: 'Infosys Ltd.', nseSymbol: 'INFY.NS', bseCode: '500209', yahooSymbol: 'INFY.NS', category: 'stock' },
  'ICICIBANK': { name: 'ICICI Bank Ltd.', nseSymbol: 'ICICIBANK.NS', bseCode: '532174', yahooSymbol: 'ICICIBANK.NS', category: 'stock' },
  'BHARTIARTL': { name: 'Bharti Airtel Ltd.', nseSymbol: 'BHARTIARTL.NS', bseCode: '532454', yahooSymbol: 'BHARTIARTL.NS', category: 'stock' },
  'ITC': { name: 'ITC Ltd.', nseSymbol: 'ITC.NS', bseCode: '500875', yahooSymbol: 'ITC.NS', category: 'stock' },
  'SBIN': { name: 'State Bank of India', nseSymbol: 'SBIN.NS', bseCode: '500112', yahooSymbol: 'SBIN.NS', category: 'stock' },
  'LT': { name: 'Larsen & Toubro Ltd.', nseSymbol: 'LT.NS', bseCode: '500510', yahooSymbol: 'LT.NS', category: 'stock' },
  'AXISBANK': { name: 'Axis Bank Ltd.', nseSymbol: 'AXISBANK.NS', bseCode: '532215', yahooSymbol: 'AXISBANK.NS', category: 'stock' },

  // Additional popular Indian stocks
  'TATAMOTORS': { name: 'Tata Motors Ltd.', nseSymbol: 'TATAMOTORS.NS', bseCode: '500570', yahooSymbol: 'TATAMOTORS.NS', category: 'stock' },
  'WIPRO': { name: 'Wipro Ltd.', nseSymbol: 'WIPRO.NS', bseCode: '507685', yahooSymbol: 'WIPRO.NS', category: 'stock' },
  'MARUTI': { name: 'Maruti Suzuki India Ltd.', nseSymbol: 'MARUTI.NS', bseCode: '532500', yahooSymbol: 'MARUTI.NS', category: 'stock' },
  'SUNPHARMA': { name: 'Sun Pharmaceutical Ltd.', nseSymbol: 'SUNPHARMA.NS', bseCode: '524715', yahooSymbol: 'SUNPHARMA.NS', category: 'stock' }
};

export interface IMarketDataProvider {
  readonly providerName: string;
  readonly isLive: boolean;

  /**
   * Retrieves current 24 Karat gold rate in INR per 10 grams.
   */
  getGoldPrice(): Promise<GoldPrice>;

  /**
   * Retrieves normalized index quote (e.g. NIFTY50, NIFTYBANK, SENSEX).
   */
  getIndexQuote(symbol: string): Promise<MarketQuote>;

  /**
   * Retrieves quotes for multiple stock symbols.
   */
  getStockQuotes(symbols: string[]): Promise<MarketQuote[]>;

  /**
   * Retrieves complete overview (Indices, Gold, Major Indian Stocks).
   */
  getOverview(customStockSymbols?: string[]): Promise<NormalizedMarketOverview>;
}
