export type AppMode = 'personal' | 'business';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferredCurrency: string;
  mode: AppMode;
  mfaEnabled: boolean;
  securityScore: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export type TransactionSource = 'CONNECTED_ACCOUNT' | 'DEMO';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  merchant: string;
  category: string;
  date: string;
  description: string;
  riskLevel: RiskLevel;
  riskReasons?: string[];
  account: string;
  source: TransactionSource;
  financialAccountId?: string;
  providerTransactionId?: string;
  importedAt?: string;
}

export type FinancialConnectionStatus =
  | 'CONNECTED — READ ONLY'
  | 'CONSENT REQUIRED'
  | 'CONSENT EXPIRED'
  | 'DISCONNECTED'
  | 'SYNCING'
  | 'SYNC FAILED'
  | 'DEMO DATA';

export interface FinancialAccount {
  id: string;
  userId: string;
  provider: 'account_aggregator' | 'demo';
  accountReference: string;
  accountType: 'Savings' | 'Current' | 'Salary';
  maskedAccountNumber: string;
  institutionName: string;
  status: FinancialConnectionStatus;
  consentId: string;
  consentStatus: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'PENDING';
  consentCreatedAt: string;
  consentExpiresAt: string;
  lastSyncedAt: string;
  balance: number;
  permissionsGranted: string[];
  permissionsDenied: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  period: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minimumStock: number;
  supplier: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  createdAt: string;
  dueDate: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
  lastOrderDate: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  type: 'transaction_anomaly' | 'phishing' | 'unusual_login' | 'url_threat' | 'credential_leak';
  timestamp: string;
  status: 'active' | 'resolved' | 'dismissed';
}

export interface ScamAnalysisResult {
  riskLevel: RiskLevel;
  confidence: number;
  category: string;
  indicators: string[];
  explanation: string;
  recommendations: string[];
}

export interface UrlScanResult {
  url: string;
  riskLevel: RiskLevel;
  sslValid: boolean;
  indicators: string[];
  explanation: string;
  recommendation: string;
}

export interface FinancialAuditLog {
  id: string;
  timestamp: string;
  action: 'CONSENT_GRANTED' | 'CONSENT_REVOKED' | 'DATA_SYNC_COMPLETED' | 'ACCOUNT_DISCONNECTED' | 'DATA_PURGED';
  details: string;
  actor: string;
}

// ==========================================
// Multi-Business Accounts & General Transfers
// ==========================================

export type TransactionCategory =
  | 'Food'
  | 'Education'
  | 'Transport'
  | 'Clothing'
  | 'Electronics'
  | 'Shopping'
  | 'Bills'
  | 'Business'
  | 'Entertainment'
  | 'Healthcare'
  | 'Others'
  | 'General Transactions';

export const PREDEFINED_CATEGORIES: TransactionCategory[] = [
  'Food',
  'Education',
  'Transport',
  'Clothing',
  'Electronics',
  'Shopping',
  'Bills',
  'Business',
  'Entertainment',
  'Healthcare',
  'Others',
  'General Transactions'
];

export interface BusinessAccount {
  id: string;
  name: string;
  type: 'Food' | 'Dress' | 'Xerox' | 'Other';
  balance: number;
  currency: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: string;
}

export interface GeneralTransaction {
  id: string;
  date: string;
  time?: string;
  fromAccountId: string;
  fromAccountName: string;
  toPerson: string;
  isUnknownPerson?: boolean;
  actualPersonName?: string;
  amount: number;
  purpose: string;
  note?: string;
  userId: string;
  createdAt: string;
}

export interface AccountCategoryMapping {
  id: string;
  userId: string;
  accountNumber: string;
  category: TransactionCategory;
  createdAt: string;
  updatedAt: string;
}

export interface AccountTransaction {
  id: string;
  accountId: string;
  accountName: string;
  itemName: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer_out';
  category: TransactionCategory;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'NetBanking';
  date: string;
  time?: string;
  userId: string;
  note?: string;
  transferId?: string;
  wasAutoCategorized?: boolean;
  categoryNeedsReview?: boolean;
  accountNumber?: string;
  merchant?: string;
}

export * from './market.ts';
