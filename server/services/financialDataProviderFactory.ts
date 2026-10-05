import type { FinancialDataProvider } from './providers/FinancialDataProvider.ts';
import { AccountAggregatorProvider } from './providers/AccountAggregatorProvider.ts';
import { DemoFinancialProvider } from './providers/DemoFinancialProvider.ts';

let activeProviderInstance: FinancialDataProvider | null = null;

export function getFinancialDataProvider(): {
  provider: FinancialDataProvider;
  isProductionConfigured: boolean;
  statusMessage: string;
} {
  const providerType = (process.env.FINANCIAL_DATA_PROVIDER || 'demo').toLowerCase();
  const hasClientCredentials = Boolean(
    process.env.FINANCIAL_DATA_CLIENT_ID && process.env.FINANCIAL_DATA_CLIENT_SECRET
  );

  if (providerType === 'account_aggregator' && hasClientCredentials) {
    if (!activeProviderInstance || !(activeProviderInstance instanceof AccountAggregatorProvider)) {
      activeProviderInstance = new AccountAggregatorProvider();
    }
    return {
      provider: activeProviderInstance,
      isProductionConfigured: true,
      statusMessage: 'Production Account Aggregator Gateway Active'
    };
  }

  // Graceful fallback to sandbox/demo provider
  if (!activeProviderInstance || !(activeProviderInstance instanceof DemoFinancialProvider)) {
    activeProviderInstance = new DemoFinancialProvider();
  }

  return {
    provider: activeProviderInstance,
    isProductionConfigured: false,
    statusMessage:
      'Financial account connectivity is ready to be configured with a supported financial-data provider.'
  };
}
