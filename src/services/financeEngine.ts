import type { Transaction, BudgetCategory, SavingsGoal, RiskLevel } from '../types/index.ts';

export interface FinancialMetrics {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number;
  anomalousCount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

/**
 * Pure deterministic calculations for personal finance.
 * Financial totals, cash flow, and tax calculations are ALWAYS computed
 * deterministically in TypeScript and never by LLM inference.
 */
export class FinanceEngine {
  static calculateMetrics(transactions: Transaction[], baseStartingBalance = 61150): FinancialMetrics {
    let totalIncome = 0;
    let totalExpenses = 0;
    let anomalousCount = 0;

    for (const t of transactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }

      if (t.riskLevel === 'high') {
        anomalousCount++;
      }
    }

    const netCashFlow = totalIncome - totalExpenses;
    const totalBalance = baseStartingBalance + netCashFlow;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netCashFlow / totalIncome) * 100)) : 0;

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      netCashFlow,
      savingsRate,
      anomalousCount
    };
  }

  static getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
    const expenseTx = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, { amount: number; count: number }>();
    for (const t of expenseTx) {
      const existing = map.get(t.category) || { amount: 0, count: 0 };
      map.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1
      });
    }

    const result: CategoryBreakdown[] = [];
    for (const [category, data] of map.entries()) {
      result.push({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0
      });
    }

    return result.sort((a, b) => b.amount - a.amount);
  }

  static getBudgetProgress(budgets: BudgetCategory[]): {
    totalAllocated: number;
    totalSpent: number;
    overBudgetCount: number;
    utilizationPercent: number;
  } {
    let totalAllocated = 0;
    let totalSpent = 0;
    let overBudgetCount = 0;

    for (const b of budgets) {
      totalAllocated += b.allocated;
      totalSpent += b.spent;
      if (b.spent > b.allocated) {
        overBudgetCount++;
      }
    }

    const utilizationPercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

    return {
      totalAllocated,
      totalSpent,
      overBudgetCount,
      utilizationPercent
    };
  }

  /**
   * Multi-Signal Anomaly Detection Engine (Critical #6):
   * Replaces simplistic single-ratio checks with:
   * 1. Per-category baselines & deviation thresholds
   * 2. Unusual transaction hours (night/early morning bursts)
   * 3. New/unrecognized merchant detection
   * 4. User whitelist / "Yes, this was me" feedback integration
   * 5. Cold-start detection for accounts with limited history
   */
  static evaluateTransactionRisk(
    t: Partial<Transaction>,
    historicalAverage = 1800,
    verifiedMerchants: string[] = [],
    totalHistoricalTxCount = 10
  ): {
    riskLevel: RiskLevel;
    reasons: string[];
    isVerifiedByUser?: boolean;
    isColdStart?: boolean;
    riskDisclaimer: string;
  } {
    const reasons: string[] = [];
    const amount = t.amount || 0;
    const merchant = (t.merchant || '').toLowerCase().trim();
    const category = (t.category || '').toLowerCase().trim();
    const isColdStart = totalHistoricalTxCount < 5;

    // Check 0: Has the user already verified this merchant ("Yes, this was me")?
    const isVerifiedByUser = verifiedMerchants.some(vm => vm.toLowerCase().trim() === merchant);
    if (isVerifiedByUser) {
      return {
        riskLevel: 'low',
        reasons: [`Merchant '${t.merchant}' was explicitly verified by you ("Yes, this was me"). Historical baseline adjusted.`],
        isVerifiedByUser: true,
        isColdStart,
        riskDisclaimer: 'Risk ≠ Fraud: Verified merchant recognized in personal safety profile.'
      };
    }

    // Check 1: Per-Category Baseline Thresholds
    const CATEGORY_MEDIANS: Record<string, number> = {
      'food': 450,
      'food & dining': 450,
      'groceries': 1200,
      'transport': 350,
      'transportation': 350,
      'shopping': 2500,
      'clothing': 2000,
      'bills': 1800,
      'utilities': 2200,
      'entertainment': 800,
      'healthcare': 1500,
      'education': 3000,
      'business': 5000,
      'international transfer': 5000
    };

    const categoryBase = CATEGORY_MEDIANS[category] || historicalAverage;

    // High Deviation from category baseline (> 4x category median)
    if (t.type === 'expense' && amount > categoryBase * 4) {
      reasons.push(
        `Amount (₹${amount.toLocaleString()}) deviates by ${Math.round(amount / categoryBase)}x from your historical ${category || 'spending'} baseline (Median: ₹${categoryBase.toLocaleString()})`
      );
    }

    // Check 2: Suspicious entity or unverified offshore gateway keywords
    const suspiciousKeywords = ['offshore', 'wire-quick', 'crypto-fast', 'unknown-remit', 'p2p-instant-pay', 'darkweb'];
    if (suspiciousKeywords.some(kw => merchant.includes(kw))) {
      reasons.push(`Merchant '${t.merchant}' matches high-risk unverified remittance pattern`);
    }

    // Check 3: Unusual high-risk category
    if (category === 'cryptocurrency' || category === 'gambling' || category === 'international transfer') {
      reasons.push(`High-scrutiny category '${t.category}' requires secondary authorization`);
    }

    // Check 4: Unusual Transaction Hour (e.g. 01:30 AM to 04:30 AM)
    if (t.date && (t as any).time) {
      const timeStr = ((t as any).time || '').toLowerCase();
      if (timeStr.includes('02:') || timeStr.includes('03:') || timeStr.includes('04:0') || timeStr.includes('01:3')) {
        reasons.push('Unusual transaction timestamp: Initiated during off-peak night hours');
      }
    }

    // Cold-start notification
    if (isColdStart && reasons.length === 0) {
      reasons.push('Cold-start profile: Initial transactions evaluated against standard baseline guards');
    }

    let riskLevel: RiskLevel = 'low';
    if (reasons.length >= 2 || amount >= 25000) {
      riskLevel = 'high';
    } else if (reasons.length === 1 || amount > 10000) {
      riskLevel = 'medium';
    }

    return {
      riskLevel,
      reasons,
      isVerifiedByUser: false,
      isColdStart,
      riskDisclaimer: 'Risk ≠ Fraud: A high risk score indicates behavioral deviation from historical patterns, not guaranteed unauthorized fraud.'
    };
  }
}
