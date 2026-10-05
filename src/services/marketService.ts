import { NormalizedMarketOverview, GoldPrice, UserMarketSettings } from '../types/market.ts';

export class MarketService {
  /**
   * Fetch authenticated user's Market Watch preferences
   */
  static async getSettings(userId: string): Promise<UserMarketSettings> {
    const res = await fetch('/api/market/settings', {
      headers: {
        'x-user-id': userId,
        'Authorization': `Bearer ${userId}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch market settings');
    const json = await res.json();
    return json.settings;
  }

  /**
   * Update authenticated user's Market Watch preferences
   */
  static async updateSettings(userId: string, updates: Partial<UserMarketSettings>): Promise<UserMarketSettings> {
    const res = await fetch('/api/market/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'Authorization': `Bearer ${userId}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update market settings');
    const json = await res.json();
    return json.settings;
  }

  /**
   * Fetch complete normalized market overview (Gold, Indices, Stocks)
   */
  static async getOverview(userId: string): Promise<NormalizedMarketOverview> {
    const res = await fetch('/api/market/overview', {
      headers: {
        'x-user-id': userId,
        'Authorization': `Bearer ${userId}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch market overview');
    return await res.json();
  }

  /**
   * Fetch standalone gold price
   */
  static async getGoldPrice(): Promise<GoldPrice> {
    const res = await fetch('/api/market/gold');
    if (!res.ok) throw new Error('Failed to fetch gold price');
    const json = await res.json();
    return json.gold;
  }
}
