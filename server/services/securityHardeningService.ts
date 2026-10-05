import { z } from 'zod';

// ============================================================
// 1. ZOD SCHEMAS FOR STRICT AI OUTPUT VALIDATION (CRITICAL #2)
// ============================================================

export const ScamAnalysisSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1),
  category: z.string().min(1),
  indicators: z.array(z.string()),
  explanation: z.string().min(1),
  recommendations: z.array(z.string())
});

export type ValidatedScamAnalysis = z.infer<typeof ScamAnalysisSchema>;

export const UrlScanSchema = z.object({
  url: z.string().min(1),
  riskLevel: z.enum(['low', 'medium', 'high']),
  sslValid: z.boolean(),
  indicators: z.array(z.string()),
  explanation: z.string().min(1),
  recommendation: z.string().min(1)
});

export type ValidatedUrlScan = z.infer<typeof UrlScanSchema>;

// ============================================================
// 2. SSRF PROTECTION & PRIVATE IP VALIDATOR (CRITICAL #3)
// ============================================================

/**
 * Checks if a hostname or IP points to a private/internal network.
 * Blocks SSRF attacks against localhost, LAN, cloud metadata, integer/hex IPs.
 */
export function isPrivateOrInternalAddress(hostname: string): { isBlocked: boolean; reason?: string } {
  let host = hostname.toLowerCase().trim();

  // Strip brackets if IPv6
  if (host.startsWith('[') && host.endsWith(']')) {
    host = host.slice(1, -1);
  }

  // Localhost aliases & IPv6 loopbacks
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '::' ||
    host.startsWith('fe80:') || // IPv6 Link-Local
    host === 'ip6-localhost'
  ) {
    return { isBlocked: true, reason: 'Local loopback or link-local address blocked' };
  }

  // Cloud metadata endpoint (AWS, GCP, Azure, DigitalOcean)
  if (host === '169.254.169.254' || host.startsWith('169.254.')) {
    return { isBlocked: true, reason: 'Cloud Instance Metadata Service (169.254.169.254) blocked' };
  }

  // Check for Integer IP address representation (e.g. 2130706433 for 127.0.0.1)
  if (/^\d{8,10}$/.test(host)) {
    const intVal = parseInt(host, 10);
    const b0 = (intVal >>> 24) & 255;
    const b1 = (intVal >>> 16) & 255;
    if (b0 === 127 || b0 === 10 || (b0 === 172 && b1 >= 16 && b1 <= 31) || (b0 === 192 && b1 === 168)) {
      return { isBlocked: true, reason: 'Integer-encoded private IPv4 address representation blocked' };
    }
  }

  // Check for Hex/Octal representations (e.g. 0x7f.0.0.1)
  if (host.includes('0x') || /^0\d+/.test(host)) {
    return { isBlocked: true, reason: 'Non-standard hex or octal encoded host representation blocked' };
  }

  // Private IPv4 ranges (RFC 1918 + RFC 6598)
  const ipParts = host.split('.').map(p => parseInt(p, 10));
  if (ipParts.length === 4 && ipParts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
    const [b0, b1] = ipParts;
    // 10.0.0.0/8
    if (b0 === 10) return { isBlocked: true, reason: 'Private network class A (10.0.0.0/8) blocked' };
    // 172.16.0.0/12
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return { isBlocked: true, reason: 'Private network class B (172.16.0.0/12) blocked' };
    // 192.168.0.0/16
    if (b0 === 192 && b1 === 168) return { isBlocked: true, reason: 'Private network class C (192.168.0.0/16) blocked' };
    // 127.0.0.0/8
    if (b0 === 127) return { isBlocked: true, reason: 'Loopback network (127.0.0.0/8) blocked' };
    // 0.0.0.0/8
    if (b0 === 0) return { isBlocked: true, reason: 'Broadcast network (0.0.0.0/8) blocked' };
    // 100.64.0.0/10 (Carrier-Grade NAT RFC 6598)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return { isBlocked: true, reason: 'Carrier-Grade NAT (100.64.0.0/10) blocked' };
  }

  // Suspicious local/internal TLDs
  const internalSuffixes = ['.local', '.internal', '.lan', '.corp', '.home', '.test', '.example'];
  if (internalSuffixes.some(suffix => host.endsWith(suffix))) {
    return { isBlocked: true, reason: `Internal domain suffix (${host}) blocked from resolution` };
  }

  return { isBlocked: false };
}

