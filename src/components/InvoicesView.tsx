import React, { useState } from 'react';
import { FileText, Printer, CheckCircle2, Clock, AlertTriangle, Eye, X } from 'lucide-react';
import { Invoice } from '../types';

interface InvoicesViewProps {
  invoices: Invoice[];
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ invoices }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filtered = invoices.filter(
    (inv) => filterStatus === 'all' || inv.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Invoice Management</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Records of customer invoices, taxes, payment clearance, and aging
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Invoices</option>
            <option value="paid">Paid & Cleared</option>
            <option value="pending">Pending Receivables</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-200">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-semibold text-slate-200">{inv.customerName}</div>
                    <span className="text-[11px] text-slate-500">{inv.customerEmail}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.createdAt}</td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.dueDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                    ₹{inv.total.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans transition inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedInvoice.invoiceNumber}</h3>
                <span className="text-xs text-slate-400">{selectedInvoice.customerName}</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                  selectedInvoice.status === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {selectedInvoice.status}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-slate-200 font-sans">{item.name}</td>
                      <td className="py-2 text-center text-slate-400">{item.quantity}</td>
                      <td className="py-2 text-right text-slate-400">₹{item.unitPrice}</td>
                      <td className="py-2 text-right text-slate-100 font-bold">₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>₹{selectedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Discount:</span>
                <span className="text-emerald-400">-₹{selectedInvoice.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax (GST 18%):</span>
                <span>+₹{selectedInvoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800/60">
                <span className="font-sans">Grand Total:</span>
                <span className="text-cyan-400">₹{selectedInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print?.()}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
