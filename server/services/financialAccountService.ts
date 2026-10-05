import { getFinancialDataProvider } from './financialDataProviderFactory.ts';
import type { FinancialAccount, Transaction, FinancialAuditLog } from '../../src/types/index.ts';
import { FinanceEngine } from '../../src/services/financeEngine.ts';

// Server-side in-memory persistence layer (in production, backed by Firestore collection 'financialAccounts')
let financialAccountsStore: FinancialAccount[] = [
  {
    id: 'fa_hdfc_01',
    userId: 'usr_001',
    provider: 'account_aggregator',
    accountReference: 'HDFC-AA-REF-892110',
    accountType: 'Savings',
    maskedAccountNumber: '••4092',
    institutionName: 'HDFC Bank',
    status: 'CONNECTED — READ ONLY',
    consentId: 'consent_aa_hdfc_8921',
    consentStatus: 'ACTIVE',
    consentCreatedAt: '2026-10-01T09:30:00Z',
    consentExpiresAt: '2027-10-01T09:30:00Z',
    lastSyncedAt: '05 Oct 2026, 10:15 AM',
    balance: 82450,
    permissionsGranted: [
      'Account profile and basic metadata',
      'Read-only transaction history (90 days)',
      'Account balance summary'
    ],
    permissionsDenied: [
      'Money transfer or remittance initiation',
      'Bill payments & third-party debits',
      'Account configuration & beneficiary modification',
      'Credential or authentication factor retention'
    ],
    createdAt: '2026-10-01T09:30:00Z',
    updatedAt: '2026-10-05T10:15:00Z'
  }
];

let importedTransactionsStore: Transaction[] = [];
let auditLogsStore: FinancialAuditLog[] = [
  {
    id: 'audit_01',
    timestamp: '01 Oct 2026, 09:30 AM',
    action: 'CONSENT_GRANTED',
    details: 'Read-only financial data consent granted for HDFC Bank (••4092) via Account Aggregator.',
    actor: 'usr_001'
  },
  {
    id: 'audit_02',
    timestamp: '05 Oct 2026, 10:15 AM',
    action: 'DATA_SYNC_COMPLETED',
    details: 'Synchronized 5 verified transactions. 0 credentials handled. Deterministic anomaly scan executed.',
    actor: 'System / SyncScheduler'
  }
];

export interface ConnectAccountOptions {
  institutionName?: string;
  accountType?: 'Savings' | 'Current' | 'Salary';
  accountNumber?: string;
  mobileNumber?: string;
  ifscCode?: string;
}

export class FinancialAccountService {
  /**
   * List connected accounts for user
   */
  static async getAccounts(userId: string): Promise<{
    accounts: FinancialAccount[];
    providerStatus: string;
    isProductionConfigured: boolean;
  }> {
    const { isProductionConfigured, statusMessage } = getFinancialDataProvider();
    const userAccounts = financialAccountsStore.filter((a) => a.userId === userId);
    return {
      accounts: userAccounts,
      providerStatus: statusMessage,
      isProductionConfigured
    };
  }

