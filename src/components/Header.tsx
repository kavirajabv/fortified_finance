import React from 'react';
import { Shield, Sparkles, User, Bell, ArrowLeftRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { AppMode, UserProfile } from '../types';

interface HeaderProps {
  mode: AppMode;
  onToggleMode: (newMode: AppMode) => void;
  user: UserProfile;
  securityScore: number;
  anomalousCount: number;
  lowStockCount: number;
  onOpenAI: () => void;
  onNavigateCyberShield: () => void;
  isDemoActive: boolean;
  onResetDemo: () => void;
  onOpenJudgeDefense?: () => void;
  activeUserId?: string;
  onSwitchUser?: (userId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onToggleMode,
  user,
  securityScore,
  anomalousCount,
  lowStockCount,
  onOpenAI,
  onNavigateCyberShield,
  isDemoActive,
  onResetDemo,
  onOpenJudgeDefense,
  activeUserId = 'usr_001',
  onSwitchUser,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-bold">
            <Shield className="w-5 h-5" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">Forti<span className="text-cyan-400">Fi</span></span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                {mode === 'personal' ? 'Personal Finance' : 'Business Suite'}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI Financial Management & CyberShield Defense</p>
          </div>
        </div>

        {/* Mode Selector Pill */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onToggleMode('personal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'personal'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal</span>
          </button>
          <button
            onClick={() => onToggleMode('business')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'business'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Business</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Judge Defense Center Launcher */}
          {onOpenJudgeDefense && (
            <button
              onClick={onOpenJudgeDefense}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 hover:text-white transition-all text-xs font-bold shadow-md shadow-cyan-950"
              title="Interactive Judge Architecture & 30-Loophole Defense Center"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Judge Defense</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-[10px] font-mono">30 Fixed</span>
            </button>
          )}

          {/* CyberShield Posture Pill */}
          <button
            onClick={onNavigateCyberShield}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all text-xs"
            title="CyberShield Security Status"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block leading-tight">CyberShield</span>
              <span className="font-semibold text-slate-200 font-mono text-xs">{securityScore}/100 Safe</span>
            </div>
          </button>

          {/* AI Copilot Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all text-xs font-semibold shadow-sm shadow-cyan-500/10 hover:shadow-cyan-500/20 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">FortiFi AI</span>
          </button>

          {/* Persona Switcher Dropdown (Critical #1: Multi-User Isolation) */}
          {onSwitchUser && (
            <div className="hidden xl:flex items-center gap-1.5 pl-1 border-l border-slate-800">
              <select
                value={activeUserId}
                onChange={(e) => onSwitchUser(e.target.value)}
                className="py-1 px-2 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                title="Switch Authenticated Demo Tenant"
              >
                <option value="usr_001">Rahul (usr_001)</option>
                <option value="usr_002">Priya (usr_002)</option>
                <option value="usr_isolated_empty">New (Isolated)</option>
              </select>
            </div>
          )}

          {/* Reset Demo / Demo Mode Tag */}
          {isDemoActive && (
            <button
              onClick={onResetDemo}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition hidden lg:inline-flex items-center gap-1"
              title="Reset Demo Data"
            >
              <ArrowLeftRight className="w-3 h-3 text-cyan-400" />
              Reset Demo
            </button>
          )}

          {/* User profile avatar */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-800 to-blue-800 border border-cyan-700 flex items-center justify-center text-xs font-bold text-white font-mono">
              {activeUserId === 'usr_002' ? 'PP' : activeUserId === 'usr_isolated_empty' ? 'NU' : 'RS'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
