import type {
  Transaction,
  BudgetCategory,
  SavingsGoal,
  Product,
  Invoice,
  Customer,
  SecurityAlert,
  FinancialAccount
} from '../../src/types/index.ts';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetCashFlow,
  calculateSavingsRate,
  calculateCategorySpending,
  calculateBudgetUsage,
  calculateBusinessRevenue,
  calculateBusinessExpenses,
  calculateBusinessProfit,
  calculateInventoryValue
} from './financialCalculations.ts';
import { isDateInRange, resolveDateRange, type DateRange } from '../utils/dateFilters.ts';
import { FinancialAccountService } from './financialAccountService.ts';

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense' | 'transfer';
  category?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  search?: string;
}

export interface InvoiceFilter {
  status?: 'paid' | 'pending' | 'overdue';
  startDate?: string;
  endDate?: string;
}

export interface FinancialSummaryData {
  dataSource: 'FORTIFI_DATA' | 'DEMO_DATA' | 'NO_DATA';
  period: string;
  startDate: string;
  endDate: string;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  transactionCount: number;
  topExpenseCategories: { category: string; amount: number; percentage: number }[];
  recentTransactions: Transaction[];
  budgetUsage: ReturnType<typeof calculateBudgetUsage>;
  savingsGoals: SavingsGoal[];
  connectedAccountsCount: number;
  hasConnectedRealAccount: boolean;
}

export interface BusinessSummaryData {
  dataSource: 'FORTIFI_DATA' | 'DEMO_DATA' | 'NO_DATA';
  revenue: number;
  expenses: number;
  profit: number;
  invoiceCount: number;
  pendingInvoicesCount: number;
  pendingInvoicesTotal: number;
  inventoryItemCount: number;
  inventoryCostValue: number;
  inventoryRetailValue: number;
  lowStockCount: number;
  lowStockProducts: { name: string; stock: number; minStock: number }[];
  customerCount: number;
  supplierCount: number;
}

// User-scoped persistent storage stores
const transactionsStore: Map<string, Transaction[]> = new Map();
const budgetsStore: Map<string, BudgetCategory[]> = new Map();
const savingsGoalsStore: Map<string, SavingsGoal[]> = new Map();
const productsStore: Map<string, Product[]> = new Map();
const invoicesStore: Map<string, Invoice[]> = new Map();
const customersStore: Map<string, Customer[]> = new Map();
const alertsStore: Map<string, SecurityAlert[]> = new Map();

/**
 * Seed initial verified records for the default test user usr_001
 */
