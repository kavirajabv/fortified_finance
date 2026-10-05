import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  User,
  FileText,
  Clock,
  ArrowUpDown,
  Plus,
  TrendingDown,
  CheckCircle2,
  UserX
} from 'lucide-react';
import { GeneralTransaction, BusinessAccount } from '../types';

interface GeneralTransactionsViewProps {
  transactions: GeneralTransaction[];
  accounts: BusinessAccount[];
  onOpenTransferModal: () => void;
  onVoidTransfer?: (transferId: string, fromAccountId: string, amount: number) => void;
}

export const GeneralTransactionsView: React.FC<GeneralTransactionsViewProps> = ({
  transactions,
  accounts,
  onOpenTransferModal,
  onVoidTransfer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [personFilter, setPersonFilter] = useState('ALL');
  const [purposeFilter, setPurposeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'highest'>('latest');

  // Compute metrics
  const totalTransferAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const todayTransfers = transactions.filter((t) => t.date.includes('05 Oct') || t.date.includes('Today'));
  const todayTransferAmount = todayTransfers.reduce((sum, t) => sum + t.amount, 0);

  // Distinct persons & purposes for filter dropdowns
  const distinctPersons = Array.from(new Set(transactions.map((t) => t.toPerson)));
  const distinctPurposes = Array.from(new Set(transactions.map((t) => t.purpose)));
  const distinctDates = Array.from(new Set(transactions.map((t) => t.date)));

  // Filter & Sort
  const filtered = transactions.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.fromAccountName.toLowerCase().includes(q) ||
        t.toPerson.toLowerCase().includes(q) ||
        t.purpose.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        t.amount.toString().includes(q);
      if (!match) return false;
    }
    if (accountFilter !== 'ALL' && t.fromAccountId !== accountFilter) {
      return false;
    }
    if (personFilter !== 'ALL' && t.toPerson !== personFilter) {
      return false;
    }
    if (purposeFilter !== 'ALL' && t.purpose !== purposeFilter) {
      return false;
    }
    if (dateFilter !== 'ALL' && t.date !== dateFilter) {
      return false;
    }
    const numMin = parseFloat(minAmount);
    if (!isNaN(numMin) && t.amount < numMin) {
      return false;
    }
    const numMax = parseFloat(maxAmount);
    if (!isNaN(numMax) && t.amount > numMax) {
      return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'highest') {
      return b.amount - a.amount;
    }
    if (sortOrder === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Time', 'From Account', 'To / Person', 'Amount (INR)', 'Purpose', 'Note'];
    const rows = sorted.map((t) => [
      `"${t.date}"`,
      `"${t.time || ''}"`,
      `"${t.fromAccountName}"`,
      `"${t.toPerson}"`,
      t.amount,
      `"${t.purpose}"`,
      `"${t.note || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FortiFi_General_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">General Transactions</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Account Transfers Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Dedicated audit trail for all outgoing account-to-person and account-to-account transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Report (CSV)</span>
          </button>
          <button
            onClick={onOpenTransferModal}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-950 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <span>Total Transfer Volume</span>
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            ₹{totalTransferAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">{transactions.length} total transfers recorded</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Today&apos;s Transfers</span>
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            ₹{todayTransferAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">{todayTransfers.length} transactions executed today</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Connected Businesses</span>
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {accounts.length} Accounts
          </div>
          <span className="text-[11px] text-slate-500">Food, Dress, Xerox & custom accounts</span>
        </div>
      </div>

      {/* Interactive Demo Flow Callout Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/40 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              VERIFIED DEMO WORKFLOW
            </span>
            <span className="text-xs font-semibold text-white">Food Business Account Transfer</span>
          </div>
          <div className="text-xs text-slate-300 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            <span className="text-emerald-400 font-semibold">Food Account</span>
            <span className="text-slate-500">→</span>
            <span className="text-cyan-300">Transfer ₹5,000</span>
            <span className="text-slate-500">→</span>
            <span className="text-amber-300">To: Unknown Person</span>
            <span className="text-slate-500">→</span>
            <span className="text-slate-200">Purpose: Food materials</span>
            <span className="text-slate-500">→</span>
            <span className="text-emerald-400 font-bold">Auto-Logged Here!</span>
          </div>
        </div>
        <button
          onClick={onOpenTransferModal}
          className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 shrink-0 transition"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Execute Demo Transfer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search person, purpose, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Source Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Person Filter */}
          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Recipients (To/Person)</option>
            {distinctPersons.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Purpose Filter */}
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Purposes</option>
            {distinctPurposes.map((pur) => (
              <option key={pur} value={pur}>
                {pur}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Dates</option>
            {distinctDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Amount Filter Range */}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              placeholder="Min ₹"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-1/2 py-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
            <span className="text-slate-500 text-xs">-</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-1/2 py-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 sm:col-span-2"
          >
            <option value="latest">Sort: Latest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highest">Sort: Highest Amount First</option>
          </select>
        </div>

        {/* Active Filter Chips */}
        {(accountFilter !== 'ALL' ||
          personFilter !== 'ALL' ||
          purposeFilter !== 'ALL' ||
          dateFilter !== 'ALL' ||
          minAmount ||
          maxAmount ||
          searchQuery.trim()) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Filtered: Showing {sorted.length} of {transactions.length} transfers</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setAccountFilter('ALL');
                setPersonFilter('ALL');
                setPurposeFilter('ALL');
                setDateFilter('ALL');
                setMinAmount('');
                setMaxAmount('');
              }}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* General Transactions Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {sorted.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ArrowRightLeft className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-300 text-sm">No General Transactions Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Transactions only appear here when an Account Transfer is executed. Standard intra-account expenses stay inside their respective accounts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">From Account</th>
                  <th className="py-3.5 px-4">To / Person</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">Note</th>
                  {onVoidTransfer && <th className="py-3.5 px-4 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sorted.map((t) => {
                  const isUnknown = t.isUnknownPerson || t.toPerson.toLowerCase().includes('unknown');
                  const isVoided = t.note?.includes('[VOIDED]');
                  return (
                    <tr key={t.id} className={`hover:bg-slate-800/40 transition ${isVoided ? 'opacity-60 bg-rose-950/10' : ''}`}>
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{t.date}</span>
                        </div>
                        {t.time && <div className="text-[10px] text-slate-500 font-mono pl-5">{t.time}</div>}
                      </td>

                      {/* From Account */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{t.fromAccountName}</span>
                        </span>
                      </td>

                      {/* To / Person */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isUnknown ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <UserX className="w-3 h-3" />
                            <span>{t.toPerson}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.toPerson}</span>
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold text-emerald-400 text-sm">
                        {isVoided ? <span className="line-through text-slate-500">₹{t.amount.toLocaleString()}</span> : `₹${t.amount.toLocaleString()}`}
                      </td>

                      {/* Purpose */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-200 block">{t.purpose}</span>
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <span>{t.note || '-'}</span>
                      </td>

                      {/* Action */}
                      {onVoidTransfer && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isVoided ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                              Voided
                            </span>
                          ) : (
                            <button
                              onClick={() => onVoidTransfer(t.id, t.fromAccountId, t.amount)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-[10px] font-medium transition"
                              title="Void transfer and restore balance to source account"
                            >
                              Void / Revert
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rule Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white block">General Transaction Rule Enforced</span>
          <span>
            Only explicit account transfers are recorded in this ledger. Standard intra-account operating expenses remain strictly within their individual business accounts.
          </span>
        </div>
      </div>
    </div>
  );
};
