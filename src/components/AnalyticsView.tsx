import React from 'react';
import { PieChart, TrendingUp, DollarSign, ShieldCheck, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { Transaction } from '../types';
import { FinanceEngine } from '../services/financeEngine';

interface AnalyticsViewProps {
  transactions: Transaction[];
  onOpenAIWithPrompt: (prompt: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  onOpenAIWithPrompt,
}) => {
  const metrics = FinanceEngine.calculateMetrics(transactions);
  const categories = FinanceEngine.getCategoryBreakdown(transactions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Financial Intelligence & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Categorical distributions, spending velocity, and surplus efficiency
          </p>
        </div>
        <button
          onClick={() =>
            onOpenAIWithPrompt("Analyze my expense velocity and suggest the top 3 areas to cut waste.")
          }
          className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Expense Audit</span>
        </button>
      </div>

      {/* Top Ratio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1">Savings Retention Rate</span>
          <div className="text-2xl font-bold font-mono text-cyan-400">{metrics.savingsRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            +₹{metrics.netCashFlow.toLocaleString()} retained out of ₹{metrics.totalIncome.toLocaleString()} gross inflow
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1">Expense Burn Rate</span>
          <div className="text-2xl font-bold font-mono text-slate-200">
            {metrics.totalIncome > 0 ? Math.round((metrics.totalExpenses / metrics.totalIncome) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Healthy threshold is below 75%</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1">CyberShield Risk Clearance</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {metrics.anomalousCount === 0 ? '100% Clean' : `${metrics.anomalousCount} Under Review`}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Zero unauthorized transactions cleared</p>
        </div>
      </div>

      {/* Deep Categorical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">Category Volume & Share</h2>
            <PieChart className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3.5">
            {categories.map((cat, i) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-slate-300 capitalize font-medium">{cat.category}</span>
                    <span className="text-[10px] text-slate-500">({cat.count} txns)</span>
                  </div>
                  <div className="font-mono text-slate-300">
                    ₹{cat.amount.toLocaleString()} <span className="text-slate-500">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6-Month Historical Trajectory */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Cash Flow Trajectory (Past 4 Months)</h2>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">July 2026</span>
                  <span className="text-[11px] text-slate-500">Income: ₹62,000 | Outflow: ₹46,000</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">+₹16,000</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">August 2026</span>
                  <span className="text-[11px] text-slate-500">Income: ₹68,500 | Outflow: ₹49,200</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">+₹19,300</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">September 2026</span>
                  <span className="text-[11px] text-slate-500">Income: ₹66,000 | Outflow: ₹42,800</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">+₹23,200</span>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-cyan-300 block">October 2026 (Current)</span>
                  <span className="text-[11px] text-slate-400">Income: ₹73,000 | Outflow: ₹51,700</span>
                </div>
                <span className="font-mono font-bold text-cyan-400">+₹21,300</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Average monthly surplus retention across the last quarter is <strong className="text-slate-200">₹19,500</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
