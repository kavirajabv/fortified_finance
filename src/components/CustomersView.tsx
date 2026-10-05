import React from 'react';
import { Users, Mail, Phone, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { Customer } from '../types';

interface CustomersViewProps {
  customers: Customer[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Customer Directory</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Client profiles, cumulative transaction volume, and account contact channels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {customers.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{c.name}</h3>
                <span className="text-[11px] text-slate-500">Last activity: {c.lastOrderDate}</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{c.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono">{c.phone}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Lifetime Purchases:</span>
              <span className="font-mono font-bold text-cyan-400">₹{c.totalPurchases.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
