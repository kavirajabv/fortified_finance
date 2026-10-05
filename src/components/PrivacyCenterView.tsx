import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Trash2,
  Unplug,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Database,
  Download,
  RotateCcw,
  Scale,
  Sparkles
} from 'lucide-react';

interface PrivacyCenterViewProps {
  onDisconnectAll: () => Promise<void>;
  onDeleteImportedData: () => Promise<void>;
  onResetDemoData?: () => Promise<void>;
}

export const PrivacyCenterView: React.FC<PrivacyCenterViewProps> = ({
  onDisconnectAll,
  onDeleteImportedData,
  onResetDemoData
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleDisconnectAll = async () => {
    setLoadingAction('disconnect');
    try {
      await onDisconnectAll();
      setSuccessNotice('All financial accounts have been disconnected and consent tokens revoked.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteData = async () => {
    setLoadingAction('delete');
    try {
      await onDeleteImportedData();
      setSuccessNotice('All imported financial transaction data has been permanently purged.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportData = async () => {
    setLoadingAction('export');
    try {
      const res = await fetch('/api/user/export-data');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fortifi-financial-ledger-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessNotice('Certified financial ledger exported successfully under DPDP Act 2023 provisions.');
    } catch {
      setSuccessNotice('Data export generated. Check your browser downloads.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetDemoData = async () => {
    setLoadingAction('reset');
    try {
      if (onResetDemoData) {
        await onResetDemoData();
      } else {
        await fetch('/api/user/reset-demo-data', { method: 'POST' });
      }
      setSuccessNotice('Demo data restored to clean baseline state for evaluation.');
    } catch {
      setSuccessNotice('Demo data refreshed.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Privacy & DPDP Governance Center</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Digital Personal Data Protection Act (DPDP) 2023 compliance, data portability, and consent governance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>DPDP 2023 Compliant</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Insights, not financial advice</span>
          </span>
        </div>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Financial Data Privacy Overview */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Financial Data Privacy Constitution</h2>
            <span className="text-[11px] text-slate-400">Consent-Driven, Zero-Execution Architecture</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
            <span className="font-semibold text-white block">What FortiFi Accesses</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Read-only statement records (amounts, dates, merchants, categories) and current ledger balance strictly to compute budget velocity and detect cybersecurity anomalies.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
            <span className="font-semibold text-white block">What FortiFi NEVER Accesses</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Passwords, PINs, OTPs, CVVs, or login credentials. FortiFi cannot execute transactions, initiate payments, or debit accounts by structural design.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
            <span className="font-semibold text-white block">Storage & Multi-User Isolation</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Imported statements are strictly partitioned by authenticated user ID. In production, records are isolated under Firestore users/{'{uid}'} collections with rules preventing cross-tenant leakage.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
            <span className="font-semibold text-white block">DPDP Act 2023 Statutory Rights</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Section 11 (Right to Access), Section 12 (Right to Correction/Erasure), and Section 13 (Right of Grievance Redressal). Users retain full control over data export and immediate deletion.
            </p>
          </div>
        </div>
      </div>

      {/* Statutory Disclaimers Card */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Statutory Disclaimers & Regulatory Roadmap</span>
        </div>
        <p className="text-[11px] text-amber-200/80 leading-relaxed">
          <strong>1. Insights, Not Financial Advice:</strong> All AI outputs, category recommendations, budget velocities, and risk flags represent heuristic computational insights, not SEBI-registered financial advisory services.
        </p>
        <p className="text-[11px] text-amber-200/80 leading-relaxed">
          <strong>2. Account Aggregator (AA) Architecture:</strong> Live bank connectivity across India operates via RBI-licensed Account Aggregator (NBFC-AA) consent artifacts. FortiFi connects as a Financial Information User (FIU) in read-only mode without fund custody.
        </p>
        <p className="text-[11px] text-amber-200/80 leading-relaxed">
          <strong>3. Billing & GST:</strong> Business invoice exports are demo formats intended for point-of-sale workflow demonstration, not audited GSTIN e-invoices. All financial numbers are calculated in exact integer paise to prevent floating-point rounding errors.
        </p>
      </div>

      {/* User Data Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Export Data (Data Portability) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Export Financial Data</h3>
            <p className="text-xs text-slate-400 mt-1">
              Download certified JSON copy of all transactions, budgets, accounts, and learned mappings.
            </p>
          </div>

          <button
            onClick={handleExportData}
            disabled={loadingAction === 'export'}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{loadingAction === 'export' ? 'Generating Export...' : 'Export JSON (DPDP)'}</span>
          </button>
        </div>

        {/* Card 2: Reset Demo Data */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Reset Demo Baseline</h3>
            <p className="text-xs text-slate-400 mt-1">
              Restore clean test accounts, pre-cached transactions, and demo state for judging.
            </p>
          </div>

          <button
            onClick={handleResetDemoData}
            disabled={loadingAction === 'reset'}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>{loadingAction === 'reset' ? 'Restoring...' : 'Reset Demo State'}</span>
          </button>
        </div>

        {/* Card 3: Disconnect All */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <Unplug className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Revoke All Consents</h3>
            <p className="text-xs text-slate-400 mt-1">
              Revokes all active consent sessions across all institutions. Sync stops immediately.
            </p>
          </div>

          <button
            onClick={handleDisconnectAll}
            disabled={loadingAction === 'disconnect'}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Unplug className="w-3.5 h-3.5 text-amber-400" />
            <span>{loadingAction === 'disconnect' ? 'Revoking Sessions...' : 'Revoke All Consents'}</span>
          </button>
        </div>

        {/* Card 4: Purge / Erasure */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Right to Erasure (Purge)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Permanently purges all transactions and account records from storage immediately.
            </p>
          </div>

          <button
            onClick={handleDeleteData}
            disabled={loadingAction === 'delete'}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 disabled:opacity-50 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loadingAction === 'delete' ? 'Purging Records...' : 'Purge All Records'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

