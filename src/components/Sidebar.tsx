import React from 'react';
import {
  LayoutDashboard,
  ArrowUpDown,
  PieChart,
  PiggyBank,
  ShieldCheck,
  Receipt,
  Boxes,
  Users,
  BarChart3,
  Sparkles,
  Info,
  Building2,
  Lock,
  FileCheck,
  Shield,
  ArrowRightLeft,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { AppMode } from '../types';

export type ActiveTab =
  | 'overview'
  | 'business-accounts'
  | 'general-transactions'
  | 'transactions'
  | 'financial-accounts'
  | 'budget-goals'
  | 'analytics'
  | 'cybershield'
  | 'consent-manager'
  | 'privacy-center'
  | 'business-billing'
  | 'business-inventory'
  | 'business-invoices'
  | 'business-customers'
  | 'market-watch';

interface SidebarProps {
  mode: AppMode;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  anomalousCount: number;
  lowStockCount: number;
  onOpenAI: () => void;
  hasConnectedAccount?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mode,
  activeTab,
  onSelectTab,
  anomalousCount,
  lowStockCount,
  onOpenAI,
  hasConnectedAccount = true
}) => {
  const personalNav = [
    { id: 'overview' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'business-accounts' as ActiveTab,
      label: 'Business Accounts',
      icon: Briefcase,
      badge: 'Food/Dress/Xerox',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'general-transactions' as ActiveTab,
      label: 'General Transactions',
      icon: ArrowRightLeft,
      badge: 'Transfers',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'financial-accounts' as ActiveTab,
      label: 'Financial Accounts',
      icon: Building2,
      badge: hasConnectedAccount ? 'Read Only' : 'Demo Active',
      badgeColor: hasConnectedAccount
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        : 'bg-slate-800 text-slate-400 border-slate-700'
    },
    {
      id: 'transactions' as ActiveTab,
      label: 'Transactions',
      icon: ArrowUpDown,
      badge: anomalousCount > 0 ? `${anomalousCount} Flagged` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    { id: 'budget-goals' as ActiveTab, label: 'Budgets & Goals', icon: PiggyBank },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: PieChart },
    {
      id: 'cybershield' as ActiveTab,
      label: 'CyberShield',
      icon: ShieldCheck,
      badge: 'Active Defense',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    { id: 'consent-manager' as ActiveTab, label: 'Consent Manager', icon: FileCheck },
    { id: 'privacy-center' as ActiveTab, label: 'Privacy Center', icon: Shield },
  ];

  const businessNav = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    {
      id: 'business-accounts' as ActiveTab,
      label: 'Business Accounts',
      icon: Briefcase,
      badge: 'Multi-Account',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'general-transactions' as ActiveTab,
      label: 'General Transactions',
      icon: ArrowRightLeft,
      badge: 'Transfers',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    { id: 'business-billing' as ActiveTab, label: 'Billing & POS', icon: Receipt },
    {
      id: 'business-inventory' as ActiveTab,
      label: 'Inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    { id: 'business-invoices' as ActiveTab, label: 'Invoices', icon: BarChart3 },
    { id: 'business-customers' as ActiveTab, label: 'Customers', icon: Users },
    {
      id: 'cybershield' as ActiveTab,
      label: 'CyberShield',
      icon: ShieldCheck,
      badge: 'Active Defense',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    }
  ];

  const currentNav = mode === 'personal' ? personalNav : businessNav;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 px-3">
            {mode === 'personal' ? 'Personal Finance' : 'Merchant Operations'}
          </span>
          <nav className="mt-2 space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-cyan-400 border border-slate-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Optional Market Watch Module (Last in Navigation) */}
          <div className="pt-3 border-t border-slate-900 mt-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 px-3 block mb-1">
              Optional Module
            </span>
            <button
              onClick={() => onSelectTab('market-watch')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'market-watch'
                  ? 'bg-slate-900 text-amber-400 border border-amber-500/50 shadow-sm shadow-amber-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className={`w-4 h-4 ${activeTab === 'market-watch' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Market Watch</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-mono bg-amber-500/10 text-amber-300 border-amber-500/30">
                Gold/NSE
              </span>
            </button>
          </div>
        </div>

        {/* AI Copilot Promotion Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800/90 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">FortiFi Copilot</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Ask questions about cash flow, spending spikes, or inventory restock needs.
          </p>
          <button
            onClick={onOpenAI}
            className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
          >
            Launch Assistant
          </button>
        </div>
      </div>

      {/* Security Operating Boundary Notice */}
      <div className="pt-4 border-t border-slate-900">
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 text-slate-400">
          <Info className="w-4 h-4 text-cyan-400/80 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-tight text-slate-400">
            <strong className="text-slate-300 block mb-0.5">Read-Only Safety Guarantee</strong>
            FortiFi monitors and advises. No money-movement API exists by design.
          </p>
        </div>
      </div>
    </aside>
  );
};
