import type {
  FinancialDataProvider,
  ConsentRequestParams,
  ConsentSession,
  ProviderAccount,
  ProviderTransaction
} from './FinancialDataProvider.ts';

/**
 * AccountAggregatorProvider:
 * Production adapter for RBI-compliant Account Aggregator (AA) architectures
 * (such as Setu, Sahamati, Anumati, Finvu, OneMoney).
 *
 * All operations are READ-ONLY and require digital user consent artifacts.
 */
export class AccountAggregatorProvider implements FinancialDataProvider {
  readonly providerName = 'Account Aggregator Gateway';

  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    this.baseUrl = process.env.FINANCIAL_DATA_BASE_URL || 'https://api.accountaggregator.example.in';
    this.clientId = process.env.FINANCIAL_DATA_CLIENT_ID || '';
    this.clientSecret = process.env.FINANCIAL_DATA_CLIENT_SECRET || '';
    this.redirectUri = process.env.FINANCIAL_DATA_REDIRECT_URI || 'http://localhost:3000/api/financial-accounts/callback';
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret && this.baseUrl);
  }

  async createConsent(params: ConsentRequestParams): Promise<ConsentSession> {
    if (!this.isConfigured()) {
      throw new Error('Account Aggregator credentials are not configured in environment variables.');
    }

    // In a live integration, this calls the AA consent endpoint
    // POST /Consent with ConsentDetail: { DataConsumer, Customer, Purpose, FIDataRange, etc. }
    const res = await fetch(`${this.baseUrl}/v1/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.clientId,
        'Authorization': `Bearer ${this.clientSecret}`
      },
      body: JSON.stringify({
        userId: params.userId,
        purpose: params.purpose,
        redirectUri: this.redirectUri,
        dataTypes: ['TRANSACTIONS', 'PROFILE', 'SUMMARY'],
        // Explicitly only asking for read-only analytical consent
        consentMode: 'VIEW',
        fetchType: 'PERIODIC',
        frequency: { unit: 'MONTH', value: 1 }
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to initiate AA consent: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      consentId: data.consentId,
      consentHandle: data.consentHandle,
      status: 'PENDING',
      redirectUrl: data.redirectUrl,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString()
    };
  }

  async getConsentStatus(consentId: string): Promise<'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'> {
    if (!this.isConfigured()) {
      return 'ACTIVE';
    }

    const res = await fetch(`${this.baseUrl}/v1/consent/${consentId}/status`, {
      headers: {
        'x-client-id': this.clientId,
        'Authorization': `Bearer ${this.clientSecret}`
      }
    });

    if (!res.ok) return 'EXPIRED';
    const data = await res.json();
    return data.status || 'ACTIVE';
  }

  async getAccounts(consentId: string): Promise<ProviderAccount[]> {
    if (!this.isConfigured()) {
      throw new Error('Account Aggregator credentials are not configured in environment variables.');
    }

    const res = await fetch(`${this.baseUrl}/v1/fi/accounts?consentId=${consentId}`, {
      headers: {
        'x-client-id': this.clientId,
        'Authorization': `Bearer ${this.clientSecret}`
      }
    });

    if (!res.ok) throw new Error('Failed to retrieve accounts from AA gateway');
    const data = await res.json();
    return data.accounts || [];
  }

  async getTransactions(
    accountReference: string,
    consentId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<ProviderTransaction[]> {
    if (!this.isConfigured()) {
      throw new Error('Account Aggregator credentials are not configured in environment variables.');
    }

    const res = await fetch(`${this.baseUrl}/v1/fi/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.clientId,
        'Authorization': `Bearer ${this.clientSecret}`
      },
      body: JSON.stringify({
        accountReference,
        consentId,
        fromDate: fromDate || new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
        toDate: toDate || new Date().toISOString().split('T')[0]
      })
    });

    if (!res.ok) throw new Error('Failed to fetch transactions from AA gateway');
    const data = await res.json();
    return data.transactions || [];
  }

  async refreshConsent(consentId: string): Promise<ConsentSession> {
    if (!this.isConfigured()) {
      throw new Error('Account Aggregator credentials are not configured in environment variables.');
    }

    const res = await fetch(`${this.baseUrl}/v1/consent/${consentId}/refresh`, {
      method: 'POST',
      headers: {
        'x-client-id': this.clientId,
        'Authorization': `Bearer ${this.clientSecret}`
      }
    });

    if (!res.ok) throw new Error('Failed to refresh AA consent');
    const data = await res.json();
    return {
      consentId: data.consentId,
      consentHandle: data.consentHandle,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString()
    };
  }

  async revokeConsent(consentId: string): Promise<boolean> {
    if (!this.isConfigured()) return true;

    const res = await fetch(`${this.baseUrl}/v1/consent/${consentId}/revoke`, {
      method: 'POST',
      headers: {
        'x-client-id': this.clientId,
        'Authorization': `Bearer ${this.clientSecret}`
      }
    });

    return res.ok;
  }
}