/**
 * Normalizes Unicode confusable characters to ASCII equivalents for banking homoglyph detection
 */
export function normalizeHomoglyphs(str: string): string {
  const confusableMap: Record<string, string> = {
    'а': 'a', 'ä': 'a', 'à': 'a', 'á': 'a', 'ạ': 'a',
    'с': 'c', 'ç': 'c', 'ć': 'c',
    'е': 'e', 'ё': 'e', 'é': 'e', 'è': 'e',
    'і': 'i', 'ï': 'i', 'í': 'i', 'ì': 'i',
    'ј': 'j',
    'о': 'o', 'ö': 'o', 'ó': 'o', 'ò': 'o', 'ο': 'o',
    'р': 'p', 'ρ': 'p',
    'ѕ': 's', 'ş': 's',
    'у': 'y', 'ý': 'y',
    'х': 'x',
    'ԁ': 'd',
    'ɡ': 'g',
    'һ': 'h',
    'ԛ': 'q'
  };

  return str.split('').map(char => confusableMap[char] || char).join('');
}

// ============================================================
// 3. IN-MEMORY CACHE & RATE LIMITER (HACKATHON RISK #9)
// ============================================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const analysisCache = new Map<string, CacheEntry<any>>();

export function getCachedAnalysis<T>(key: string): T | null {
  const entry = analysisCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    analysisCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCachedAnalysis<T>(key: string, data: T, ttlSeconds = 600): void {
  // Prune cache if overly large
  if (analysisCache.size > 200) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) analysisCache.delete(oldestKey);
  }
  analysisCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}

// Per-user rate limiting (e.g. max 40 AI queries per minute per user)
const userQuotaUsage = new Map<string, { count: number; windowStart: number }>();

export function checkUserQuota(userId: string, maxRequestsPerMinute = 40): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userUsage = userQuotaUsage.get(userId) || { count: 0, windowStart: now };

  // 60-second sliding window reset
  if (now - userUsage.windowStart > 60000) {
    userUsage.count = 1;
    userUsage.windowStart = now;
    userQuotaUsage.set(userId, userUsage);
    return { allowed: true, remaining: maxRequestsPerMinute - 1 };
  }

  if (userUsage.count >= maxRequestsPerMinute) {
    return { allowed: false, remaining: 0 };
  }

  userUsage.count++;
  userQuotaUsage.set(userId, userUsage);
  return { allowed: true, remaining: maxRequestsPerMinute - userUsage.count };
}

// ============================================================
// 4. USER-VERIFIED MERCHANTS & FEEDBACK ("YES, THIS WAS ME") (CRITICAL #6)
// ============================================================

const verifiedMerchantsByUser = new Map<string, Set<string>>();

export function markMerchantAsVerified(userId: string, merchantName: string): void {
  const normalized = merchantName.toLowerCase().trim();
  const set = verifiedMerchantsByUser.get(userId) || new Set<string>();
  set.add(normalized);
  verifiedMerchantsByUser.set(userId, set);
}

export function isMerchantVerifiedByUser(userId: string, merchantName: string): boolean {
  const set = verifiedMerchantsByUser.get(userId);
  if (!set) return false;
  return set.has(merchantName.toLowerCase().trim());
}

export function getVerifiedMerchants(userId: string): string[] {
  const set = verifiedMerchantsByUser.get(userId);
  return set ? Array.from(set) : [];
}

// ============================================================
// 5. DEMO USER PROFILES FOR JUDGE TESTING (CRITICAL #1)
// ============================================================

export interface DemoUserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  accountsCount: number;
  initialBalance: number;
}

export const DEMO_USERS: Record<string, DemoUserProfile> = {
  'usr_001': {
    id: 'usr_001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    role: 'Primary Account Holder',
    accountsCount: 3,
    initialBalance: 61300
  },
  'usr_002': {
    id: 'usr_002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'Isolated Business Account',
    accountsCount: 1,
    initialBalance: 95000
  },
  'usr_isolated_empty': {
    id: 'usr_isolated_empty',
    name: 'New Test User (Cold Start)',
    email: 'test.user@example.com',
    role: 'Zero-Record Tenant',
    accountsCount: 0,
    initialBalance: 0
  }
};
