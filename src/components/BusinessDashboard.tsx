import React from 'react';
import {
  TrendingUp,
  Receipt,
  Boxes,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { Product, Invoice, Customer } from '../types';
import { BusinessEngine } from '../services/businessEngine';

interface BusinessDashboardProps {
  products: Product[];
  invoices: Invoice[];
  customers: Customer[];
  onNavigateTab: (tab: any) => void;
  onOpenAIWithPrompt: (prompt: string) => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  products,
  invoices,
  customers,
  onNavigateTab,
  onOpenAIWithPrompt,
}) => {
  const metrics = BusinessEngine.calculateBusinessMetrics(products, invoices);
  const lowStockProducts = products.filter((p) => p.stock <= p.minimumStock);

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Merchant & Business Command</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time sales tracking, stock replenishment alerts, and invoice receivables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('business-billing')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-900/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sale / Invoice</span>
          </button>
          <button
            onClick={() => onOpenAIWithPrompt("Which products are low in stock and how much revenue is pending in unpaid invoices?")}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Operations Audit</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Inventory Alert</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {lowStockProducts.length} Items Below Safe Level
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {lowStockProducts.map(p => `${p.name} (${p.stock} left / min ${p.minimumStock})`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('business-inventory')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1 shrink-0"
          >
            <span>Replenish Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Business Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            ₹{metrics.todaySales.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Recorded via POS & client billings
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Monthly Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ₹{metrics.monthlyRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Paid invoices for current billing cycle
          </div>
        </div>

        {/* Estimated Profit */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Estimated Gross Profit</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
            ₹{metrics.estimatedProfit.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            ~33.2% net operational gross margin
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Receivables</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tracking-tight">
            ₹{metrics.outstandingInvoicesTotal.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Awaiting client remittance clearance
          </div>
        </div>
      </div>

      {/* Inventory & Recent Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Stock Snapshot */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Catalog & Stock Status</h2>
              <p className="text-xs text-slate-400">Inventory levels decrement live upon invoice generation</p>
            </div>
            <button
              onClick={() => onNavigateTab('business-inventory')}
              className="text-xs text-cyan-400 hover:underline"
            >
              Manage Catalog
            </button>
          </div>

          <div className="space-y-2.5">
            {products.slice(0, 4).map((p) => {
              const isLow = p.stock <= p.minimumStock;
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-200 text-xs">{p.name}</div>
                    <span className="text-[11px] text-slate-500 font-mono">SKU: {p.sku} • Cost: ₹{p.cost}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-slate-200">
                      ₹{p.price.toLocaleString()}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      isLow ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.stock} units left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Invoices Ledger */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Recent Customer Invoices</h2>
              <p className="text-xs text-slate-400">Verified transaction receipts and tax records</p>
            </div>
            <button
              onClick={() => onNavigateTab('business-invoices')}
              className="text-xs text-cyan-400 hover:underline"
            >
              View Invoices
            </button>
          </div>

          <div className="space-y-2.5">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{inv.customerName}</div>
                  <span className="text-[11px] text-slate-500 font-mono">{inv.invoiceNumber} • {inv.createdAt}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-100">
                    ₹{inv.total.toLocaleString()}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono capitalize ${
                    inv.status === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
