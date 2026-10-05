import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Coins, BarChart2 } from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';

interface MarketWatchCompactWidgetProps {
  activeUserId?: string;
  onNavigateToMarketWatch: () => void;
}

export const MarketWatchCompactWidget: React.FC<MarketWatchCompactWidgetProps> = ({
  activeUserId = 'usr_001',
  onNavigateToMarketWatch
}) => {
  const { enabled, data, loading, marketStatus } = useMarketData(activeUserId);

  // If Market Watch is turned OFF, completely hide the widget as requested in Section 26
  if (!enabled || !data) {
    return null;
  }

  const nifty = data.indices.find((i) => i.symbol === 'NIFTY50');
  const sensex = data.indices.find((i) => i.symbol === 'SENSEX');
  const gold = data.gold;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 shadow-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white">Market Watch</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {marketStatus === 'OPEN' ? '● Open' : '● Closed'}
          </span>
        </div>

        <button
          onClick={onNavigateToMarketWatch}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
        >
          <span>View Full Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        {/* NIFTY 50 Ticker */}
        {nifty && (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-300 block">NIFTY 50</span>
              <span className="text-xs font-mono font-bold text-white">
                {nifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span
              className={`text-[11px] font-mono font-bold flex items-center gap-0.5 ${
                nifty.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {nifty.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {nifty.change >= 0 ? '+' : ''}
                {nifty.changePercent}%
              </span>
            </span>
          </div>
        )}

        {/* SENSEX Ticker */}
        {sensex && (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-300 block">SENSEX</span>
              <span className="text-xs font-mono font-bold text-white">
                {sensex.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span
              className={`text-[11px] font-mono font-bold flex items-center gap-0.5 ${
                sensex.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {sensex.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {sensex.change >= 0 ? '+' : ''}
                {sensex.changePercent}%
              </span>
            </span>
          </div>
        )}

        {/* 24K Gold Ticker */}
        {gold && (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-300 block">Gold 24K (10g)</span>
              <span className="text-xs font-mono font-bold text-white">
                ₹{gold.price.toLocaleString('en-IN')}
              </span>
            </div>
            <span
              className={`text-[11px] font-mono font-bold flex items-center gap-0.5 ${
                gold.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {gold.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {gold.change >= 0 ? '+' : ''}
                {gold.changePercent}%
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
