import React, { useState } from 'react';
import {
  Building2,
  RefreshCw,
  Unplug,
  CheckCircle2,
  XCircle,
  Shield,
  Lock,
  Plus,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { FinancialAccount } from '../types';

interface FinancialAccountsViewProps {
  accounts: FinancialAccount[];
  providerStatusMessage: string;
  onOpenConnectModal: () => void;
  onSyncAccount: (accountId: string) => Promise<void>;
  onDisconnectAccount: (accountId: string) => Promise<void>;
}

export const FinancialAccountsView: React.FC<FinancialAccountsViewProps> = ({
  accounts,
  providerStatusMessage,
  onOpenConnectModal,
  onSyncAccount,
  onDisconnectAccount
}) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await onSyncAccount(id);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    setDisconnectingId(id);
    try {
      await onDisconnectAccount(id);
    } finally {
      setDisconnectingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED — READ ONLY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SYNCING':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse';
      case 'SYNC FAILED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'CONSENT EXPIRED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'DISCONNECTED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Financial Accounts</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Authorized Account Aggregator read-only connections & consent management
          </p>
        </div>
        <button
          onClick={onOpenConnectModal}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Financial Account</span>
        </button>
      </div>

      {/* Provider Status Callout */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white block">Provider Ecosystem Status</span>
          <span className="text-slate-400 text-[11px]">{providerStatusMessage}</span>
        </div>
      </div>

      {/* Connected Accounts Cards */}
      <div className="space-y-4">
        {accounts.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-300 text-sm">No Financial Accounts Connected</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Connect your eligible bank accounts to automatically import read-only statements, or continue using Demo Data.
            </p>
            <button
              onClick={onOpenConnectModal}
              className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
            >
              Connect First Account
            </button>
          </div>
        ) : (
          accounts.map((acc) => {
            const isConnected = acc.status === 'CONNECTED — READ ONLY';
            return (
              <div
                key={acc.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-5 shadow-sm"
              >
                {/* Account Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white">{acc.institutionName}</h2>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(acc.status)}`}>
                          {acc.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {acc.accountType} Account • {acc.maskedAccountNumber} (Ref: {acc.accountReference})
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-500 block">Ledger Balance (Read-Only)</span>
                    <span className="text-xl font-bold font-mono text-cyan-400">
                      ₹{acc.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sync Status & Consent Info */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Connection Status:</span>
                      <span className="font-semibold text-slate-200">{acc.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Last Synchronized:</span>
                      <span className="font-mono text-slate-200">{acc.lastSyncedAt}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Consent State:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{acc.consentStatus}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Consent Expiry:</span>
                      <span className="font-mono text-slate-300">
                        {new Date(acc.consentExpiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Explicit Permissions Breakdown */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-emerald-400 block mb-1">
                        Permissions Granted
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {acc.permissionsGranted.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] uppercase font-bold text-rose-400 block mb-1">
                        Permissions Denied (Strict Safety Boundary)
                      </span>
                      <ul className="space-y-1 text-slate-400">
                        {acc.permissionsDenied.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>FortiFi never executes transactions or stores banking credentials.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSync(acc.id)}
                      disabled={syncingId === acc.id || !isConnected}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${syncingId === acc.id ? 'animate-spin' : ''}`} />
                      <span>{syncingId === acc.id ? 'Syncing...' : 'Sync Now'}</span>
                    </button>

                    <button
                      onClick={() => handleDisconnect(acc.id)}
                      disabled={disconnectingId === acc.id || acc.status === 'DISCONNECTED'}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Unplug className="w-3.5 h-3.5" />
                      <span>{disconnectingId === acc.id ? 'Disconnecting...' : 'Disconnect'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
