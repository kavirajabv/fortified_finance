import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Plus,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  X
} from 'lucide-react';
import { Transaction, RiskLevel } from '../types';
import { FinanceEngine } from '../services/financeEngine';

interface TransactionsViewProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  selectedTransaction: Transaction | null;
  onSelectTransaction: (tx: Transaction | null) => void;
  onOpenAIWithPrompt: (prompt: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onAddTransaction,
  selectedTransaction,
  onSelectTransaction,
  onOpenAIWithPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New transaction form state
  const [newMerchant, setNewMerchant] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('shopping');
  const [newType, setNewType] = useState<'expense' | 'income'>('expense');

  const categories = ['all', 'food', 'shopping', 'housing', 'health', 'transport', 'entertainment', 'salary', 'freelance', 'international transfer'];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || tx.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesRisk = selectedRisk === 'all' || tx.riskLevel === selectedRisk;
    const matchesSource = selectedSource === 'all' || tx.source === selectedSource;

    return matchesSearch && matchesCategory && matchesRisk && matchesSource;
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newAmount);
    if (!newMerchant || isNaN(amountNum) || amountNum <= 0) return;

    // Use deterministic risk evaluation engine!
    const riskEval = FinanceEngine.evaluateTransactionRisk({
      amount: amountNum,
      merchant: newMerchant,
      category: newCategory,
      type: newType
    });

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      merchant: newMerchant,
      amount: amountNum,
      category: newCategory,
      type: newType,
      date: new Date().toISOString().split('T')[0],
      description: `Manual transaction entry - ${newCategory}`,
      riskLevel: riskEval.riskLevel,
      riskReasons: riskEval.reasons,
      account: 'HDFC Priority A/C ••4092',
      source: 'DEMO'
    };

    onAddTransaction(newTx);
    setShowAddModal(false);
    setNewMerchant('');
    setNewAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Transaction Ledger</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time financial transactions inspected with deterministic anomaly detection
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-900/40 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by merchant, description, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Source filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Sources</option>
              <option value="CONNECTED_ACCOUNT">Connected Account (AA)</option>
              <option value="DEMO">Demo Data</option>
            </select>

            {/* Risk filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk Normal</option>
              <option value="high">High Risk Anomaly</option>
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 capitalize focus:outline-none focus:border-cyan-500"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                <th className="py-3 px-4">Merchant & Description</th>
                <th className="py-3 px-4">Source & Account</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Risk Evaluation</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className={`hover:bg-slate-800/40 transition cursor-pointer ${
                    tx.riskLevel === 'high' ? 'bg-rose-950/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{tx.merchant}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{tx.description}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300">{tx.account}</span>
                    </div>
                    <div>
                      {tx.source === 'CONNECTED_ACCOUNT' ? (
                        <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono mt-0.5">
                          Read-Only Import
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono mt-0.5">
                          Demo Data
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-400">{tx.category}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{tx.date}</td>
                  <td className="py-3.5 px-4">
                    {tx.riskLevel === 'high' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-medium text-[10px]">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Anomaly High Risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-medium text-[10px]">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified Normal
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => onSelectTransaction(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Transaction Details</span>
                {selectedTransaction.riskLevel === 'high' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                    High Risk Anomaly
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{selectedTransaction.merchant}</h2>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
                {selectedTransaction.type === 'income' ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div>
                <span className="text-slate-500 block">Date</span>
                <span className="font-mono text-slate-200">{selectedTransaction.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Category</span>
                <span className="capitalize text-slate-200">{selectedTransaction.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Account</span>
                <span className="text-slate-200">{selectedTransaction.account}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status</span>
                <span className="text-emerald-400 font-medium">Logged & Analyzed</span>
              </div>
            </div>

            {/* Risk Assessment Box */}
            <div className={`p-4 rounded-xl border ${
              selectedTransaction.riskLevel === 'high'
                ? 'bg-rose-950/20 border-rose-800/60'
                : 'bg-emerald-950/20 border-emerald-800/40'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedTransaction.riskLevel === 'high' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-xs font-semibold text-slate-200">
                  {selectedTransaction.riskLevel === 'high'
                    ? 'CyberShield Behavioral Anomaly Detected'
                    : 'Behavioral Risk Score: Clean Pattern'}
                </span>
              </div>

              {selectedTransaction.riskReasons && selectedTransaction.riskReasons.length > 0 ? (
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {selectedTransaction.riskReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">
                  This transaction falls within expected variance bands for your daily expenditure history.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  onSelectTransaction(null);
                  onOpenAIWithPrompt(`Explain this transaction of ₹${selectedTransaction.amount.toLocaleString()} to "${selectedTransaction.merchant}" and evaluate the security and budget implications.`);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explain with FortiFi AI</span>
              </button>
              <button
                onClick={() => onSelectTransaction(null)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white mb-1">Simulate New Transaction</h2>
            <p className="text-xs text-slate-400 mb-4">
              Entries pass through FortiFi's deterministic risk engine automatically.
            </p>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Merchant / Recipient</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Apple Store, Offshore Wire Ltd"
                  value={newMerchant}
                  onChange={(e) => setNewMerchant(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1500 or 30000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 capitalize"
                >
                  {categories.filter((c) => c !== 'all').map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                Tip: Enter amounts &gt; ₹25,000 or merchants containing keywords like "offshore" to test CyberShield's anomaly detection flag!
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition"
                >
                  Log Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
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
