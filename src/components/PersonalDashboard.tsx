import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PieChart,
  Target,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import {
  Transaction,
  BudgetCategory,
  SavingsGoal,
  FinancialAccount,
  BusinessAccount,
  GeneralTransaction
} from '../types';
import { FinanceEngine } from '../services/financeEngine';
import { MarketWatchCompactWidget } from './MarketWatchCompactWidget.tsx';
import {
  Building2,
  Unplug,
  RefreshCw,
  Lock,
  ArrowRightLeft,
  Utensils,
  Shirt,
  Printer,
  Briefcase,
  Plus,
  UserX
} from 'lucide-react';

interface PersonalDashboardProps {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  goals: SavingsGoal[];
  connectedAccounts: FinancialAccount[];
  businessAccounts?: BusinessAccount[];
  generalTransactions?: GeneralTransaction[];
  onOpenConnectModal: () => void;
  onUseDemoData: () => void;
  onSyncAccount?: (accountId: string) => Promise<void>;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateTab: (tab: any) => void;
  onOpenAIWithPrompt: (prompt: string) => void;
  onOpenTransferModal?: (accountId?: string) => void;
  onOpenAddTransactionModal?: (accountId?: string) => void;
  activeUserId?: string;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({
  transactions,
  budgets,
  goals,
  connectedAccounts,
  businessAccounts = [],
  generalTransactions = [],
  onOpenConnectModal,
  onUseDemoData,
  onSyncAccount,
  onSelectTransaction,
  onNavigateTab,
  onOpenAIWithPrompt,
  onOpenTransferModal,
  onOpenAddTransactionModal,
  activeUserId = 'usr_001'
}) => {
  const metrics = FinanceEngine.calculateMetrics(transactions);
  const categories = FinanceEngine.getCategoryBreakdown(transactions);
  const budgetSummary = FinanceEngine.getBudgetProgress(budgets);

  // Identify high-risk anomaly transaction
  const anomalyTx = transactions.find((t) => t.riskLevel === 'high');

  const activeAccount = connectedAccounts.find(
    (a) => a.status === 'CONNECTED — READ ONLY'
  );

  return (
    <div className="space-y-6">
      {/* Welcome & Security Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Multi-business account accounting, isolated transaction ledgers & general transfers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenTransferModal && (
            <button
              onClick={() => onOpenTransferModal()}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-950 transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Money</span>
            </button>
          )}
          <button
            onClick={() => onOpenAIWithPrompt("Summarize my business account balances and recent transfers.")}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* MOST IMPORTANT DEMO WORKFLOW CARD */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30 border border-emerald-500/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              CORE ACCOUNTING DEMO FLOW
            </span>
            <span className="text-xs font-bold text-white">Food Business → ₹5,000 Transfer → Unknown Person</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-300 font-semibold">
              Food Account
            </span>
            <span className="text-slate-500">➔</span>
            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300 font-semibold">
              Transfer ₹5,000
            </span>
            <span className="text-slate-500">➔</span>
            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-300 font-semibold">
              To: Unknown Person
            </span>
            <span className="text-slate-500">➔</span>
            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200">
              Purpose: Food materials
            </span>
            <span className="text-slate-500">➔</span>
            <span className="px-2 py-1 rounded-lg bg-cyan-950 border border-cyan-500 text-cyan-200 font-bold">
              Logs to General Transactions
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenTransferModal && (
            <button
              onClick={() => onOpenTransferModal('acc_food')}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Test This Transfer</span>
            </button>
          )}
          <button
            onClick={() => onNavigateTab('general-transactions')}
            className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>View General Log</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CORE MULTI-ACCOUNT SUMMARY (Food, Dress, Xerox Accounts) */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Business Accounts & Balances</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {businessAccounts.length} Active Accounts
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('business-accounts')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Manage All Accounts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Combined Balance Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Total Balance</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              ₹{businessAccounts.reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span>{businessAccounts.length} Business Accounts</span>
              <span className="text-emerald-400 font-mono font-medium">All Isolated</span>
            </div>
          </div>

          {/* Food Account Card */}
          {(() => {
            const foodAcc = businessAccounts.find(a => a.type === 'Food' || a.name.toLowerCase().includes('food')) || businessAccounts[0];
            return (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Food Account</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <Utensils className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                  ₹{foodAcc ? foodAcc.balance.toLocaleString() : '20,000'}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>{foodAcc?.name || 'Food Business'}</span>
                  {onOpenTransferModal && (
                    <button
                      onClick={() => onOpenTransferModal(foodAcc?.id)}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      Transfer
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Dress Account Card */}
          {(() => {
            const dressAcc = businessAccounts.find(a => a.type === 'Dress' || a.name.toLowerCase().includes('dress')) || businessAccounts[1];
            return (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Dress Account</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
                    <Shirt className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-purple-300 tracking-tight">
                  ₹{dressAcc ? dressAcc.balance.toLocaleString() : '35,000'}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>{dressAcc?.name || 'Dress Business'}</span>
                  {onOpenTransferModal && (
                    <button
                      onClick={() => onOpenTransferModal(dressAcc?.id)}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      Transfer
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Xerox Account Card */}
          {(() => {
            const xeroxAcc = businessAccounts.find(a => a.type === 'Xerox' || a.name.toLowerCase().includes('xerox')) || businessAccounts[2];
            return (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Xerox Account</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                    <Printer className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-blue-300 tracking-tight">
                  ₹{xeroxAcc ? xeroxAcc.balance.toLocaleString() : '15,000'}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>{xeroxAcc?.name || 'Xerox Business'}</span>
                  {onOpenTransferModal && (
                    <button
                      onClick={() => onOpenTransferModal(xeroxAcc?.id)}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      Transfer
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Transfer Stats Strip */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] text-slate-400 block">Number of Accounts</span>
              <span className="font-bold text-white font-mono">{businessAccounts.length}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[11px] text-slate-400 block">Today&apos;s Transfers</span>
              <span className="font-bold text-white font-mono">
                {generalTransactions.filter(t => t.date.includes('05 Oct') || t.date.includes('Today')).length} executed
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[11px] text-slate-400 block">Total Transfer Amount</span>
              <span className="font-bold text-cyan-400 font-mono">
                ₹{generalTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddTransactionModal && (
              <button
                onClick={() => onOpenAddTransactionModal()}
                className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Expense</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('general-transactions')}
              className="py-1.5 px-3 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/40 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition"
            >
              <span>View General Transactions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RECENT GENERAL TRANSACTIONS (Account Transfers Table)     */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent General Transactions</h2>
            <p className="text-xs text-slate-400">Account transfers automatically recorded with recipient & purpose</p>
          </div>
          <button
            onClick={() => onNavigateTab('general-transactions')}
            className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>See All ({generalTransactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
          {generalTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No account transfers recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">From Account</th>
                    <th className="py-3 px-4">To / Person</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {generalTransactions.slice(0, 4).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-medium">
                        {t.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-white">{t.fromAccountName}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {t.isUnknownPerson || t.toPerson.toLowerCase().includes('unknown') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <UserX className="w-3 h-3" />
                            <span>{t.toPerson}</span>
                          </span>
                        ) : (
                          <span className="text-slate-200 font-semibold">{t.toPerson}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-emerald-400">
                        ₹{t.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {t.purpose}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {t.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Prominent "Connect Financial Account" Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-900/40">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">Connect Financial Account</h2>
                {activeAccount ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Connected — Read Only
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                    Demo Data Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Securely connect an eligible financial account to import read-only transaction information.
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>FortiFi never executes transactions or stores your banking credentials.</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenConnectModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-950 transition flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{activeAccount ? 'Manage Account' : 'Connect Account'}</span>
            </button>

            <button
              onClick={onUseDemoData}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
            >
              Use Demo Data
            </button>

            {activeAccount && onSyncAccount && (
              <button
                onClick={() => onSyncAccount(activeAccount.id)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition flex items-center gap-1"
                title="Sync recent statements"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync</span>
              </button>
            )}
          </div>
        </div>

        {activeAccount && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">
              Active: {activeAccount.institutionName} ({activeAccount.maskedAccountNumber}) • Read-Only Statements
            </span>
            <span className="font-mono text-[11px]">Last Synchronized: {activeAccount.lastSyncedAt}</span>
          </div>
        )}
      </div>

      {/* CyberShield Transaction Anomaly Alert (if detected) */}
      {anomalyTx && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/60 shadow-lg shadow-rose-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">CyberShield High Alert</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">15x Outlier Jump</span>
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">
                Unusual Transaction: ₹{anomalyTx.amount.toLocaleString()} to {anomalyTx.merchant}
              </p>
              <p className="text-xs text-slate-400">
                {anomalyTx.riskReasons?.[0] || 'Flagged for extreme variance against typical spending habits.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => onSelectTransaction(anomalyTx)}
              className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-md shadow-rose-900/40 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Inspect Anomaly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Balance</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ₹{metrics.totalBalance.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-medium">HDFC + ICICI</span>
            <span>combined liquid assets</span>
          </div>
        </div>

        {/* Income Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            ₹{metrics.totalIncome.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <span>From 2 verifiable deposit channels</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-200 tracking-tight">
            ₹{metrics.totalExpenses.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <span>Includes ₹{anomalyTx?.amount.toLocaleString() || '0'} pending review</span>
          </div>
        </div>

        {/* Net Cash Flow Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Net Cash Flow</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight ${metrics.netCashFlow >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {metrics.netCashFlow >= 0 ? '+' : ''}₹{metrics.netCashFlow.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <span className="text-cyan-300 font-medium">{metrics.savingsRate}%</span>
            <span>savings retention rate</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Cash Flow Graph & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Comparison SVG Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Income vs Expenses Analysis</h2>
              <p className="text-xs text-slate-400">Monthly inflow and outflow comparative breakdown</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Inflow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-400">Outflow</span>
              </div>
            </div>
          </div>

          {/* Pure SVG Bar Visualizer */}
          <div className="h-56 w-full pt-4">
            <div className="flex h-40 items-end justify-between gap-4 px-2 border-b border-slate-800">
              {/* Jul */}
              <div className="flex-1 flex items-end justify-center gap-1.5 h-full">
                <div className="w-full max-w-[28px] bg-emerald-500/80 rounded-t-md hover:bg-emerald-400 transition-all" style={{ height: '70%' }} title="Jul Income: ₹62,000" />
                <div className="w-full max-w-[28px] bg-rose-500/80 rounded-t-md hover:bg-rose-400 transition-all" style={{ height: '52%' }} title="Jul Expenses: ₹46,000" />
              </div>
              {/* Aug */}
              <div className="flex-1 flex items-end justify-center gap-1.5 h-full">
                <div className="w-full max-w-[28px] bg-emerald-500/80 rounded-t-md hover:bg-emerald-400 transition-all" style={{ height: '78%' }} title="Aug Income: ₹68,500" />
                <div className="w-full max-w-[28px] bg-rose-500/80 rounded-t-md hover:bg-rose-400 transition-all" style={{ height: '55%' }} title="Aug Expenses: ₹49,200" />
              </div>
              {/* Sep */}
              <div className="flex-1 flex items-end justify-center gap-1.5 h-full">
                <div className="w-full max-w-[28px] bg-emerald-500/80 rounded-t-md hover:bg-emerald-400 transition-all" style={{ height: '75%' }} title="Sep Income: ₹66,000" />
                <div className="w-full max-w-[28px] bg-rose-500/80 rounded-t-md hover:bg-rose-400 transition-all" style={{ height: '48%' }} title="Sep Expenses: ₹42,800" />
              </div>
              {/* Oct (Current) */}
              <div className="flex-1 flex items-end justify-center gap-1.5 h-full relative">
                <div className="absolute -top-6 text-[10px] text-cyan-400 font-mono font-semibold bg-cyan-950/80 border border-cyan-800 px-1.5 py-0.5 rounded">
                  Current
                </div>
                <div className="w-full max-w-[28px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md shadow-lg shadow-emerald-950/30" style={{ height: '88%' }} title="Oct Inflow: ₹73,000" />
                <div className="w-full max-w-[28px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md shadow-lg shadow-rose-950/30" style={{ height: '62%' }} title="Oct Outflow: ₹51,700" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pt-2 px-2 font-mono">
              <span className="flex-1 text-center">Jul</span>
              <span className="flex-1 text-center">Aug</span>
              <span className="flex-1 text-center">Sep</span>
              <span className="flex-1 text-center font-bold text-slate-300">Oct</span>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Surplus Capacity:</span>
            <span className="font-mono font-semibold text-emerald-400">+₹21,300 available for savings allocation</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">Expenditure Distribution</h2>
              <PieChart className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="space-y-3">
              {categories.slice(0, 5).map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 capitalize">{cat.category}</span>
                    <span className="font-mono text-slate-400">₹{cat.amount.toLocaleString()} ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('analytics')}
            className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 font-medium transition"
          >
            <span>View Full Analytics Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Budgets & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Budget Tracker */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Budget Thresholds</h2>
              <p className="text-xs text-slate-400">{budgetSummary.utilizationPercent}% of ₹{budgetSummary.totalAllocated.toLocaleString()} utilized</p>
            </div>
            <button
              onClick={() => onNavigateTab('budget-goals')}
              className="text-xs text-cyan-400 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3.5">
            {budgets.slice(0, 4).map((b) => {
              const pct = Math.round((b.spent / b.allocated) * 100);
              const isHigh = pct >= 80;
              return (
                <div key={b.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-300">{b.category}</span>
                    <span className="font-mono text-slate-400">
                      ₹{b.spent.toLocaleString()} / ₹{b.allocated.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isHigh ? 'bg-amber-400' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List with Risk Badges */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Live ledger with deterministic anomaly flags</p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  tx.riskLevel === 'high'
                    ? 'bg-rose-950/20 border-rose-800/50 hover:border-rose-600'
                    : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{tx.merchant}</span>
                      {tx.riskLevel === 'high' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-medium flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          High Risk
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 capitalize">{tx.category} • {tx.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono text-xs font-bold ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{tx.account.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optional Compact Market Watch Widget (Section 26 - Shown only if user enabled Market Watch) */}
      <MarketWatchCompactWidget
        activeUserId={activeUserId}
        onNavigateToMarketWatch={() => onNavigateTab('market-watch')}
      />
    </div>
  );
};
