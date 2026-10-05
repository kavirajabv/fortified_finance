import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Coins,
  Building,
  BarChart2,
  Lock
} from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { MarketQuote, GoldPrice } from '../types/market.ts';

interface MarketWatchViewProps {
  activeUserId?: string;
  onOpenAIWithPrompt?: (prompt: string) => void;
}

export const MarketWatchView: React.FC<MarketWatchViewProps> = ({
  activeUserId = 'usr_001',
  onOpenAIWithPrompt
}) => {
  const {
    enabled,
    customWatchlist,
    data,
    loading,
    error,
    lastUpdated,
    isUpdating,
    marketStatus,
    refresh,
    toggleMarketWatch,
    toggleCustomStock
  } = useMarketData(activeUserId);

  const [customSearchInput, setCustomSearchInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Quick suggestions for custom additions
  const quickSuggestions = [
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.' },
    { symbol: 'WIPRO', name: 'Wipro Ltd.' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharma Ltd.' }
  ];

  const handleAddCustom = (symbol: string) => {
    const clean = symbol.toUpperCase().trim();
    if (!clean) return;
    toggleCustomStock(clean);
    setCustomSearchInput('');
    setSearchError(null);
  };

  const getStatusBadge = () => {
    switch (marketStatus) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Market Open (NSE / BSE)</span>
          </span>
        );
      case 'PRE_OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Pre-Open Session</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Market Closed</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 1. Header with Feature Title, Subtitle, and ON/OFF Toggle */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Market Watch</h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Optional Module
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">Live market prices at a glance</p>
              </div>
            </div>
          </div>

          {/* Master ON / OFF Control Button */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 pl-2">Market Watch:</span>
              <button
                onClick={() => toggleMarketWatch(!enabled)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  enabled
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 ring-1 ring-emerald-400'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{enabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {enabled && (
              <button
                onClick={refresh}
                disabled={loading || isUpdating}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 text-xs font-medium"
                title="Refresh market prices"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating || loading ? 'animate-spin text-cyan-400' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Line & Source Transparency */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2.5">
            {getStatusBadge()}
            {data && (
              <span className="text-[11px] text-slate-400">
                {data.marketHoursNotice}
              </span>
            )}
          </div>

          {enabled && lastUpdated && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. When Market Watch is OFF */}
      {!enabled && (
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">Market Watch is Turned OFF</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              All market-data timers, external polling, and background API calls are completely stopped to preserve your bandwidth and device resources.
            </p>
          </div>
          <button
            onClick={() => toggleMarketWatch(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950 transition flex items-center gap-2 mx-auto"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Turn ON Market Watch</span>
          </button>
        </div>
      )}

      {/* 3. When Market Watch is ON */}
      {enabled && (
        <>
          {/* Data Source Transparency Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Data Source:{' '}
                <strong className="text-amber-300">
                  {data?.providerName || 'DEMO MARKET DATA (Simulated)'}
                </strong>
                {data?.isDemo && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                    DEMO SIMULATED
                  </span>
                )}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Near-real-time market quotes • Subject to provider limits & licensing
            </span>
          </div>

          {/* Error Banner if any */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
              <button
                onClick={refresh}
                className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-xs transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && !data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                  <div className="h-8 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Section 1: Overview Cards (Gold + Major Indian Indices) */}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 24K Gold Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/30 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-300">Gold 24K</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    999 Purity
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                    ₹{data.gold.price.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-400">per {data.gold.unit}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div
                    className={`flex items-center gap-1 font-mono font-semibold ${
                      data.gold.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {data.gold.change >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {data.gold.change >= 0 ? '+' : ''}
                      ₹{data.gold.change.toLocaleString('en-IN')} ({data.gold.change >= 0 ? '+' : ''}
                      {data.gold.changePercent}%)
                    </span>
                  </div>
                  {data.gold.isStale && (
                    <span className="text-[10px] text-amber-400 font-mono">Delayed</span>
                  )}
                </div>
              </div>

              {/* Major Indices Cards */}
              {data.indices.map((idx) => {
                const isPositive = idx.change >= 0;
                return (
                  <div
                    key={idx.symbol}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-slate-300">{idx.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{idx.symbol}</span>
                    </div>

                    <div>
                      <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                        {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-400">Index Value</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <div
                        className={`flex items-center gap-1 font-mono font-semibold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isPositive ? '+' : ''}
                          {idx.change.toFixed(2)} ({isPositive ? '+' : ''}
                          {idx.changePercent}%)
                        </span>
                      </div>
                      {idx.isStale && (
                        <span className="text-[10px] text-amber-400 font-mono">Delayed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Section 2: Important Indian Stocks Watchlist */}
          {data && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Important Indian Stocks</h2>
                  <p className="text-xs text-slate-400">
                    NSE / BSE heavyweights and your personal watchlist
                  </p>
                </div>

                {/* Custom Stock Quick Add Input */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Add stock (e.g. TATAMOTORS)"
                      value={customSearchInput}
                      onChange={(e) => setCustomSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddCustom(customSearchInput);
                      }}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-56"
                    />
                  </div>
                  <button
                    onClick={() => handleAddCustom(customSearchInput)}
                    className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                    title="Add Stock"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 text-[11px]">Popular Additions:</span>
                {quickSuggestions.map((item) => {
                  const isAdded = (customWatchlist || []).includes(item.symbol);
                  return (
                    <button
                      key={item.symbol}
                      onClick={() => toggleCustomStock(item.symbol)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1.5 border ${
                        isAdded
                          ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isAdded ? <Check className="w-3 h-3 text-cyan-400" /> : <Plus className="w-3 h-3" />}
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Stocks Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Ticker</th>
                      <th className="py-3 px-4 text-right">Current Price</th>
                      <th className="py-3 px-4 text-right">Change</th>
                      <th className="py-3 px-4 text-right">Change %</th>
                      <th className="py-3 px-4 text-right hidden md:table-cell">Day High / Low</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.stocks.map((stk) => {
                      const isPositive = stk.change >= 0;
                      const isCustom = (customWatchlist || []).includes(stk.symbol);
                      return (
                        <tr key={stk.symbol} className="hover:bg-slate-800/40 transition">
                          {/* Company Name */}
                          <td className="py-3 px-4 whitespace-nowrap font-medium text-white flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{stk.name}</span>
                          </td>

                          {/* Ticker */}
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-cyan-400">
                            {stk.symbol}
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-white text-sm">
                            ₹{stk.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Change */}
                          <td
                            className={`py-3 px-4 whitespace-nowrap text-right font-mono font-semibold ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {stk.change.toFixed(2)}
                          </td>

                          {/* Change % */}
                          <td
                            className={`py-3 px-4 whitespace-nowrap text-right font-mono font-bold ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <span className="inline-flex items-center gap-0.5 justify-end">
                              {isPositive ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              <span>
                                {isPositive ? '+' : ''}
                                {stk.changePercent}%
                              </span>
                            </span>
                          </td>

                          {/* Day High / Low */}
                          <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-[11px] text-slate-400 hidden md:table-cell">
                            {stk.dayHigh && stk.dayLow ? (
                              <span>
                                H: ₹{stk.dayHigh.toFixed(1)} / L: ₹{stk.dayLow.toFixed(1)}
                              </span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {isCustom ? (
                              <button
                                onClick={() => toggleCustomStock(stk.symbol)}
                                className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                                title="Remove from watchlist"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">Core</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ask AI Copilot about the Market prompt bar */}
          {onOpenAIWithPrompt && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">
                  Ask FortiFi Copilot about market quotes or gold trends (grounded with timestamps)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAIWithPrompt('What is the current NIFTY 50 value and market status?')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition font-medium"
                >
                  NIFTY 50 Value
                </button>
                <button
                  onClick={() => onOpenAIWithPrompt('What is the current 24K gold price in INR?')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition font-medium"
                >
                  Gold Price
                </button>
              </div>
            </div>
          )}

          {/* Mandatory Disclaimer Footer (Section 31 & 30) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="text-slate-300 block">Information-Only Non-Execution Guarantee</strong>
              <p>
                Market data is provided for informational purposes only and may be delayed. FortiFi does not execute trades, place orders, buy/sell stocks, open/close investment positions, or provide personalized investment advice.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
