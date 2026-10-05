import React, { useState } from 'react';
import {
  Building2,
  Plus,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Utensils,
  Shirt,
  Printer,
  Briefcase,
  Search,
  Filter,
  Tag,
  Clock,
  Edit2,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { BusinessAccount, AccountTransaction, TransactionCategory, AccountCategoryMapping } from '../types';

interface AccountsViewProps {
  accounts: BusinessAccount[];
  transactions: AccountTransaction[];
  selectedAccountId?: string;
  learnedAccountMappings?: AccountCategoryMapping[];
  onSelectAccount: (accountId: string) => void;
  onOpenTransferModal: (accountId?: string) => void;
  onOpenAddTransactionModal: (accountId?: string) => void;
  onOpenEditCategoryModal: (transaction: AccountTransaction) => void;
  onAddNewAccount: (account: Omit<BusinessAccount, 'id' | 'createdAt'>) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  selectedAccountId,
  learnedAccountMappings = [],
  onSelectAccount,
  onOpenTransferModal,
  onOpenAddTransactionModal,
  onOpenEditCategoryModal,
  onAddNewAccount
}) => {
  const [activeAccountId, setActiveAccountId] = useState<string>(
    selectedAccountId || accounts[0]?.id || 'acc_food'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'expense' | 'income' | 'transfer_out'>('ALL');
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<BusinessAccount['type']>('Other');
  const [newAccountBalance, setNewAccountBalance] = useState('10000');

  const currentAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  // Transactions belonging strictly to this account
  const accountTransactions = transactions.filter((t) => t.accountId === currentAccount?.id);

  // Compute metrics for this specific account
  const totalIncome = accountTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = accountTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransfers = accountTransactions
    .filter((t) => t.type === 'transfer_out')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filtered transactions
  const filteredTransactions = accountTransactions.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.itemName.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) {
      return false;
    }
    if (typeFilter !== 'ALL' && t.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'food':
        return Utensils;
      case 'dress':
        return Shirt;
      case 'xerox':
        return Printer;
      default:
        return Briefcase;
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    onAddNewAccount({
      name: newAccountName.trim(),
      type: newAccountType,
      balance: parseFloat(newAccountBalance) || 0,
      currency: '₹',
      color: 'cyan',
      description: `${newAccountName} business operations`
    });

    setIsNewAccountModalOpen(false);
    setNewAccountName('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Business Accounts</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Isolated bookkeeping per business — transactions and balances stay strictly within their account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTransferModal(currentAccount?.id)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-950 transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Money</span>
          </button>
          <button
            onClick={() => onOpenAddTransactionModal(currentAccount?.id)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Account Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          const isSelected = acc.id === currentAccount?.id;
          return (
            <button
              key={acc.id}
              onClick={() => {
                setActiveAccountId(acc.id);
                onSelectAccount(acc.id);
              }}
              className={`p-3 rounded-2xl border text-left flex items-center gap-3 min-w-[200px] transition shrink-0 ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  acc.type === 'Food'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : acc.type === 'Dress'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : acc.type === 'Xerox'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">{acc.name}</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  ₹{acc.balance.toLocaleString()}
                </span>
              </div>
            </button>
          );
        })}

        {/* Add Account Button */}
        <button
          onClick={() => setIsNewAccountModalOpen(true)}
          className="p-3 rounded-2xl border border-dashed border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/40 text-slate-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 min-w-[160px] justify-center transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Selected Account Overview Hero Card */}
      {currentAccount && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                {React.createElement(getAccountIcon(currentAccount.type), { className: 'w-6 h-6' })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white">{currentAccount.name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {currentAccount.type} Account
                  </span>
                </div>
                <p className="text-xs text-slate-400">{currentAccount.description}</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-400 block">Available Balance</span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                ₹{currentAccount.balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Account Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Income</span>
              </span>
              <span className="text-base font-bold font-mono text-emerald-400 block">
                ₹{totalIncome.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>Internal Expenses</span>
              </span>
              <span className="text-base font-bold font-mono text-rose-300 block">
                ₹{totalExpenses.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>Account Transfers</span>
              </span>
              <span className="text-base font-bold font-mono text-cyan-300 block">
                ₹{totalTransfers.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                <span>Transactions</span>
              </span>
              <span className="text-base font-bold font-mono text-white block">
                {accountTransactions.length} records
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Account Transaction History & Filtering */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">
              {currentAccount?.name} Transactions
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
              {filteredTransactions.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search item, category, note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
              <option value="transfer_out">Transfers Only</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
          {filteredTransactions.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No transactions recorded in this account</p>
              <p className="text-xs text-slate-500">
                Click &quot;Record Transaction&quot; to add an expense with automatic category detection.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Item / Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTransactions.map((tx) => {
                    const isTransfer = tx.type === 'transfer_out';
                    const isExpense = tx.type === 'expense';
                    const isGeneralCategory = tx.category === 'General Transactions';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                          <div>{tx.date}</div>
                          {tx.time && <div className="text-[10px] text-slate-500 font-mono">{tx.time}</div>}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                            {isTransfer && <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                            <span>{tx.itemName}</span>
                            {tx.accountNumber && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
                                A/C: {tx.accountNumber}
                              </span>
                            )}
                          </div>
                          {tx.note && tx.note !== '-' && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{tx.note}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {isGeneralCategory ? (
                            <button
                              onClick={() => onOpenEditCategoryModal(tx)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1 transition"
                              title="Click to assign to a specific category"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>General Transactions</span>
                              <Edit2 className="w-2.5 h-2.5 ml-0.5 text-amber-400" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenEditCategoryModal(tx)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500/50 flex items-center gap-1 transition"
                            >
                              <Tag className="w-2.5 h-2.5 text-cyan-400" />
                              <span>{tx.category}</span>
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {tx.paymentMethod}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold">
                          {isTransfer ? (
                            <span className="text-cyan-400">-₹{tx.amount.toLocaleString()}</span>
                          ) : isExpense ? (
                            <span className="text-rose-400">-₹{tx.amount.toLocaleString()}</span>
                          ) : (
                            <span className="text-emerald-400">+₹{tx.amount.toLocaleString()}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => onOpenEditCategoryModal(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Learned Account Mappings Panel (Section 2, 3, 5) */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-sm">Learned Account Number Mappings</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {learnedAccountMappings.length} Learned
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Account numbers mapped here auto-categorize future transactions
          </span>
        </div>

        {learnedAccountMappings.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 text-center">
            No account numbers learned yet. When you edit any transaction with an account number (e.g. XXXX1234) from General Transactions into a specific category, it will appear here permanently.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {learnedAccountMappings.map((m) => (
              <div
                key={m.id || m.accountNumber}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-white block">{m.accountNumber}</span>
                  <span className="text-[10px] text-slate-500">Learned for this user</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {m.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Account Modal */}
      {isNewAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 relative text-slate-200 space-y-4">
            <button
              onClick={() => setIsNewAccountModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create Business Account</h3>
                <p className="text-xs text-slate-400">Add another separate business ledger</p>
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Account Name</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="e.g. Stationery Business, Bakery Account"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Category Type</label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Food">Food / Restaurant</option>
                  <option value="Dress">Dress / Boutique</option>
                  <option value="Xerox">Xerox / Printing</option>
                  <option value="Other">Other Business</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Starting Balance (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newAccountBalance}
                  onChange={(e) => setNewAccountBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewAccountModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
