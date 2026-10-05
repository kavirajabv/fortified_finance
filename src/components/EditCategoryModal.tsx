import React, { useState, useEffect } from 'react';
import { X, Tag, Check, HelpCircle, Sparkles, Database } from 'lucide-react';
import { AccountTransaction, TransactionCategory, PREDEFINED_CATEGORIES } from '../types';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: AccountTransaction | null;
  onUpdateCategory: (transactionId: string, newCategory: TransactionCategory, accountNumber?: string) => void;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onUpdateCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>(
    transaction?.category || 'General Transactions'
  );
  const [accountNumber, setAccountNumber] = useState<string>(transaction?.accountNumber || '');

  useEffect(() => {
    if (transaction) {
      setSelectedCategory(transaction.category || 'General Transactions');
      setAccountNumber(transaction.accountNumber || '');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSave = () => {
    onUpdateCategory(transaction.id, selectedCategory, accountNumber.trim() || undefined);
    onClose();
  };

  const hasAccountNumber = Boolean(accountNumber.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 relative text-slate-200 space-y-4">
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
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Edit Transaction Category</h2>
            <p className="text-xs text-slate-400">Reclassify item & learn account relationship for future transactions</p>
          </div>
        </div>

        {/* Current Transaction Overview */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-white">
            <span className="truncate">{transaction.itemName}</span>
            <span className="text-emerald-400 font-mono text-sm">₹{transaction.amount.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Account: <strong className="text-slate-300">{transaction.accountName}</strong></span>
            <span>Date: {transaction.date}</span>
          </div>

          {/* Account Number Field */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Beneficiary / Shop Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. XXXX1234 or UPI ID"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">Select New Category</label>
          <div className="grid grid-cols-3 gap-2">
            {PREDEFINED_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition text-center truncate ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-bold ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Persistent Learning Notice (Section 2 & 7) */}
        {hasAccountNumber && (
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Persistent Learning Active</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              When you save, the system will permanently remember that account{' '}
              <strong className="text-white font-mono">{accountNumber.trim().toUpperCase()}</strong> corresponds to{' '}
              <strong className="text-cyan-400">{selectedCategory}</strong>. All future transactions to this account will automatically receive this category.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Update & Save Learning</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