  /**
   * Initiate consent flow and connect an account with verified bank parameters
   */
  static async connectAccount(
    userId: string,
    options: string | ConnectAccountOptions = 'HDFC Bank'
  ): Promise<FinancialAccount> {
    const opts: ConnectAccountOptions = typeof options === 'string' ? { institutionName: options } : options;
    const { provider } = getFinancialDataProvider();

    const selectedBank = opts.institutionName || 'HDFC Bank';
    const selectedType = opts.accountType || 'Savings';
    const cleanNum = opts.accountNumber ? opts.accountNumber.replace(/\D/g, '') : '';
    const maskedNum = cleanNum.length >= 4 ? `•••• ${cleanNum.slice(-4)}` : `•••• ${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Request read-only consent session
    const consent = await provider.createConsent({
      userId,
      purpose: 'Read-only financial management and cybersecurity anomaly detection',
      dataRangeDays: 90
    });

    // 2. Derive bank code prefix for reference
    const bankPrefix = selectedBank.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'BANK';
    const accountRef = `${bankPrefix}-AA-REF-${Math.floor(100000 + Math.random() * 900000)}`;

    // Deterministic initial balance based on type or bank
    const baseBalance = selectedType === 'Current' ? 245000 : selectedType === 'Salary' ? 115200 : 78500;

    const newAccount: FinancialAccount = {
      id: `fa_${Date.now()}`,
      userId,
      provider: provider.providerName.includes('Sandbox') ? 'demo' : 'account_aggregator',
      accountReference: accountRef,
      accountType: selectedType,
      maskedAccountNumber: maskedNum,
      institutionName: selectedBank,
      status: 'CONNECTED — READ ONLY',
      consentId: consent.consentId,
      consentStatus: 'ACTIVE',
      consentCreatedAt: consent.createdAt,
      consentExpiresAt: consent.expiresAt,
      lastSyncedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      balance: baseBalance,
      permissionsGranted: [
        'Account profile and basic metadata',
        'Read-only transaction history (90 days)',
        'Account balance summary'
      ],
      permissionsDenied: [
        'Money transfer or remittance initiation',
        'Bill payments & third-party debits',
        'Account configuration & beneficiary modification',
        'Credential or authentication factor retention'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    financialAccountsStore.push(newAccount);

    // Initial sync
    await this.syncAccount(newAccount.id, userId);

    auditLogsStore.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action: 'CONSENT_GRANTED',
      details: `Read-only consent verified for ${newAccount.institutionName} (${newAccount.accountType} ${newAccount.maskedAccountNumber}) via Account Aggregator. Zero credentials stored.`,
      actor: userId
    });

    return newAccount;
  }

  /**
   * Sync transactions from provider with deduplication and risk scoring
   */
  static async syncAccount(accountId: string, userId: string): Promise<{
    account: FinancialAccount;
    newTransactionsCount: number;
    anomaliesCount: number;
    transactions: Transaction[];
  }> {
    const account = financialAccountsStore.find((a) => a.id === accountId && a.userId === userId);
    if (!account) {
      throw new Error('Account not found or access unauthorized.');
    }

    if (account.status === 'DISCONNECTED' || account.consentStatus === 'REVOKED') {
      throw new Error('Cannot sync a disconnected or revoked account connection.');
    }

    const { provider } = getFinancialDataProvider();
    account.status = 'SYNCING';

    try {
      const rawTxList = await provider.getTransactions(account.accountReference, account.consentId);

      let newCount = 0;
      let anomaliesCount = 0;
      const newImported: Transaction[] = [];

      for (const raw of rawTxList) {
        // Deduplication check: verify if providerTransactionId already exists
        const exists = importedTransactionsStore.some(
          (t) => t.providerTransactionId === raw.providerTransactionId
        );

        if (!exists) {
          // Run deterministic risk evaluation engine
          const riskEval = FinanceEngine.evaluateTransactionRisk({
            amount: raw.amount,
            merchant: raw.merchant,
            category: raw.category,
            type: raw.type
          });

          const normalizedTx: Transaction = {
            id: `tx_imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            amount: raw.amount,
            type: raw.type,
            merchant: raw.merchant,
            category: raw.category,
            date: raw.date,
            description: raw.description,
            riskLevel: riskEval.riskLevel,
            riskReasons: riskEval.reasons,
            account: `${account.institutionName} ••${account.maskedAccountNumber.slice(-4)}`,
            source: 'CONNECTED_ACCOUNT',
            financialAccountId: account.id,
            providerTransactionId: raw.providerTransactionId,
            importedAt: new Date().toISOString()
          };

          importedTransactionsStore.unshift(normalizedTx);
          newImported.push(normalizedTx);
          newCount++;
          if (normalizedTx.riskLevel === 'high') {
            anomaliesCount++;
          }
        }
      }

      account.status = 'CONNECTED — READ ONLY';
      account.lastSyncedAt = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      account.updatedAt = new Date().toISOString();

      auditLogsStore.unshift({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        action: 'DATA_SYNC_COMPLETED',
        details: `Synchronized ${newCount} new transactions for ${account.institutionName}. ${anomaliesCount} flagged for review.`,
        actor: userId
      });

      return {
        account,
        newTransactionsCount: newCount,
        anomaliesCount,
        transactions: importedTransactionsStore.filter((t) => t.financialAccountId === account.id)
      };
    } catch (err: any) {
      account.status = 'SYNC FAILED';
      throw new Error(`Synchronization failure: ${err.message || 'Provider connection error'}`);
    }
  }

  /**
   * Disconnect account and revoke consent
   */
  static async disconnectAccount(accountId: string, userId: string): Promise<boolean> {
    const account = financialAccountsStore.find((a) => a.id === accountId && a.userId === userId);
    if (!account) {
      throw new Error('Account not found or access unauthorized.');
    }

    const { provider } = getFinancialDataProvider();
    await provider.revokeConsent(account.consentId);

    account.status = 'DISCONNECTED';
    account.consentStatus = 'REVOKED';
    account.updatedAt = new Date().toISOString();

    auditLogsStore.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action: 'CONSENT_REVOKED',
      details: `Revoked consent and disconnected ${account.institutionName} (${account.maskedAccountNumber}). Synchronization stopped.`,
      actor: userId
    });

    return true;
  }

  /**
   * Privacy Center: Purge imported financial transaction data
   */
  static async deleteImportedData(userId: string): Promise<{ deletedCount: number }> {
    const initialCount = importedTransactionsStore.length;
    importedTransactionsStore = [];

    // Also mark accounts as disconnected
    for (const a of financialAccountsStore) {
      if (a.userId === userId) {
        a.status = 'DISCONNECTED';
        a.consentStatus = 'REVOKED';
      }
    }

    auditLogsStore.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action: 'DATA_PURGED',
      details: `User requested complete deletion of ${initialCount} imported financial records.`,
      actor: userId
    });

    return { deletedCount: initialCount };
  }

  static getAuditLogs(): FinancialAuditLog[] {
    return auditLogsStore;
  }

  static getImportedTransactions(accountId?: string): Transaction[] {
    if (accountId) {
      return importedTransactionsStore.filter((t) => t.financialAccountId === accountId);
    }
    return importedTransactionsStore;
  }
}
