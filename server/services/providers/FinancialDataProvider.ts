/**
 * Core interface for Financial Data Providers (e.g. Account Aggregators).
 *
 * READ-ONLY ENFORCEMENT:
 * By design, this interface contains ONLY read/fetch methods for metadata,
 * consent verification, and transaction history.
 *
 * It is strictly prohibited to add transferMoney, makePayment, modifyBankAccount,
 * or withdrawMoney methods here or in any implementing class.
 */

export interface ConsentRequestParams {
  userId: string;
  institutionId?: string;
  dataRangeDays?: number;
  purpose: string;
}

export interface ConsentSession {
  consentId: string;
  consentHandle: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  redirectUrl?: string;
  createdAt: string;
  expiresAt: string;
}

export interface ProviderAccount {
  accountReference: string;
  institutionName: string;
  accountType: 'Savings' | 'Current' | 'Salary';
  maskedAccountNumber: string;
  currency: string;
  currentBalance: number;
}

export interface ProviderTransaction {
  providerTransactionId: string;
  amount: number;
  type: 'income' | 'expense';
  merchant: string;
  description: string;
  category: string;
  date: string;
  currency: string;
}

export interface FinancialDataProvider {
  readonly providerName: string;

  /**
   * Request a new read-only consent session
   */
  createConsent(params: ConsentRequestParams): Promise<ConsentSession>;

  /**
   * Check status of a user's consent authorization
   */
  getConsentStatus(consentId: string): Promise<'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'>;

  /**
   * Retrieve list of authorized financial accounts for active consent
   */
  getAccounts(consentId: string): Promise<ProviderAccount[]>;

  /**
   * Fetch read-only transaction history for a specific account reference
   */
  getTransactions(
    accountReference: string,
    consentId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<ProviderTransaction[]>;

  /**
   * Refresh an existing consent prior to expiry
   */
  refreshConsent(consentId: string): Promise<ConsentSession>;

  /**
   * Revoke consent and terminate data flow
   */
  revokeConsent(consentId: string): Promise<boolean>;
}
