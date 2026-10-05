import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Sparkles,
  AlertCircle,
  Calendar,
  Building2,
  CreditCard,
  Tag,
  Check,
  HelpCircle,
  Hash
} from 'lucide-react';
import {
  BusinessAccount,
  AccountTransaction,
  TransactionCategory,
  PREDEFINED_CATEGORIES,
  AccountCategoryMapping
} from '../types';
import { resolveCategoryWithAccountPriority } from '../services/categoryClassifier';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BusinessAccount[];
  selectedAccountId?: string;
  learnedAccountMappings?: AccountCategoryMapping[];
  onAddTransaction: (transaction: Omit<AccountTransaction, 'id'>) => void;
  activeUserId?: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  selectedAccountId,
  learnedAccountMappings = [],
  onAddTransaction,
  activeUserId = 'usr_001'
}) => {
  const [accountId, setAccountId] = useState<string>(
    selectedAccountId || accounts[0]?.id || 'acc_food'
  );
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState<TransactionCategory>('General Transactions');
  const [paymentMethod, setPaymentMethod] = useState<AccountTransaction['paymentMethod']>('UPI');
  const [date, setDate] = useState<string>('2026-10-05');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live auto-classification metadata
  const [autoClassification, setAutoClassification] = useState<ReturnType<
    typeof resolveCategoryWithAccountPriority
  > | null>(null);
  const [isManualCategoryOverride, setIsManualCategoryOverride] = useState<boolean>(false);

  // Re-run category detection whenever accountNumber, itemName, or learnedAccountMappings change
  useEffect(() => {
    if (!itemName.trim() && !accountNumber.trim()) {
      setAutoClassification(null);
      if (!isManualCategoryOverride) {
        setCategory('General Transactions');
      }
      return;
    }

    const result = resolveCategoryWithAccountPriority({
      accountNumber: accountNumber.trim() || undefined,
      itemName: itemName.trim() || undefined,
      learnedAccountMappings
    });

    setAutoClassification(result);

    // If user enters natural text like "Bought an unknown item for ₹50", extract amount if amount is empty
    if (!amount && itemName) {
      const match = itemName.match(/(?:for|worth|costing|at)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i);
      if (match && match[1] && !isNaN(Number(match[1]))) {
        setAmount(match[1]);
      }
    }

    if (!isManualCategoryOverride) {
      setCategory(result.category);
    }
  }, [accountNumber, itemName, learnedAccountMappings, isManualCategoryOverride, amount]);

  if (!isOpen) return null;

  const currentAccount = accounts.find((a) => a.id === accountId) || accounts[0];
  const numAmount = parseFloat(amount) || 0;

  const quickSamples = [
    { label: 'XXXX1234 (ABC Bakery ₹100)', acc: 'XXXX1234', item: 'ABC Bakery', cost: '100' },
    { label: 'XXXX1234 (Next Tx ₹250)', acc: 'XXXX1234', item: 'ABC Bakery', cost: '250' },
    { label: 'Candy (₹50)', acc: '', item: 'Candy', cost: '50' },
    { label: 'Notebook (₹80)', acc: '', item: 'Notebook', cost: '80' },
    { label: 'Shirt (₹1,200)', acc: '', item: 'Shirt', cost: '1200' },
    { label: 'Unknown item (₹50)', acc: '', item: 'Bought an unknown item for ₹50', cost: '50' }
  ];

  const handleApplyQuickSample = (sample: { acc: string; item: string; cost: string }) => {
    setAccountNumber(sample.acc);
    setItemName(sample.item);
    setAmount(sample.cost);
    setIsManualCategoryOverride(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setError(null);

    if (!itemName.trim()) {
      setError('Merchant or Item name is required.');
      return;
    }

    if (numAmount <= 0) {
      setError('Amount must be greater than ₹0.');
      return;
    }

    if (!date) {
      setError('Transaction date is required.');
      return;
    }

    setIsSubmitting(true);

    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const finalItemName = autoClassification?.cleanItemName || itemName.trim();

    const newTx: Omit<AccountTransaction, 'id'> = {
      accountId: currentAccount.id,
      accountName: currentAccount.name,
      itemName: finalItemName,
      merchant: finalItemName,
      accountNumber: accountNumber.trim().toUpperCase() || undefined,
      amount: numAmount,
      type,
      category,
      paymentMethod,
      date: formattedDate,
      time: formattedTime,
      userId: activeUserId,
      note: note.trim() || undefined,
      wasAutoCategorized: !isManualCategoryOverride,
      categoryNeedsReview: category === 'General Transactions'
    };

    onAddTransaction(newTx);
    setIsSubmitting(false);
    onClose();

    // Reset
    setAccountNumber('');
    setItemName('');
    setAmount('');
    setNote('');
    setIsManualCategoryOverride(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 relative text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Record Account Transaction</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Account-Learning Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Account-number priority: learned accounts auto-categorize; unknown accounts save to General Transactions
            </p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Business Account */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Account Ledger</span>
              <span className="text-[11px] font-mono text-emerald-400">
                Balance: ₹{currentAccount?.balance.toLocaleString()}
              </span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Current Balance: ₹{acc.balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Number Input (Priority Rule) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>Account Number / UPI ID</span>
              </label>
              <span className="text-[10px] text-cyan-400">Priority Category Key</span>
            </div>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. XXXX1234, baker@okhdfcbank"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Item / Merchant Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Merchant / Item / Product Name
              </label>
              <span className="text-[10px] text-slate-400">Item fallback detection</span>
            </div>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. ABC Bakery, Candy, Notebook, Bus ticket, Unknown item"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />

            {/* Quick Samples from Specification */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              <span className="text-[10px] text-slate-500 mr-1 self-center">Test Prompts:</span>
              {quickSamples.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleApplyQuickSample(s)}
                  className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 hover:border-cyan-500 text-[10px] text-slate-400 hover:text-cyan-300 transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Decision Banner (Priority Rule Feedback) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Assigned Category:</span>
              </span>

              {autoClassification?.source === 'ACCOUNT_LEARNED' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Learned: {category}
                </span>
              ) : autoClassification?.source === 'UNKNOWN_ACCOUNT_FALLBACK' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  General Transactions (Unknown Account)
                </span>
              ) : category === 'General Transactions' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  General Transactions (Unresolved)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {category}
                </span>
              )}
            </div>

            {/* Explanatory Message */}
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {autoClassification?.source === 'ACCOUNT_LEARNED' ? (
                <span>
                  ✓ <strong className="text-emerald-400 font-mono">{accountNumber.trim().toUpperCase()}</strong> is recognized from your learned mappings. Automatically assigned to{' '}
                  <strong className="text-emerald-300">{category}</strong>!
                </span>
              ) : autoClassification?.source === 'UNKNOWN_ACCOUNT_FALLBACK' ? (
                <span>
                  ⓘ Account <strong className="text-amber-300 font-mono">{accountNumber.trim().toUpperCase()}</strong> is not known yet. Automatically saving under{' '}
                  <strong className="text-amber-300">General Transactions</strong>. You can correct it anytime, and future transactions to this account will use your chosen category.
                </span>
              ) : category === 'General Transactions' ? (
                <span>
                  Could not identify a confident category. Automatically saving under{' '}
                  <strong className="text-amber-300">General Transactions</strong>.
                </span>
              ) : (
                <span>
                  Auto-detected as <strong className="text-emerald-300">{category}</strong> based on product name.
                </span>
              )}
            </p>

            {/* Manual Override Category Grid */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400">Manual Override Category:</span>
                {isManualCategoryOverride && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualCategoryOverride(false);
                      if (autoClassification) setCategory(autoClassification.category);
                    }}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Reset to Detected
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 text-[10px]">
                {PREDEFINED_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setIsManualCategoryOverride(true);
                    }}
                    className={`py-1 px-1.5 rounded-lg border text-center transition truncate ${
                      category === cat
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Payment Method</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['UPI', 'Cash', 'Card', 'Bank Transfer', 'NetBanking'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 px-1 rounded-xl border text-[11px] font-medium transition text-center truncate ${
                    paymentMethod === method
                      ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 font-semibold'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Transaction</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