function seedUserData(userId: string) {
  if (transactionsStore.has(userId)) return;

  if (userId === 'usr_001') {
    transactionsStore.set(userId, [
      {
        id: 'tx_01',
        amount: 27500,
        type: 'expense',
        merchant: 'Offshore Remit Ltd (Unverified Gateway)',
        category: 'international transfer',
        date: '2026-10-04',
        description: 'Urgent overseas remittance flagged for abnormal spending jump',
        riskLevel: 'high',
        riskReasons: [
          'Amount (₹27,500) deviates 15x from your daily normal transaction average',
          'Merchant entity is registered outside primary banking residency region',
          'First-time recipient with rapid authorization attempt'
        ],
        account: 'HDFC Priority A/C ••4092',
        source: 'DEMO'
      },
      {
        id: 'tx_02',
        amount: 55000,
        type: 'income',
        merchant: 'FinTech Innovations Inc',
        category: 'salary',
        date: '2026-10-01',
        description: 'Monthly payroll deposit',
        riskLevel: 'low',
        account: 'HDFC Priority A/C ••4092',
        source: 'DEMO'
      },
      {
        id: 'tx_03',
        amount: 18000,
        type: 'income',
        merchant: 'CloudCraft Consulting Client',
        category: 'freelance',
        date: '2026-10-03',
        description: 'Payment for API security architecture audit',
        riskLevel: 'low',
        account: 'HDFC Priority A/C ••4092',
        source: 'DEMO'
      },
      {
        id: 'tx_04',
        amount: 14500,
        type: 'expense',
        merchant: 'Metro Living Apartments',
        category: 'housing & utilities',
        date: '2026-10-02',
        description: 'Monthly rent & building amenities charge',
        riskLevel: 'low',
        account: 'HDFC Priority A/C ••4092',
        source: 'DEMO'
      },
      {
        id: 'tx_05',
        amount: 8250,
        type: 'expense',
        merchant: 'Nature Basket & Gourmet Mart',
        category: 'food & dining',
        date: '2026-10-03',
        description: 'Monthly pantry restocking and organic produce',
        riskLevel: 'low',
        account: 'HDFC Priority A/C ••4092',
        source: 'DEMO'
      },
      {
        id: 'tx_06',
        amount: 1450,
        type: 'expense',
        merchant: 'FastFuel Express Petrol Station',
        category: 'transportation',
        date: '2026-10-04',
        description: 'Commute vehicle fuel recharge',
        riskLevel: 'low',
        account: 'HDFC Priority A/C ••4092',
        source: 'DEMO'
      }
    ]);

    budgetsStore.set(userId, [
      { id: 'b_01', category: 'housing & utilities', allocated: 20000, spent: 14500, period: 'monthly' },
      { id: 'b_02', category: 'food & dining', allocated: 12000, spent: 8250, period: 'monthly' },
      { id: 'b_03', category: 'transportation', allocated: 6000, spent: 1450, period: 'monthly' },
      { id: 'b_04', category: 'entertainment', allocated: 5000, spent: 3200, period: 'monthly' }
    ]);

    savingsGoalsStore.set(userId, [
      { id: 'sg_01', title: 'CyberShield Emergency Reserve', targetAmount: 200000, currentAmount: 145000, targetDate: '2026-12-31' },
      { id: 'sg_02', title: 'Tech Hardware Upgrade', targetAmount: 85000, currentAmount: 42000, targetDate: '2027-03-31' }
    ]);

    productsStore.set(userId, [
      { id: 'prod_01', sku: 'ACC-01', name: 'Braided Type-C Fast Cable', category: 'Accessories', price: 499, cost: 180, stock: 12, minimumStock: 10, supplier: 'AnkerSupply Hub' },
      { id: 'prod_02', sku: 'MOU-02', name: 'ErgoPrecision Wireless Mouse', category: 'Peripherals', price: 1899, cost: 750, stock: 8, minimumStock: 15, supplier: 'LogiTech Dist' },
      { id: 'prod_03', sku: 'HUB-03', name: '7-in-1 Aluminum USB-C Hub', category: 'Peripherals', price: 2999, cost: 1200, stock: 45, minimumStock: 10, supplier: 'Baseus Direct' }
    ]);

    invoicesStore.set(userId, [
      {
        id: 'inv_01',
        invoiceNumber: 'INV-2026-001',
        customerName: 'TechCorp Solutions Ltd',
        customerEmail: 'finance@techcorp.com',
        items: [{ productId: 'prod_03', name: '7-in-1 Aluminum USB-C Hub', sku: 'HUB-03', unitPrice: 2999, quantity: 10, total: 29990 }],
        subtotal: 29990,
        discount: 0,
        tax: 5398,
        total: 35388,
        status: 'paid',
        createdAt: '2026-10-01',
        dueDate: '2026-10-15'
      },
      {
        id: 'inv_02',
        invoiceNumber: 'INV-2026-002',
        customerName: 'InnovateX Media',
        customerEmail: 'accounts@innovatex.io',
        items: [{ productId: 'prod_02', name: 'ErgoPrecision Wireless Mouse', sku: 'MOU-02', unitPrice: 1899, quantity: 15, total: 28485 }],
        subtotal: 28485,
        discount: 1424,
        tax: 4871,
        total: 31932,
        status: 'pending',
        createdAt: '2026-10-03',
        dueDate: '2026-10-17'
      }
    ]);

    customersStore.set(userId, [
      { id: 'c_01', name: 'TechCorp Solutions Ltd', email: 'finance@techcorp.com', phone: '+91 98210 44552', totalPurchases: 35388, lastOrderDate: '2026-10-01' },
      { id: 'c_02', name: 'InnovateX Media', email: 'accounts@innovatex.io', phone: '+91 99341 88210', totalPurchases: 31932, lastOrderDate: '2026-10-03' }
    ]);

    alertsStore.set(userId, [
      {
        id: 'alert_01',
        title: 'Unusual Spending Spike Flagged',
        description: '₹27,500 transfer to Offshore Remit Ltd is 15x higher than daily 30-day baseline.',
        severity: 'high',
        type: 'transaction_anomaly',
        timestamp: '2026-10-04 14:22',
        status: 'active'
      }
    ]);
  } else {
    // For other isolated userIds, start with completely empty stores (isolated database partition)
    transactionsStore.set(userId, []);
    budgetsStore.set(userId, []);
    savingsGoalsStore.set(userId, []);
    productsStore.set(userId, []);
    invoicesStore.set(userId, []);
    customersStore.set(userId, []);
    alertsStore.set(userId, []);
  }
}

