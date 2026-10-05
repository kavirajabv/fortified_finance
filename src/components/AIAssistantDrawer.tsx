import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Shield,
  Bot,
  User,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock
} from 'lucide-react';
import { Transaction, Product, Invoice } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  dataSummaryBadge?: string;
  dataSource?: 'FORTIFI_DATA' | 'DEMO_DATA' | 'NO_DATA';
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactions?: Transaction[];
  products?: Product[];
  invoices?: Invoice[];
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  activeUserId?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  onClearInitialPrompt,
  activeUserId = 'usr_001'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm_welcome',
      sender: 'assistant',
      text: "Hello! I am your FortiFi AI Financial & Cybersecurity Assistant. Every financial answer I provide is retrieved and deterministically calculated from your authenticated records.\n\nHow can I help you analyze your finances or security today?",
      timestamp: 'Just now',
      dataSummaryBadge: '✓ Connected to FortiFi Financial Engine',
      dataSource: 'FORTIFI_DATA'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (queryText = input) => {
    if (!queryText.trim() || loading) return;

    const userMsg: Message = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
          'Authorization': `Bearer ${activeUserId}`
        },
        body: JSON.stringify({ query: queryText })
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: 'assistant_' + Date.now(),
        sender: 'assistant',
        text: data.reply || "Analysis complete.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataSummaryBadge: data.dataSummaryBadge,
        dataSource: data.dataSource
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: 'assistant_err_' + Date.now(),
        sender: 'assistant',
        text: "I couldn't retrieve your financial data right now. Please try again.",
        timestamp: 'Just now',
        dataSummaryBadge: 'ⓘ System error encountered',
        dataSource: 'NO_DATA'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-send when initialPrompt changes
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const quickPrompts = [
    "How much did I spend this month?",
    "What was my highest expense?",
    "What is my total income?",
    "How much did I save?",
    "How much did I spend on food?",
    "Compare this month with last month",
    "Which products are low in stock?",
    "Which invoices are pending?",
    "Transfer ₹5,000 to Rahul"
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm">FortiFi AI Assistant</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Data-Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Authenticated read-only financial copilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm shadow-md'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-bl-sm shadow-md'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                {/* Data Source Badge (Section 16 & 29) */}
                {m.sender === 'assistant' && m.dataSummaryBadge && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px]">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium ${
                        m.dataSource === 'FORTIFI_DATA'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                          : m.dataSource === 'DEMO_DATA'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Database className="w-3 h-3 shrink-0" />
                      <span>{m.dataSummaryBadge}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{m.timestamp}</span>
                  </div>
                )}

                {m.sender === 'user' && (
                  <span className="text-[10px] opacity-70 block text-right font-mono">
                    {m.timestamp}
                  </span>
                )}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Analyzing indicator (Section 29) */}
          {loading && (
            <div className="flex gap-3 text-xs justify-start items-center text-slate-400 animate-in fade-in">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-cyan-300 flex items-center gap-2 text-xs shadow-sm">
                <Database className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                <span className="font-medium">Analyzing your financial data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Chips */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1.5 px-1">
            Verified Financial Queries:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] whitespace-nowrap transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask about spending, income, low stock, or budgets..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>Read-only analytics layer. FortiFi cannot execute money transfers.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
