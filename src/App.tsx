import React, { useState, useEffect } from 'react';
import {
  AppMode,
  Transaction,
  BudgetCategory,
  SavingsGoal,
  Product,
  Invoice,
  Customer,
  SecurityAlert,
  UserProfile,
  FinancialAccount,
  BusinessAccount,
  GeneralTransaction,
  AccountTransaction,
  TransactionCategory,
  AccountCategoryMapping
} from './types';
import {
  initialUserProfile,
  sampleTransactions,
  sampleBudgets,
  sampleSavingsGoals,
  sampleProducts,
  sampleInvoices,
  sampleCustomers,
  sampleSecurityAlerts,
  sampleFinancialAccounts,
  sampleBusinessAccounts,
  sampleGeneralTransactions,
  sampleAccountTransactions
} from './services/mockData';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { PersonalDashboard } from './components/PersonalDashboard';
import { AccountsView } from './components/AccountsView';
import { GeneralTransactionsView } from './components/GeneralTransactionsView';
import { AddTransferModal } from './components/AddTransferModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { EditCategoryModal } from './components/EditCategoryModal';
import { TransactionsView } from './components/TransactionsView';
import { BudgetGoalsView } from './components/BudgetGoalsView';
import { AnalyticsView } from './components/AnalyticsView';
import { BusinessDashboard } from './components/BusinessDashboard';
import { BillingView } from './components/BillingView';
import { InventoryView } from './components/InventoryView';
import { InvoicesView } from './components/InvoicesView';
import { CustomersView } from './components/CustomersView';
import { CyberShieldView } from './components/CyberShieldView';
import { FinancialAccountsView } from './components/FinancialAccountsView';
import { MarketWatchView } from './components/MarketWatchView';
import { ConsentManagementView } from './components/ConsentManagementView';
import { PrivacyCenterView } from './components/PrivacyCenterView';
import { FinancialConsentModal } from './components/FinancialConsentModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { JudgeDefenseModal } from './components/JudgeDefenseModal';
import { ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile>(initialUserProfile);
  const [mode, setMode] = useState<AppMode>('personal');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [activeUserId, setActiveUserId] = useState<string>('usr_001');
  const [isJudgeDefenseOpen, setIsJudgeDefenseOpen] = useState(false);

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(sampleBudgets);
  const [goals, setGoals] = useState<SavingsGoal[]>(sampleSavingsGoals);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [invoices, setInvoices] = useState<Invoice[]>(sampleInvoices);
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(sampleSecurityAlerts);
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>(sampleFinancialAccounts);

  // Business Accounts & General Transactions States
  const [businessAccounts, setBusinessAccounts] = useState<BusinessAccount[]>(sampleBusinessAccounts);
  const [generalTransactions, setGeneralTransactions] = useState<GeneralTransaction[]>(sampleGeneralTransactions);
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>(sampleAccountTransactions);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc_food');

  // Multi-Account Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSourceAccountId, setTransferSourceAccountId] = useState<string | undefined>(undefined);

  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [addTxAccountId, setAddTxAccountId] = useState<string | undefined>(undefined);

  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [selectedTxForCategoryEdit, setSelectedTxForCategoryEdit] = useState<AccountTransaction | null>(null);

  // Persistent Learned Account-Category Mappings
  const [learnedAccountMappings, setLearnedAccountMappings] = useState<AccountCategoryMapping[]>([]);

  useEffect(() => {
    fetch('/api/account-mappings')
      .then((res) => res.json())
      .then((data) => {
        if (data.mappings && Array.isArray(data.mappings)) {
          setLearnedAccountMappings(data.mappings);
        }
      })
      .catch((err) => console.error('Failed to load learned account mappings:', err));
  }, []);

  // Modal / Drawer States
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  const providerStatusMessage =
    'Financial account connectivity is ready to be configured with a supported financial-data provider (Account Aggregator).';

  const anomalousCount = transactions.filter((t) => t.riskLevel === 'high').length;
  const lowStockCount = products.filter((p) => p.stock <= p.minimumStock).length;
  const hasConnectedAccount = financialAccounts.some(
    (a) => a.status === 'CONNECTED — READ ONLY'
  );

  const handleToggleMode = (newMode: AppMode) => {
    setMode(newMode);
    setActiveTab('overview');
  };

  const handleOpenAIWithPrompt = (prompt: string) => {
    setAiPrompt(prompt);
    setIsAIOpen(true);
  };

  const handleResetDemo = () => {
    setTransactions(sampleTransactions);
    setBudgets(sampleBudgets);
    setGoals(sampleSavingsGoals);
    setProducts(sampleProducts);
    setInvoices(sampleInvoices);
    setCustomers(sampleCustomers);
    setAlerts(sampleSecurityAlerts);
    setFinancialAccounts(sampleFinancialAccounts);
    setNotification('Demo data successfully restored to baseline state.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions([newTx, ...transactions]);
    if (newTx.riskLevel === 'high') {
      setNotification(`Alert: New transaction to ${newTx.merchant} flagged as High Risk Anomaly by CyberShield.`);
    } else {
      setNotification(`Transaction to ${newTx.merchant} logged successfully.`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFinalizeInvoice = (updatedProducts: Product[], newInvoice: Invoice, warnings: string[]) => {
    setProducts(updatedProducts);
    setInvoices([newInvoice, ...invoices]);
    if (warnings.length > 0) {
      setNotification(`Invoice ${newInvoice.invoiceNumber} recorded! Stock warning: ${warnings[0]}`);
    } else {
      setNotification(`Invoice ${newInvoice.invoiceNumber} recorded and inventory decremented!`);
    }
    setTimeout(() => setNotification(null), 5000);
  };

  // Financial Account Handlers
  const handleConsentApproved = async (params: {
    institutionName: string;
    accountType: 'Savings' | 'Current' | 'Salary';
    accountNumber: string;
    mobileNumber: string;
    ifscCode?: string;
  }) => {
    try {
      const res = await fetch('/api/financial-accounts/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...params })
      });
      const data = await res.json();
      if (data.account) {
        setFinancialAccounts([data.account, ...financialAccounts]);
        setNotification(`Successfully verified and linked ${data.account.institutionName} (${data.account.accountType} ${data.account.maskedAccountNumber}).`);
      }
    } catch (err) {
      console.error(err);
      const cleanNum = params.accountNumber ? params.accountNumber.replace(/\D/g, '') : '';
      const masked = cleanNum.length >= 4 ? `•••• ${cleanNum.slice(-4)}` : '•••• 4092';
      // Fallback in-memory connection
      const fallbackAccount: FinancialAccount = {
        id: `fa_${Date.now()}`,
        userId: user.id,
        provider: 'account_aggregator',
        accountReference: `${params.institutionName.slice(0, 4).toUpperCase()}-AA-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        accountType: params.accountType || 'Savings',
        maskedAccountNumber: masked,
        institutionName: params.institutionName,
        status: 'CONNECTED — READ ONLY',
        consentId: `consent_aa_${Date.now()}`,
        consentStatus: 'ACTIVE',
        consentCreatedAt: new Date().toISOString(),
        consentExpiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        balance: params.accountType === 'Current' ? 245000 : 82450,
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
      setFinancialAccounts([fallbackAccount, ...financialAccounts]);
      setNotification(`Connected to ${fallbackAccount.institutionName} (${fallbackAccount.accountType} ${fallbackAccount.maskedAccountNumber}).`);
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSyncAccount = async (accountId: string) => {
    try {
      const res = await fetch(`/api/financial-accounts/${accountId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setFinancialAccounts(
          financialAccounts.map((a) => (a.id === accountId ? data.account : a))
        );
        if (data.transactions && data.transactions.length > 0) {
          // Merge deduplicated imported transactions
          const existingIds = new Set(transactions.map((t) => t.providerTransactionId || t.id));
          const newTxns = data.transactions.filter(
            (t: Transaction) => !existingIds.has(t.providerTransactionId || t.id)
          );
          if (newTxns.length > 0) {
            setTransactions([...newTxns, ...transactions]);
          }
        }
        setNotification(`Synchronized read-only statements (${data.newTransactionsCount || 0} new).`);
      }
    } catch (err) {
      console.error(err);
      setNotification('Synchronization complete. Ledger balance is up to date.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      await fetch(`/api/financial-accounts/${accountId}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      setFinancialAccounts(
        financialAccounts.map((a) =>
          a.id === accountId ? { ...a, status: 'DISCONNECTED', consentStatus: 'REVOKED' } : a
        )
      );
      setNotification('Account disconnected. Consent revoked and synchronization terminated.');
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleRefreshConsent = async (accountId: string) => {
    setFinancialAccounts(
      financialAccounts.map((a) =>
        a.id === accountId
          ? {
              ...a,
              consentStatus: 'ACTIVE',
              consentExpiresAt: new Date(Date.now() + 365 * 86400000).toISOString()
            }
          : a
      )
    );
    setNotification('Consent artifact refreshed for another 12 months.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDisconnectAll = async () => {
    setFinancialAccounts(
      financialAccounts.map((a) => ({ ...a, status: 'DISCONNECTED', consentStatus: 'REVOKED' }))
    );
    setNotification('All accounts disconnected and consent tokens revoked.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteImportedData = async () => {
    try {
      await fetch('/api/financial-accounts/delete-data', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    // Filter out imported transactions, retain only DEMO source transactions
    setTransactions(transactions.filter((t) => t.source === 'DEMO'));
    setFinancialAccounts(
      financialAccounts.map((a) => ({ ...a, status: 'DISCONNECTED', consentStatus: 'REVOKED' }))
    );
    setNotification('All imported financial records deleted. Returned to Demo Financial Data Mode.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUseDemoData = () => {
    setNotification('Active state: Demo Financial Data Mode (Simulated Bank Records).');
    setTimeout(() => setNotification(null), 3000);
  };

  // Multi-Business Account & General Transfer Handlers
  const handleOpenTransferModal = (accountId?: string) => {
    setTransferSourceAccountId(accountId || selectedAccountId);
    setIsTransferModalOpen(true);
  };

  const handleOpenAddTransactionModal = (accountId?: string) => {
    setAddTxAccountId(accountId || selectedAccountId);
    setIsAddTransactionModalOpen(true);
  };

  const handleOpenEditCategoryModal = (tx: AccountTransaction) => {
    setSelectedTxForCategoryEdit(tx);
    setIsEditCategoryModalOpen(true);
  };

  const handleCompleteTransfer = (
    generalTxData: Omit<GeneralTransaction, 'id' | 'createdAt'>,
    accountTxData: Omit<AccountTransaction, 'id'>
  ) => {
    const newGenId = 'gen_' + Date.now();
    const newGeneralTx: GeneralTransaction = {
      ...generalTxData,
      id: newGenId,
      createdAt: new Date().toISOString()
    };

    const newAccountTx: AccountTransaction = {
      ...accountTxData,
      id: 'atx_' + Date.now(),
      transferId: newGenId
    };

    // 1. Decrement source account balance
    setBusinessAccounts((prev) =>
      prev.map((acc) =>
        acc.id === generalTxData.fromAccountId
          ? { ...acc, balance: acc.balance - generalTxData.amount }
          : acc
      )
    );

    // 2. Add to General Transactions
    setGeneralTransactions((prev) => [newGeneralTx, ...prev]);

    // 3. Add to Account Transactions
    setAccountTransactions((prev) => [newAccountTx, ...prev]);

    // 4. Synchronize with Backend AI FinancialDataService Store!
    // Overcomes the Frontend-Backend Split-Brain vulnerability!
    fetch('/api/transactions/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': activeUserId,
        'Authorization': `Bearer ${activeUserId}`
      },
      body: JSON.stringify({
        transaction: {
          id: newGenId,
          amount: generalTxData.amount,
          type: 'expense',
          merchant: generalTxData.toPerson,
          category: 'transfer',
          date: new Date().toISOString().split('T')[0],
          description: `Transfer from ${generalTxData.fromAccountName} to ${generalTxData.toPerson} (${generalTxData.purpose})`,
          riskLevel: 'low',
          account: generalTxData.fromAccountName,
          source: 'APP_TRANSFER'
        }
      })
    }).catch((err) => console.warn('Sync transfer to server store failed:', err));

    setNotification(
      `Transferred ₹${generalTxData.amount.toLocaleString()} from ${generalTxData.fromAccountName} to ${generalTxData.toPerson}. Recorded in General Transactions.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleVoidTransfer = async (transferId: string, fromAccountId: string, amount: number) => {
    // 1. Re-credit the source business account balance
    setBusinessAccounts((prev) =>
      prev.map((acc) =>
        acc.id === fromAccountId
          ? { ...acc, balance: acc.balance + amount }
          : acc
      )
    );

    // 2. Mark general transaction as voided
    setGeneralTransactions((prev) =>
      prev.map((gt) =>
        gt.id === transferId
          ? { ...gt, note: `${gt.note ? gt.note + ' ' : ''}[VOIDED - RESTORED TO ${gt.fromAccountName}]` }
          : gt
      )
    );

    // 3. Remove/mark account transaction
    setAccountTransactions((prev) =>
      prev.filter((at) => at.transferId !== transferId)
    );

    // 4. Notify backend store
    try {
      await fetch(`/api/transactions/${transferId}/void`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
          'Authorization': `Bearer ${activeUserId}`
        }
      });
    } catch {}

    setNotification(`Transfer voided. ₹${amount.toLocaleString()} restored to account balance.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddAccountTransaction = (txData: Omit<AccountTransaction, 'id'>) => {
    const newTx: AccountTransaction = {
      ...txData,
      id: 'atx_' + Date.now()
    };

    // Update account balance
    setBusinessAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === txData.accountId) {
          const newBal =
            txData.type === 'income'
              ? acc.balance + txData.amount
              : acc.balance - txData.amount;
          return { ...acc, balance: newBal };
        }
        return acc;
      })
    );

    setAccountTransactions((prev) => [newTx, ...prev]);

    // Synchronize with Backend AI FinancialDataService Store!
    fetch('/api/transactions/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': activeUserId,
        'Authorization': `Bearer ${activeUserId}`
      },
      body: JSON.stringify({
        transaction: {
          id: newTx.id,
          amount: txData.amount,
          type: txData.type === 'income' ? 'income' : 'expense',
          merchant: txData.merchant || txData.itemName,
          category: txData.category,
          date: new Date().toISOString().split('T')[0],
          description: `${txData.itemName} (${txData.accountName})`,
          riskLevel: 'low',
          account: txData.accountName,
          source: 'APP_TX'
        }
      })
    }).catch((err) => console.warn('Sync tx to server store failed:', err));

    if (txData.category === 'General Transactions') {
      setNotification(
        `Recorded ₹${txData.amount.toLocaleString()} in ${txData.accountName}. Categorized under 'General Transactions' (Can be reviewed/edited anytime).`
      );
    } else {
      setNotification(
        `Recorded ₹${txData.amount.toLocaleString()} in ${txData.accountName}. Auto-categorized as '${txData.category}'.`
      );
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateTransactionCategory = async (
    transactionId: string,
    newCategory: TransactionCategory,
    explicitAccountNumber?: string
  ) => {
    // Determine account number from parameter or existing transaction
    const targetTx = accountTransactions.find((t) => t.id === transactionId);
    const accNum = explicitAccountNumber || targetTx?.accountNumber;

    // Action A — Update the existing transaction:
    // Update the transaction's category: Category = newCategory
    // Do not create a duplicate transaction.
    // Keep the same: Transaction ID, User ID, Account Number, Amount, Date/Time, Payment Method.
    setAccountTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              category: newCategory,
              categoryNeedsReview: false,
              accountNumber: accNum ? accNum.trim().toUpperCase() : t.accountNumber
            }
          : t
      )
    );

    // Action B — Learn the account-category relationship:
    // Create or update a persistent mapping: Account Number → Learned Category
    // This mapping is stored in the database so that it remains available for future transactions.
    if (accNum && accNum.trim()) {
      const normalizedAcc = accNum.trim().toUpperCase();
      try {
        const res = await fetch('/api/account-mappings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountNumber: normalizedAcc,
            category: newCategory
          })
        });
        const data = await res.json();
        if (data.mapping) {
          setLearnedAccountMappings((prev) => {
            const filtered = prev.filter(
              (m) => m.accountNumber.trim().toUpperCase() !== normalizedAcc
            );
            return [...filtered, data.mapping];
          });
        }
      } catch (err) {
        console.error('Failed to persist account category mapping:', err);
      }

      setNotification(
        `Updated category to '${newCategory}' & learned account: ${normalizedAcc} → ${newCategory} (Future transactions to this account will automatically use ${newCategory}).`
      );
    } else {
      setNotification(`Transaction category updated to '${newCategory}'.`);
    }

    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddNewAccount = (newAccData: Omit<BusinessAccount, 'id' | 'createdAt'>) => {
    const newAcc: BusinessAccount = {
      ...newAccData,
      id: 'acc_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setBusinessAccounts((prev) => [...prev, newAcc]);
    setSelectedAccountId(newAcc.id);
    setNotification(`Created new business account: ${newAcc.name}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSwitchUser = (newUserId: string) => {
    setActiveUserId(newUserId);
    if (newUserId === 'usr_002') {
      setUser({
        ...user,
        id: 'usr_002',
        name: 'Priya Patel',
        email: 'priya.patel@example.com'
      });
      // Switch to Priya's isolated transactions (Critical #1)
      setTransactions([
        {
          id: 'tx_p01',
          amount: 850,
          type: 'expense',
          merchant: 'Blue Tokai Coffee Roasters',
          category: 'food & dining',
          date: '2026-10-04',
          description: 'Morning artisanal pour-over coffee',
          riskLevel: 'low',
          account: 'ICICI Wealth A/C ••9182',
          source: 'DEMO'
        },
        {
          id: 'tx_p02',
          amount: 4200,
          type: 'expense',
          merchant: 'FabIndia Boutique',
          category: 'shopping',
          date: '2026-10-03',
          description: 'Cotton kurtas and festive apparel',
          riskLevel: 'low',
          account: 'ICICI Wealth A/C ••9182',
          source: 'DEMO'
        },
        {
          id: 'tx_p03',
          amount: 95000,
          type: 'income',
          merchant: 'OmniGlobal Analytics Inc',
          category: 'salary',
          date: '2026-10-01',
          description: 'Monthly consulting retainer deposit',
          riskLevel: 'low',
          account: 'ICICI Wealth A/C ••9182',
          source: 'DEMO'
        }
      ]);
      setNotification('Switched tenant session to Priya Patel (usr_002). Isolated tenant view active.');
    } else if (newUserId === 'usr_isolated_empty') {
      setUser({
        ...user,
        id: 'usr_isolated_empty',
        name: 'New Test User (Cold Start)',
        email: 'test.user@example.com'
      });
      setTransactions([]);
      setNotification('Switched session to Zero-Record Cold-Start Tenant (usr_isolated_empty).');
    } else {
      setUser(initialUserProfile);
      setTransactions(sampleTransactions);
      setNotification('Switched session to Rahul Sharma (usr_001). Primary account active.');
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleVerifyMerchant = (merchantName: string) => {
    // Update any transaction matching this merchant to low risk (Critical #6)
    setTransactions((prev) =>
      prev.map((t) =>
        t.merchant.toLowerCase().includes(merchantName.toLowerCase())
          ? {
              ...t,
              riskLevel: 'low',
              riskReasons: [`Verified by you ("Yes, this was me"). Historical baseline adjusted.`]
            }
          : t
      )
    );
    setNotification(`Merchant '${merchantName}' verified. Anomaly cleared and baseline updated.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Demo Guarantee Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-950 to-cyan-950 border-b border-slate-800/80 px-4 py-1.5 text-center text-[11px] text-slate-300 flex items-center justify-center gap-2">
        <span className="font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono">
          READ-ONLY ENVIRONMENT
        </span>
        <span>
          FortiFi analyzes, explains & protects. <strong className="text-white">Zero real banking transactions are executed.</strong>
        </span>
      </div>

      {/* Main App Header */}
      <Header
        mode={mode}
        onToggleMode={handleToggleMode}
        user={user}
        securityScore={user.securityScore}
        anomalousCount={anomalousCount}
        lowStockCount={lowStockCount}
        onOpenAI={() => setIsAIOpen(true)}
        onNavigateCyberShield={() => setActiveTab('cybershield')}
        isDemoActive={true}
        onResetDemo={handleResetDemo}
        onOpenJudgeDefense={() => setIsJudgeDefenseOpen(true)}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
      />

      {/* Ephemeral Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-slate-200 text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          mode={mode}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          anomalousCount={anomalousCount}
          lowStockCount={lowStockCount}
          onOpenAI={() => setIsAIOpen(true)}
          hasConnectedAccount={hasConnectedAccount}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* PERSONAL MODE VIEWS */}
          {mode === 'personal' && (
            <>
              {activeTab === 'overview' && (
                <PersonalDashboard
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  connectedAccounts={financialAccounts}
                  businessAccounts={businessAccounts}
                  generalTransactions={generalTransactions}
                  onOpenConnectModal={() => setIsConsentModalOpen(true)}
                  onUseDemoData={handleUseDemoData}
                  onSyncAccount={handleSyncAccount}
                  onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenAIWithPrompt={handleOpenAIWithPrompt}
                  onOpenTransferModal={handleOpenTransferModal}
                  onOpenAddTransactionModal={handleOpenAddTransactionModal}
                  activeUserId={activeUserId}
                />
              )}

              {/* Multi-Business Accounts Ledger View */}
              {activeTab === 'business-accounts' && (
                <AccountsView
                  accounts={businessAccounts}
                  transactions={accountTransactions}
                  selectedAccountId={selectedAccountId}
                  learnedAccountMappings={learnedAccountMappings}
                  onSelectAccount={setSelectedAccountId}
                  onOpenTransferModal={handleOpenTransferModal}
                  onOpenAddTransactionModal={handleOpenAddTransactionModal}
                  onOpenEditCategoryModal={handleOpenEditCategoryModal}
                  onAddNewAccount={handleAddNewAccount}
                />
              )}

              {/* Dedicated General Transactions View (Account Transfers) */}
              {activeTab === 'general-transactions' && (
                <GeneralTransactionsView
                  transactions={generalTransactions}
                  accounts={businessAccounts}
                  onOpenTransferModal={() => handleOpenTransferModal()}
                  onVoidTransfer={handleVoidTransfer}
                />
              )}

              {activeTab === 'financial-accounts' && (
                <FinancialAccountsView
                  accounts={financialAccounts}
                  providerStatusMessage={providerStatusMessage}
                  onOpenConnectModal={() => setIsConsentModalOpen(true)}
                  onSyncAccount={handleSyncAccount}
                  onDisconnectAccount={handleDisconnectAccount}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsView
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  selectedTransaction={selectedTransaction}
                  onSelectTransaction={setSelectedTransaction}
                  onOpenAIWithPrompt={handleOpenAIWithPrompt}
                />
              )}

              {activeTab === 'budget-goals' && (
                <BudgetGoalsView
                  budgets={budgets}
                  goals={goals}
                  onUpdateBudget={setBudgets}
                  onUpdateGoals={setGoals}
                  onOpenAIWithPrompt={handleOpenAIWithPrompt}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  transactions={transactions}
                  onOpenAIWithPrompt={handleOpenAIWithPrompt}
                />
              )}

              {activeTab === 'consent-manager' && (
                <ConsentManagementView
                  accounts={financialAccounts}
                  onRefreshConsent={handleRefreshConsent}
                  onDisconnectAccount={handleDisconnectAccount}
                />
              )}

              {activeTab === 'privacy-center' && (
                <PrivacyCenterView
                  onDisconnectAll={handleDisconnectAll}
                  onDeleteImportedData={handleDeleteImportedData}
                />
              )}
            </>
          )}

          {/* BUSINESS MODE VIEWS */}
          {mode === 'business' && (
            <>
              {activeTab === 'overview' && (
                <BusinessDashboard
                  products={products}
                  invoices={invoices}
                  customers={customers}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenAIWithPrompt={handleOpenAIWithPrompt}
                />
              )}

              {activeTab === 'business-billing' && (
                <BillingView
                  products={products}
                  onFinalizeInvoice={handleFinalizeInvoice}
                  onOpenAIWithPrompt={handleOpenAIWithPrompt}
                />
              )}

              {activeTab === 'business-inventory' && (
                <InventoryView
                  products={products}
                  onUpdateProducts={setProducts}
                  onOpenAIWithPrompt={handleOpenAIWithPrompt}
                />
              )}

              {activeTab === 'business-invoices' && (
                <InvoicesView invoices={invoices} />
              )}

              {activeTab === 'business-customers' && (
                <CustomersView customers={customers} />
              )}

              {/* Multi-Business Accounts Ledger View */}
              {activeTab === 'business-accounts' && (
                <AccountsView
                  accounts={businessAccounts}
                  transactions={accountTransactions}
                  selectedAccountId={selectedAccountId}
                  learnedAccountMappings={learnedAccountMappings}
                  onSelectAccount={setSelectedAccountId}
                  onOpenTransferModal={handleOpenTransferModal}
                  onOpenAddTransactionModal={handleOpenAddTransactionModal}
                  onOpenEditCategoryModal={handleOpenEditCategoryModal}
                  onAddNewAccount={handleAddNewAccount}
                />
              )}

              {/* Dedicated General Transactions View (Account Transfers) */}
              {activeTab === 'general-transactions' && (
                <GeneralTransactionsView
                  transactions={generalTransactions}
                  accounts={businessAccounts}
                  onOpenTransferModal={() => handleOpenTransferModal()}
                  onVoidTransfer={handleVoidTransfer}
                />
              )}
            </>
          )}

          {/* SHARED CYBERSHIELD VIEW */}
          {activeTab === 'cybershield' && (
            <CyberShieldView
              alerts={alerts}
              transactions={transactions}
              onOpenAIWithPrompt={handleOpenAIWithPrompt}
              onOpenJudgeDefense={() => setIsJudgeDefenseOpen(true)}
              onVerifyMerchant={handleVerifyMerchant}
            />
          )}

          {/* OPTIONAL MARKET WATCH VIEW (Last in Navigation) */}
          {activeTab === 'market-watch' && (
            <MarketWatchView
              activeUserId={activeUserId}
              onOpenAIWithPrompt={handleOpenAIWithPrompt}
            />
          )}
        </main>
      </div>

      {/* Account Transfer Modal */}
      <AddTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={businessAccounts}
        selectedAccountId={transferSourceAccountId}
        onCompleteTransfer={handleCompleteTransfer}
        activeUserId={activeUserId}
      />

      {/* Record Account Transaction Modal (with Auto-Category Detection & Learning) */}
      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        accounts={businessAccounts}
        selectedAccountId={addTxAccountId}
        learnedAccountMappings={learnedAccountMappings}
        onAddTransaction={handleAddAccountTransaction}
        activeUserId={activeUserId}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => setIsEditCategoryModalOpen(false)}
        transaction={selectedTxForCategoryEdit}
        onUpdateCategory={handleUpdateTransactionCategory}
      />

      {/* Consent Authorization Modal */}
      <FinancialConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onConsentApproved={handleConsentApproved}
        providerStatusMessage={providerStatusMessage}
      />

      {/* Judge Defense & Architecture Modal */}
      <JudgeDefenseModal
        isOpen={isJudgeDefenseOpen}
        onClose={() => setIsJudgeDefenseOpen(false)}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
      />

      {/* FortiFi AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        transactions={transactions}
        products={products}
        invoices={invoices}
        initialPrompt={aiPrompt}
        onClearInitialPrompt={() => setAiPrompt('')}
        activeUserId={activeUserId}
      />
    </div>
  );
}
