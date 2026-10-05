import { useState, useEffect, useCallback, useRef } from 'react';
import { NormalizedMarketOverview, UserMarketSettings, MarketStatus } from '../types/market.ts';
import { MarketService } from '../services/marketService.ts';

export function useMarketData(activeUserId: string = 'usr_001') {
  const [settings, setSettings] = useState<UserMarketSettings>({
    userId: activeUserId,
    marketWatchEnabled: false, // Default is OFF as required
    customWatchlist: [],
    refreshIntervalMs: 30000
  });

  const [data, setData] = useState<NormalizedMarketOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // 1. Load initial user settings
  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;

    const loadSettings = async () => {
      try {
        const userSettings = await MarketService.getSettings(activeUserId);
        if (!isCancelled && isMountedRef.current) {
          setSettings(userSettings);
        }
      } catch (err) {
        console.warn('Could not load market settings, using default OFF:', err);
      }
    };

    loadSettings();

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeUserId]);

  // 2. Fetch fresh market data
  const fetchData = useCallback(async (isSilent = false) => {
    if (!settings.marketWatchEnabled) {
      return;
    }

    if (!isSilent) setLoading(true);
    else setIsUpdating(true);

    setError(null);

    try {
      const overview = await MarketService.getOverview(activeUserId);
      if (isMountedRef.current) {
        setData(overview);
        setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.error('Error fetching market data:', err);
        setError('Market data is currently unavailable. Please check your connection or try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsUpdating(false);
      }
    }
  }, [activeUserId, settings.marketWatchEnabled]);

  // 3. Polling timer: runs ONLY when marketWatchEnabled is TRUE!
  // When OFF: strictly terminates timers and stops all background calls.
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!settings.marketWatchEnabled) {
      return;
    }

    // Initial fetch when turned ON
    fetchData(false);

    // Controlled interval (default 30s)
    const intervalMs = settings.refreshIntervalMs || 30000;
    timerRef.current = setInterval(() => {
      fetchData(true);
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [settings.marketWatchEnabled, settings.refreshIntervalMs, fetchData]);

  // 4. Toggle Market Watch ON / OFF
  const toggleMarketWatch = async (enabled: boolean) => {
    try {
      const updated = await MarketService.updateSettings(activeUserId, {
        marketWatchEnabled: enabled
      });
      setSettings(updated);

      if (!enabled) {
        // Clear all timers and data immediately
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    } catch (err) {
      console.error('Error saving market toggle state:', err);
      // Fallback local update
      setSettings((prev) => ({ ...prev, marketWatchEnabled: enabled }));
    }
  };

  // 5. Add / Remove stock from custom watchlist
  const toggleCustomStock = async (symbol: string) => {
    const cleanSym = symbol.toUpperCase().trim();
    const currentList = settings.customWatchlist || [];
    const exists = currentList.includes(cleanSym);

    const newList = exists
      ? currentList.filter((s) => s !== cleanSym)
      : [...currentList, cleanSym];

    try {
      const updated = await MarketService.updateSettings(activeUserId, {
        customWatchlist: newList
      });
      setSettings(updated);
      fetchData(false);
    } catch (err) {
      console.error('Error updating watchlist:', err);
    }
  };

  return {
    enabled: settings.marketWatchEnabled,
    customWatchlist: settings.customWatchlist,
    data,
    loading,
    error,
    lastUpdated,
    isUpdating,
    marketStatus: (data?.marketStatus || 'CLOSED') as MarketStatus,
    refresh: () => fetchData(false),
    toggleMarketWatch,
    toggleCustomStock
  };
}
