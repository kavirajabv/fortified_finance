import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  UserX,
  UserCheck,
  AlertCircle,
  Calendar,
  Building2,
  FileText,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { BusinessAccount, GeneralTransaction, AccountTransaction } from '../types';

interface AddTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BusinessAccount[];
  selectedAccountId?: string;
  onCompleteTransfer: (
    generalTx: Omit<GeneralTransaction, 'id' | 'createdAt'>,
    accountTx: Omit<AccountTransaction, 'id'>
  ) => void;
  activeUserId?: string;
}

export const AddTransferModal: React.FC<AddTransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  selectedAccountId,
  onCompleteTransfer,
  activeUserId = 'usr_001'
}) => {
  const [fromAccountId, setFromAccountId] = useState<string>(
    selectedAccountId || accounts[0]?.id || 'acc_food'
  );
  const [isUnknownPerson, setIsUnknownPerson] = useState<boolean>(true);
  const [recipientName, setRecipientName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('Food materials');
  const [date, setDate] = useState<string>('2026-10-05');
  const [note, setNote] = useState<string>('Paid through transfer');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentAccount = accounts.find((a) => a.id === fromAccountId) || accounts[0];
  const currentBalance = currentAccount?.balance || 0;
  const numAmount = parseFloat(amount) || 0;

  const quickPurposes = [
    'Food materials',
    'Dress purchase',
    'Xerox materials',
    'Vendor payment',
    'Inventory restock',
    'Material supplies',
    'Advance payment'
  ];

  const handleLoadDemoFoodTransfer = () => {
    const foodAcc = accounts.find((a) => a.type === 'Food' || a.name.toLowerCase().includes('food')) || accounts[0];
    if (foodAcc) setFromAccountId(foodAcc.id);
    setIsUnknownPerson(true);
    setRecipientName('');
    setAmount('5000');
    setPurpose('Food materials');
    setDate('2026-10-05');
    setNote('Paid through transfer');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double-click race conditions!
    setError(null);

    if (numAmount <= 0) {
      setError('Transfer amount must be greater than ₹0.');
      return;
    }

    if (numAmount > currentBalance) {
      setError(
        `Insufficient balance in ${currentAccount?.name}. Available balance is ₹${currentBalance.toLocaleString()}.`
      );
      return;
    }

    if (!purpose.trim()) {
      setError('Purpose / reason of transfer is required.');
      return;
    }

    if (!date) {
      setError('Transfer date is required.');
      return;
    }

    setIsSubmitting(true);

    const toPersonDisplay = isUnknownPerson
      ? recipientName.trim()
        ? `Unknown Person (${recipientName.trim()})`
        : 'Unknown Person'
      : recipientName.trim() || 'Beneficiary';

    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTimeout(() => {
      // 1. General Transaction entry
      const generalTx: Omit<GeneralTransaction, 'id' | 'createdAt'> = {
        date: formattedDate,
        time: formattedTime,
        fromAccountId: currentAccount.id,
        fromAccountName: currentAccount.name,
        toPerson: toPersonDisplay,
        isUnknownPerson,
        actualPersonName: recipientName.trim() || undefined,
        amount: numAmount,
        purpose: purpose.trim(),
        note: note.trim() || '-',
        userId: activeUserId
      };

      // 2. Intra-account transaction entry
      const accountTx: Omit<AccountTransaction, 'id'> = {
        accountId: currentAccount.id,
        accountName: currentAccount.name,
        itemName: `Transfer to ${toPersonDisplay} (${purpose.trim()})`,
        amount: numAmount,
        type: 'transfer_out',
        category: 'General Transactions',
        paymentMethod: 'Bank Transfer',
        date: formattedDate,
        time: formattedTime,
        userId: activeUserId,
        note: note.trim() || '-'
      };

      onCompleteTransfer(generalTx, accountTx);
      setIsSubmitting(false);
      onClose();

      // Reset form
      setAmount('');
      setError(null);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 relative text-slate-200 space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Account Transfer</h2>
            <p className="text-xs text-slate-400">
              Money transfers automatically update account balance and log to General Transactions
            </p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Autofill Banner */}
        <button
          type="button"
          onClick={handleLoadDemoFoodTransfer}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/40 hover:from-emerald-900/60 hover:to-cyan-900/50 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 flex items-center justify-between transition group"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fill Demo Flow: Food Business ₹5,000 → Unknown Person</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 group-hover:underline">
            Auto-Fill
          </span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Account */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>From Account</span>
              <span className="text-[11px] font-mono text-emerald-400">
                Available: ₹{currentBalance.toLocaleString()}
              </span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Balance: ₹{acc.balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* To Whom / Recipient */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">To Whom / Where</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setIsUnknownPerson(true);
                  if (!recipientName) setRecipientName('');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  isUnknownPerson
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Unknown Person</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUnknownPerson(false);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  !isUnknownPerson
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Known Person / Supplier</span>
              </button>
            </div>

            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder={
                isUnknownPerson
                  ? 'Unknown Person (optional notes e.g., walk-in customer)'
                  : 'Enter person or supplier name (e.g., Kumar, Paper Vendor)'
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Amount (₹)</span>
                {numAmount > 0 && numAmount <= currentBalance && (
                  <span className="text-[10px] text-cyan-400">
                    Remaining: ₹{(currentBalance - numAmount).toLocaleString()}
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Transfer Date</label>
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

          {/* Purpose / Reason of Transfer (REQUIRED) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <span>Reason / Purpose of Transfer</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-cyan-400">Required for General Transactions</span>
            </div>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Payment for food-related materials, Dress purchase"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
            {/* Quick Purpose presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickPurposes.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[10px] text-slate-400 hover:text-cyan-300 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Optional Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid through transfer, Invoice #892"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Transfer Flow Summary Card */}
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold text-white">
              <span>Automatic Recording:</span>
              <span className="text-[11px] text-emerald-400 font-mono">GENERAL TRANSACTIONS</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentAccount?.name} balance will decrease by{' '}
              <strong className="text-white">₹{numAmount ? numAmount.toLocaleString() : '0'}</strong>.
              A permanent record with purpose &quot;{purpose || '...'}&quot; will be created.
            </p>
          </div>

          {/* Submit Action */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting || numAmount <= 0}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Executing Transfer...</span>
              ) : (
                <>
                  <span>Confirm & Log to General Transactions</span>
                  <ArrowRightLeft className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
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
