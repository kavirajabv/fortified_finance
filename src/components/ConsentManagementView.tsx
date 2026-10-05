import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Unplug, Clock, Lock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { FinancialAccount } from '../types';

interface ConsentManagementViewProps {
  accounts: FinancialAccount[];
  onRefreshConsent: (accountId: string) => Promise<void>;
  onDisconnectAccount: (accountId: string) => Promise<void>;
}

export const ConsentManagementView: React.FC<ConsentManagementViewProps> = ({
  accounts,
  onRefreshConsent,
  onDisconnectAccount
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRefresh = async (id: string) => {
    setLoadingId(id);
    try {
      await onRefreshConsent(id);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRevoke = async (id: string) => {
    setLoadingId(id);
    try {
      await onDisconnectAccount(id);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Consent Management</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Inspect, renew, or revoke digital consent artifacts governed by Account Aggregator guidelines
        </p>
      </div>

      <div className="space-y-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{acc.institutionName} Digital Consent</h3>
                  <span className="text-[11px] text-slate-500 font-mono">Consent ID: {acc.consentId}</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                acc.consentStatus === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {acc.consentStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-500 block mb-1">Created At</span>
                <span className="font-mono text-slate-200">{new Date(acc.consentCreatedAt).toLocaleDateString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-500 block mb-1">Expires On</span>
                <span className="font-mono text-slate-200">{new Date(acc.consentExpiresAt).toLocaleDateString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-500 block mb-1">Data Categories</span>
                <span className="text-cyan-400 font-semibold">Statements & Metadata (View Only)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300">
              <span className="text-slate-400 font-semibold block mb-1">Regulatory Guarantee:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Revoking consent immediately invalidates external session tokens. FortiFi will stop transaction synchronization, prevent further data imports, and only retain records authorized by user settings.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleRefresh(acc.id)}
                disabled={loadingId === acc.id || acc.consentStatus !== 'ACTIVE'}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Refresh Consent</span>
              </button>
              <button
                onClick={() => handleRevoke(acc.id)}
                disabled={loadingId === acc.id || acc.consentStatus === 'REVOKED'}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Unplug className="w-3.5 h-3.5" />
                <span>Revoke & Disconnect</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
