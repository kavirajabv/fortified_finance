import React, { useState } from 'react';
import { Target, PiggyBank, Plus, AlertCircle, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { BudgetCategory, SavingsGoal } from '../types';
import { FinanceEngine } from '../services/financeEngine';

interface BudgetGoalsViewProps {
  budgets: BudgetCategory[];
  goals: SavingsGoal[];
  onUpdateBudget: (budgets: BudgetCategory[]) => void;
  onUpdateGoals: (goals: SavingsGoal[]) => void;
  onOpenAIWithPrompt: (prompt: string) => void;
}

export const BudgetGoalsView: React.FC<BudgetGoalsViewProps> = ({
  budgets,
  goals,
  onUpdateBudget,
  onUpdateGoals,
  onOpenAIWithPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'budgets' | 'goals'>('budgets');
  const summary = FinanceEngine.getBudgetProgress(budgets);

  const handleContributeGoal = (goalId: string, amount: number) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: Math.min(g.targetAmount, g.currentAmount + amount)
        };
      }
      return g;
    });
    onUpdateGoals(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Budgets & Savings Targets</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Deterministic spending thresholds and milestone tracking
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'budgets'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Budgets
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'goals'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Savings Goals
          </button>
        </div>
      </div>

      {activeTab === 'budgets' ? (
        <div className="space-y-6">
          {/* Budget Overview Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Total Allocated Limit</span>
              <span className="text-2xl font-bold font-mono text-white">₹{summary.totalAllocated.toLocaleString()}</span>
              <span className="text-[11px] text-slate-500 block mt-1">Across 6 defined categories</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Total Spent This Month</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">₹{summary.totalSpent.toLocaleString()}</span>
              <span className="text-[11px] text-slate-500 block mt-1">{summary.utilizationPercent}% utilization pace</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Remaining Safety Buffer</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                ₹{(summary.totalAllocated - summary.totalSpent).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                {summary.overBudgetCount > 0 ? `${summary.overBudgetCount} over budget` : 'All categories healthy'}
              </span>
            </div>
          </div>

          {/* Budget Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const pct = Math.round((b.spent / b.allocated) * 100);
              const remaining = b.allocated - b.spent;
              const isOver = pct > 100;
              const isWarning = pct >= 80 && !isOver;

              return (
                <div key={b.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-200">{b.category}</h3>
                      <span className="text-[11px] text-slate-500">{b.period}</span>
                    </div>
                    {isOver ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono border border-rose-500/40">
                        Over Limit
                      </span>
                    ) : isWarning ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40">
                        {pct}% Warning
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                        Optimal
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Spent: ₹{b.spent.toLocaleString()}</span>
                      <span className="text-slate-400">Cap: ₹{b.allocated.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                      <span>{pct}% utilized</span>
                      <span>
                        {remaining >= 0
                          ? `₹${remaining.toLocaleString()} left`
                          : `Exceeded by ₹${Math.abs(remaining).toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onOpenAIWithPrompt(`How can I optimize my "${b.category}" spending which is at ${pct}% of my ₹${b.allocated} budget?`)
                    }
                    className="w-full py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-cyan-400 hover:text-cyan-300 border border-slate-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Optimize with AI</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Savings Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((g) => {
              const progressPct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              const remaining = Math.max(0, g.targetAmount - g.currentAmount);

              return (
                <div key={g.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        Due {g.targetDate}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm">{g.title}</h3>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-xl font-bold font-mono text-cyan-400">₹{g.currentAmount.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 font-mono">/ ₹{g.targetAmount.toLocaleString()}</span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 pt-0.5 font-mono">
                        <span>{progressPct}% reached</span>
                        <span>₹{remaining.toLocaleString()} left</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center gap-2">
                    <button
                      onClick={() => handleContributeGoal(g.id, 5000)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
                    >
                      +₹5,000 Deposit
                    </button>
                    <button
                      onClick={() =>
                        onOpenAIWithPrompt(`Calculate monthly savings needed to reach my "${g.title}" target of ₹${g.targetAmount} by ${g.targetDate}.`)
                      }
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                      title="AI Savings Plan"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
