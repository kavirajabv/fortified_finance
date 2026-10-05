import type {
  FinancialDataProvider,
  ConsentRequestParams,
  ConsentSession,
  ProviderAccount,
  ProviderTransaction
} from './FinancialDataProvider.ts';

/**
 * DemoFinancialProvider:
 * Compliant sandbox provider that simulates an Account Aggregator consent flow.
 * Used when production credentials are not injected.
 *
 * Core Security:
 * Strictly provides read-only statements.
 * Never requests or collects internet banking passwords, PINs, OTPs, or CVVs.
 */
export class DemoFinancialProvider implements FinancialDataProvider {
  readonly providerName = 'Account Aggregator Sandbox (Read-Only Demo Provider)';

  async createConsent(params: ConsentRequestParams): Promise<ConsentSession> {
    const consentId = `consent_demo_${Date.now()}`;
    return {
      consentId,
      consentHandle: `handle_${Date.now()}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString()
    };
  }

  async getConsentStatus(consentId: string): Promise<'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'> {
    if (consentId.includes('expired')) return 'EXPIRED';
    if (consentId.includes('revoked')) return 'REVOKED';
    return 'ACTIVE';
  }

  async getAccounts(consentId: string): Promise<ProviderAccount[]> {
    return [
      {
        accountReference: 'HDFC-AA-REF-892110',
        institutionName: 'HDFC Bank',
        accountType: 'Savings',
        maskedAccountNumber: '••4092',
        currency: 'INR',
        currentBalance: 82450
      },
      {
        accountReference: 'ICICI-AA-REF-319904',
        institutionName: 'ICICI Bank',
        accountType: 'Savings',
        maskedAccountNumber: '••8114',
        currency: 'INR',
        currentBalance: 31250
      }
    ];
  }

  async getTransactions(
    accountReference: string,
    consentId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<ProviderTransaction[]> {
    if (accountReference.includes('ICICI')) {
      return [
        {
          providerTransactionId: 'TXN-ICICI-001',
          amount: 18000,
          type: 'income',
          merchant: 'CloudCraft Consulting Client',
          description: 'Quarterly architecture review retainer',
          category: 'freelance',
          date: '2026-10-03',
          currency: 'INR'
        },
        {
          providerTransactionId: 'TXN-ICICI-002',
          amount: 650,
          type: 'expense',
          merchant: 'Swiggy Gourmet',
          description: 'Lunch delivery - Mediterranean Bowl',
          category: 'food',
          date: '2026-10-04',
          currency: 'INR'
        },
        {
          providerTransactionId: 'TXN-ICICI-003',
          amount: 3200,
          type: 'expense',
          merchant: 'FuelStation Express',
          description: 'Weekly vehicle fuel refill',
          category: 'transport',
          date: '2026-10-03',
          currency: 'INR'
        }
      ];
    }

    return [
      {
        providerTransactionId: 'TXN-HDFC-001',
        amount: 55000,
        type: 'income',
        merchant: 'FinTech Innovations Inc',
        description: 'Monthly payroll deposit',
        category: 'salary',
        date: '2026-10-01',
        currency: 'INR'
      },
      {
        providerTransactionId: 'TXN-HDFC-002',
        amount: 27500,
        type: 'expense',
        merchant: 'Offshore Remit Ltd (Unverified Gateway)',
        description: 'Urgent overseas remittance flagged for abnormal spending jump',
        category: 'international transfer',
        date: '2026-10-04',
        currency: 'INR'
      },
      {
        providerTransactionId: 'TXN-HDFC-003',
        amount: 2499,
        type: 'expense',
        merchant: 'Amazon Retail India',
        description: 'Ergonomic mousepad & wireless desktop charger',
        category: 'shopping',
        date: '2026-10-04',
        currency: 'INR'
      },
      {
        providerTransactionId: 'TXN-HDFC-004',
        amount: 12500,
        type: 'expense',
        merchant: 'Prestige Apartments HOA',
        description: 'Monthly residential maintenance & utilities',
        category: 'housing',
        date: '2026-10-02',
        currency: 'INR'
      },
      {
        providerTransactionId: 'TXN-HDFC-005',
        amount: 4200,
        type: 'expense',
        merchant: 'FitPro Athletic Club',
        description: 'Gym & wellness membership',
        category: 'health',
        date: '2026-10-02',
        currency: 'INR'
      }
    ];
  }

  async refreshConsent(consentId: string): Promise<ConsentSession> {
    return {
      consentId,
      consentHandle: `handle_refreshed_${Date.now()}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString()
    };
  }

  async revokeConsent(consentId: string): Promise<boolean> {
    return true;
  }
}
