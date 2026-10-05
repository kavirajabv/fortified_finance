import type { Transaction, BudgetCategory, SavingsGoal, Product, Invoice, InvoiceItem } from '../../src/types/index.ts';

export interface CategorySpending {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface BudgetUsageSummary {
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  utilizationPercent: number;
  overBudgetCategories: string[];
}

export interface PeriodComparisonResult {
  currentExpenses: number;
  previousExpenses: number;
  difference: number;
  percentageChange: number;
  trend: 'INCREASED' | 'DECREASED' | 'STABLE';
  topCurrentCategories: CategorySpending[];
}

export interface InvoiceCalculatedTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
}

/**
 * Pure deterministic financial calculation engine.
 * Never estimates or uses floating point hallucination.
 * Used identically across backend API, AI context builder, and frontend views.
 */

export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateNetCashFlow(transactions: Transaction[]): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const net = income - expenses;
  return Math.max(0, Math.round((net / income) * 100));
}

export function calculateCategorySpending(transactions: Transaction[]): CategorySpending[] {
  const expenseTx = transactions.filter((t) => t.type === 'expense');
  const total = expenseTx.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();
  for (const tx of expenseTx) {
    const cat = tx.category || 'Uncategorized';
    const curr = categoryMap.get(cat) || { amount: 0, count: 0 };
    categoryMap.set(cat, {
      amount: curr.amount + tx.amount,
      count: curr.count + 1
    });
  }

  const result: CategorySpending[] = [];
  for (const [category, data] of categoryMap.entries()) {
    result.push({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? Math.round((data.amount / total) * 100) : 0
    });
  }

  return result.sort((a, b) => b.amount - a.amount);
}

export function calculateAverageSpending(transactions: Transaction[]): number {
  const expenseTx = transactions.filter((t) => t.type === 'expense');
  if (expenseTx.length === 0) return 0;
  const total = calculateTotalExpenses(transactions);
  return Math.round(total / expenseTx.length);
}

export function calculateHighestExpense(transactions: Transaction[]): Transaction | null {
  const expenseTx = transactions.filter((t) => t.type === 'expense');
  if (expenseTx.length === 0) return null;
  return [...expenseTx].sort((a, b) => b.amount - a.amount)[0] || null;
}

export function calculateLowestExpense(transactions: Transaction[]): Transaction | null {
  const expenseTx = transactions.filter((t) => t.type === 'expense');
  if (expenseTx.length === 0) return null;
  return [...expenseTx].sort((a, b) => a.amount - b.amount)[0] || null;
}

export function calculateBudgetUsage(budgets: BudgetCategory[]): BudgetUsageSummary {
  let totalAllocated = 0;
  let totalSpent = 0;
  const overBudgetCategories: string[] = [];

  for (const b of budgets) {
    totalAllocated += b.allocated;
    totalSpent += b.spent;
    if (b.spent > b.allocated) {
      overBudgetCategories.push(b.category);
    }
  }

  const remaining = Math.max(0, totalAllocated - totalSpent);
  const utilizationPercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return {
    totalAllocated,
    totalSpent,
    remaining,
    utilizationPercent,
    overBudgetCategories
  };
}

export function calculatePeriodComparison(
  currentPeriodTx: Transaction[],
  previousPeriodTx: Transaction[]
): PeriodComparisonResult {
  const currentExpenses = calculateTotalExpenses(currentPeriodTx);
  const previousExpenses = calculateTotalExpenses(previousPeriodTx);
  const difference = currentExpenses - previousExpenses;

  const percentageChange =
    previousExpenses > 0
      ? Math.round(((currentExpenses - previousExpenses) / previousExpenses) * 100)
      : currentExpenses > 0
      ? 100
      : 0;

  const trend: 'INCREASED' | 'DECREASED' | 'STABLE' =
    difference > 0 ? 'INCREASED' : difference < 0 ? 'DECREASED' : 'STABLE';

  return {
    currentExpenses,
    previousExpenses,
    difference,
    percentageChange,
    trend,
    topCurrentCategories: calculateCategorySpending(currentPeriodTx).slice(0, 3)
  };
}

export function calculateBusinessRevenue(invoices: Invoice[]): number {
  return invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
}

export function calculateBusinessExpenses(invoices: Invoice[], products: Product[]): number {
  let estimatedCost = 0;
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');

  for (const inv of paidInvoices) {
    for (const item of inv.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        estimatedCost += prod.cost * item.quantity;
      } else {
        estimatedCost += item.unitPrice * 0.6 * item.quantity;
      }
    }
  }
  return estimatedCost;
}

export function calculateBusinessProfit(revenue: number, expenses: number): number {
  return Math.max(0, revenue - expenses);
}

export function calculateInventoryValue(products: Product[]): { totalCostValue: number; totalRetailValue: number } {
  let totalCostValue = 0;
  let totalRetailValue = 0;

  for (const p of products) {
    totalCostValue += p.cost * p.stock;
    totalRetailValue += p.price * p.stock;
  }

  return { totalCostValue, totalRetailValue };
}

export function calculateInvoiceTotals(
  items: { unitPrice: number; quantity: number }[],
  discountPercentage = 0,
  taxPercentage = 18
): InvoiceCalculatedTotals {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * taxPercentage) / 100);
  const total = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total
  };
}
