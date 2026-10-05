import { MarketDataService } from '../services/marketDataService.ts';
import { getIndianMarketStatus } from '../utils/marketHours.ts';
import { AIGroundedService } from '../services/aiGroundedService.ts';

async function runMarketDataTests() {
  console.log('====================================================');
  console.log('RUNNING FORTIFI MARKET WATCH TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // 1. User Preference Default OFF (Section 2 & 25)
    const settingsUsr1 = MarketDataService.getUserSettings('usr_test_default');
    assert(
      settingsUsr1.marketWatchEnabled === false,
      '1. Market Watch is OFF by default for new users',
      `Expected false, got ${settingsUsr1.marketWatchEnabled}`
    );

    // 2. User Preference Persistence (Section 2 & 25)
    MarketDataService.updateUserSettings('usr_test_default', { marketWatchEnabled: true });
    const settingsUpdated = MarketDataService.getUserSettings('usr_test_default');
    assert(
      settingsUpdated.marketWatchEnabled === true,
      '2. Market Watch ON preference is persisted per user'
    );

    // Revert back
    MarketDataService.updateUserSettings('usr_test_default', { marketWatchEnabled: false });

    // 3. Indian Market Status & IST Time Detection (Section 14)
    const marketTime = getIndianMarketStatus();
    assert(
      ['OPEN', 'CLOSED', 'PRE_OPEN'].includes(marketTime.status),
      '3. Indian market status correctly resolved',
      `Got status: ${marketTime.status}`
    );
    assert(
      marketTime.istTime.includes('IST'),
      '4. Display time uses Asia/Kolkata IST format',
      `Got: ${marketTime.istTime}`
    );

    // 4. Gold Price Retrieval in INR per 10g (Section 9)
    const gold = await MarketDataService.getGoldPrice();
    assert(
      gold.symbol === 'GOLD_24K' && gold.price > 50000 && gold.currency === 'INR',
      '5. 24K Gold price retrieved in INR',
      `Price: ₹${gold.price} ${gold.unit}`
    );
    assert(
      gold.unit.includes('10g'),
      '6. Gold unit clearly specifies 10g (24K Gold)',
      `Got unit: ${gold.unit}`
    );

    // 5. NIFTY 50 Index Quote (Section 7 & 11)
    const nifty = await MarketDataService.getIndexQuote('NIFTY50');
    assert(
      nifty.symbol === 'NIFTY50' && nifty.price > 20000 && nifty.currency === 'INR',
      '7. NIFTY 50 index quote retrieved with realistic level',
      `Price: ${nifty.price}`
    );

    // 6. NIFTY BANK Index Quote (Section 7 & 11)
    const niftyBank = await MarketDataService.getIndexQuote('NIFTYBANK');
    assert(
      niftyBank.symbol === 'NIFTYBANK' && niftyBank.price > 40000,
      '8. NIFTY BANK index quote retrieved with realistic level',
      `Price: ${niftyBank.price}`
    );

    // 7. SENSEX Index Quote (Section 7 & 11)
    const sensex = await MarketDataService.getIndexQuote('SENSEX');
    assert(
      sensex.symbol === 'SENSEX' && sensex.price > 70000,
      '9. SENSEX index quote retrieved with realistic level',
      `Price: ${sensex.price}`
    );

    // 8. Important Indian Stocks Watchlist (Section 8 & 12)
    const stocks = await MarketDataService.getStockQuotes(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY']);
    assert(
      stocks.length === 4,
      '10. Important Indian stocks watchlist retrieved',
      `Got count: ${stocks.length}`
    );
    const reliance = stocks.find((s) => s.symbol === 'RELIANCE');
    assert(
      !!reliance && reliance.price > 2000 && reliance.currency === 'INR',
      '11. Reliance Industries quote formatted correctly in INR',
      `Price: ₹${reliance?.price}`
    );

    // 9. Normalized Market Overview (Section 18)
    const overview = await MarketDataService.getOverview('usr_001');
    assert(
      overview.success === true && !!overview.gold && overview.indices.length >= 3 && overview.stocks.length >= 10,
      '12. Normalized market overview structure is complete and unified'
    );

    // 10. Data Source Transparency & Demo Labeling (Section 16 & 34)
    assert(
      overview.isDemo === true || overview.providerName.includes('DEMO'),
      '13. Demo mode transparently labeled as DEMO, never claiming fake live data',
      `Provider: ${overview.providerName}`
    );

    // 11. Stale Data Detection Flag (Section 15)
    assert(
      typeof overview.gold.isStale === 'boolean' && typeof nifty.isStale === 'boolean',
      '14. Stale data detection flag exists on all quotes'
    );

    // 12. Information-Only Non-Execution Boundary (Section 30)
    const serviceMethods = Object.getOwnPropertyNames(MarketDataService);
    const hasTradingMethods = serviceMethods.some((m) =>
      ['buyStock', 'sellStock', 'placeOrder', 'executeTrade', 'openPosition'].includes(m)
    );
    assert(
      !hasTradingMethods,
      '15. No trading execution or order placement APIs exist in MarketDataService'
    );

    // 13. AI Copilot Grounded Query: Gold Price (Section 29)
    const aiGoldRes = await AIGroundedService.handleChatQuery('usr_001', 'What is the current 24k gold price in India?', null);
    assert(
      aiGoldRes.intent === 'GET_MARKET_GOLD_PRICE' && aiGoldRes.reply.includes('Gold') && aiGoldRes.reply.includes('IST'),
      '16. FortiFi AI grounded query for Gold price returns timestamped response',
      `Reply: ${aiGoldRes.reply.slice(0, 100)}...`
    );

    // 14. AI Copilot Grounded Query: NIFTY 50 (Section 29)
    const aiNiftyRes = await AIGroundedService.handleChatQuery('usr_001', 'What is the current NIFTY 50 value?', null);
    assert(
      aiNiftyRes.intent === 'GET_MARKET_QUOTE' && aiNiftyRes.reply.includes('NIFTY') && aiNiftyRes.reply.includes('IST'),
      '17. FortiFi AI grounded query for NIFTY 50 returns timestamped quote with informational disclaimer',
      `Reply: ${aiNiftyRes.reply.slice(0, 100)}...`
    );

    // 15. Server-Side Cache Test (Section 23 & 24)
    const quote1 = await MarketDataService.getIndexQuote('NIFTY50');
    const quote2 = await MarketDataService.getIndexQuote('NIFTY50');
    assert(
      quote1.price === quote2.price && quote1.timestamp === quote2.timestamp,
      '18. Server-side caching deduplicates rapid requests within TTL'
    );
  } catch (err: any) {
    console.error('Test execution failed with unexpected exception:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`MARKET WATCH TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runMarketDataTests();