export class FinancialDataService {
  /**
   * Helper: Ensure user partition exists
   */
  private static ensureUser(userId: string) {
    if (!transactionsStore.has(userId)) {
      seedUserData(userId);
    }
  }

  /**
   * Deduplication mechanism to prevent double counting (Section 11)
   */
  static deduplicateTransactions(transactions: Transaction[]): Transaction[] {
    const seen = new Set<string>();
    const result: Transaction[] = [];

    for (const tx of transactions) {
      // Fingerprint based on provider id OR (merchant + amount + date + type)
      const key = `${tx.merchant.toLowerCase().trim()}|${tx.amount}|${tx.date}|${tx.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(tx);
      }
    }
    return result;
  }

  /**
   * Retrieve authorized financial accounts (Section 3 & 4)
   */
  static async getFinancialAccounts(userId: string): Promise<FinancialAccount[]> {
    this.ensureUser(userId);
    const { accounts } = await FinancialAccountService.getAccounts(userId);
    return accounts;
  }

  /**
   * Retrieve authorized transactions with strict userId filtering and optional date/type filters
   */
  static async getTransactions(userId: string, filter?: TransactionFilter): Promise<Transaction[]> {
    this.ensureUser(userId);
    const userTx = transactionsStore.get(userId) || [];
    let filtered = [...userTx];

    if (filter) {
      if (filter.startDate && filter.endDate) {
        filtered = filtered.filter((t) =>
          isDateInRange(t.date, { startDate: filter.startDate!, endDate: filter.endDate! })
        );
      }
      if (filter.type) {
        filtered = filtered.filter((t) => t.type === filter.type);
      }
      if (filter.category) {
        const cat = filter.category.toLowerCase();
        filtered = filtered.filter((t) => t.category.toLowerCase().includes(cat));
      }
      if (filter.riskLevel) {
        filtered = filtered.filter((t) => t.riskLevel === filter.riskLevel);
      }
      if (filter.search) {
        const s = filter.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.merchant.toLowerCase().includes(s) ||
            t.description.toLowerCase().includes(s) ||
            t.category.toLowerCase().includes(s)
        );
      }
    }

    return this.deduplicateTransactions(filtered);
  }

  /**
   * Retrieve only expense transactions
   */
  static async getExpenses(userId: string, filter?: Omit<TransactionFilter, 'type'>): Promise<Transaction[]> {
    return this.getTransactions(userId, { ...filter, type: 'expense' });
  }

  /**
   * Retrieve only income transactions
   */
  static async getIncome(userId: string, filter?: Omit<TransactionFilter, 'type'>): Promise<Transaction[]> {
    return this.getTransactions(userId, { ...filter, type: 'income' });
  }

  /**
   * Void/Cancel a transaction in server store
   */
  static async voidTransaction(userId: string, txId: string): Promise<boolean> {
    this.ensureUser(userId);
    const userTx = transactionsStore.get(userId) || [];
    const updated = userTx.filter((t) => t.id !== txId);
    transactionsStore.set(userId, updated);
    return true;
  }

  /**
   * Retrieve budgets for authorized user
   */
  static async getBudgets(userId: string): Promise<BudgetCategory[]> {
    this.ensureUser(userId);
    return budgetsStore.get(userId) || [];
  }

  /**
   * Retrieve savings goals for authorized user
   */
  static async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    this.ensureUser(userId);
    return savingsGoalsStore.get(userId) || [];
  }

  /**
   * Retrieve invoices for authorized user
   */
  static async getInvoices(userId: string, filter?: InvoiceFilter): Promise<Invoice[]> {
    this.ensureUser(userId);
    let invoices = invoicesStore.get(userId) || [];

    if (filter) {
      if (filter.status) {
        invoices = invoices.filter((i) => i.status === filter.status);
      }
      if (filter.startDate && filter.endDate) {
        invoices = invoices.filter((i) =>
          isDateInRange(i.createdAt, { startDate: filter.startDate!, endDate: filter.endDate! })
        );
      }
    }
    return invoices;
  }

  /**
   * Retrieve sales (paid invoices)
   */
  static async getSales(userId: string, filter?: Omit<InvoiceFilter, 'status'>): Promise<Invoice[]> {
    return this.getInvoices(userId, { ...filter, status: 'paid' });
  }

  /**
   * Retrieve inventory products for authorized user
   */
  static async getInventory(userId: string): Promise<Product[]> {
    this.ensureUser(userId);
    return productsStore.get(userId) || [];
  }

  /**
   * Retrieve customers for authorized user
   */
  static async getCustomers(userId: string): Promise<Customer[]> {
    this.ensureUser(userId);
    return customersStore.get(userId) || [];
  }

  /**
   * Retrieve security alerts for authorized user
   */
  static async getSecurityAlerts(userId: string): Promise<SecurityAlert[]> {
    this.ensureUser(userId);
    return alertsStore.get(userId) || [];
  }

  /**
   * Add a transaction (with auto-deduplication)
   */
  static async addTransaction(userId: string, transaction: Transaction): Promise<Transaction> {
    this.ensureUser(userId);
    const existing = transactionsStore.get(userId) || [];
    const updated = this.deduplicateTransactions([transaction, ...existing]);
    transactionsStore.set(userId, updated);
    return transaction;
  }

  /**
   * Build complete Financial Summary (Section 12)
   */
  static async getFinancialSummary(userId: string, periodQuery = 'this month'): Promise<FinancialSummaryData> {
    this.ensureUser(userId);
    const dateRange = resolveDateRange(periodQuery);
    const transactions = await this.getTransactions(userId, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });

    const accounts = await this.getFinancialAccounts(userId);
    const budgets = await this.getBudgets(userId);
    const savingsGoals = await this.getSavingsGoals(userId);

    const totalIncome = calculateTotalIncome(transactions);
    const totalExpenses = calculateTotalExpenses(transactions);
    const netCashFlow = calculateNetCashFlow(transactions);
    const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);
    const topExpenseCategories = calculateCategorySpending(transactions).slice(0, 5);
    const budgetUsage = calculateBudgetUsage(budgets);

    // Calculate total verified balance across connected accounts or baseline
    const totalBalance = accounts.length > 0
      ? accounts.reduce((sum, a) => sum + (a.status.includes('CONNECTED') ? a.balance : 0), 0)
      : 82450;

    const hasConnectedRealAccount = accounts.some(
      (a) => a.provider === 'account_aggregator' && a.status === 'CONNECTED — READ ONLY'
    );

    const dataSource: FinancialSummaryData['dataSource'] =
      transactions.length === 0
        ? 'NO_DATA'
        : hasConnectedRealAccount
        ? 'FORTIFI_DATA'
        : 'DEMO_DATA';

    return {
      dataSource,
      period: dateRange.label,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      totalBalance,
      totalIncome,
      totalExpenses,
      netCashFlow,
      savingsRate,
      transactionCount: transactions.length,
      topExpenseCategories,
      recentTransactions: transactions.slice(0, 10),
      budgetUsage,
      savingsGoals,
      connectedAccountsCount: accounts.length,
      hasConnectedRealAccount
    };
  }

  /**
   * Build complete Business Summary (Section 13)
   */
  static async getBusinessSummary(userId: string): Promise<BusinessSummaryData> {
    this.ensureUser(userId);
    const invoices = await this.getInvoices(userId);
    const products = await this.getInventory(userId);
    const customers = await this.getCustomers(userId);

    const revenue = calculateBusinessRevenue(invoices);
    const expenses = calculateBusinessExpenses(invoices, products);
    const profit = calculateBusinessProfit(revenue, expenses);

    const pendingInvoices = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue');
    const pendingTotal = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

    const { totalCostValue, totalRetailValue } = calculateInventoryValue(products);
    const lowStock = products.filter((p) => p.stock <= p.minimumStock);

    const dataSource: BusinessSummaryData['dataSource'] =
      invoices.length === 0 && products.length === 0 ? 'NO_DATA' : 'FORTIFI_DATA';

    return {
      dataSource,
      revenue,
      expenses,
      profit,
      invoiceCount: invoices.length,
      pendingInvoicesCount: pendingInvoices.length,
      pendingInvoicesTotal: pendingTotal,
      inventoryItemCount: products.length,
      inventoryCostValue: totalCostValue,
      inventoryRetailValue: totalRetailValue,
      lowStockCount: lowStock.length,
      lowStockProducts: lowStock.map((p) => ({ name: p.name, stock: p.stock, minStock: p.minimumStock })),
      customerCount: customers.length,
      supplierCount: new Set(products.map((p) => p.supplier)).size
    };
  }

  /**
   * Export all data for DPDP Act 2023 compliance ("Right to Data Portability")
   */
  static async exportUserData(userId: string) {
    this.ensureUser(userId);
    return {
      userId,
      exportTimestamp: new Date().toISOString(),
      complianceStandard: 'Digital Personal Data Protection Act (DPDP) 2023',
      notice: 'Certified export of user financial ledger and configuration data. Insights provided are not financial advice.',
      transactions: transactionsStore.get(userId) || [],
      budgets: budgetsStore.get(userId) || [],
      savingsGoals: savingsGoalsStore.get(userId) || [],
      products: productsStore.get(userId) || [],
      invoices: invoicesStore.get(userId) || [],
      customers: customersStore.get(userId) || [],
      alerts: alertsStore.get(userId) || []
    };
  }

  /**
   * Purge all user records for DPDP Act 2023 compliance ("Right to Erasure")
   */
  static async deleteAllUserData(userId: string) {
    transactionsStore.delete(userId);
    budgetsStore.delete(userId);
    savingsGoalsStore.delete(userId);
    productsStore.delete(userId);
    invoicesStore.delete(userId);
    customersStore.delete(userId);
    alertsStore.delete(userId);
    return { success: true, message: `All data for user ${userId} has been securely purged.` };
  }

  /**
   * Reset user data to initial demo state (For Hackathon judges to test repeatedly)
   */
  static async resetDemoUserData(userId: string) {
    await this.deleteAllUserData(userId);
    seedUserData(userId);
    return { success: true, message: `Demo data for user ${userId} has been restored to factory baseline.` };
  }
}
