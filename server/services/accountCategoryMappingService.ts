import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export interface AccountCategoryMapping {
  id: string;
  userId: string;
  accountNumber: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantCategoryMapping {
  id: string;
  userId: string;
  merchantName: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const MAPPINGS_FILE = path.join(DATA_DIR, 'accountCategoryMappings.json');
const MERCHANT_MAPPINGS_FILE = path.join(DATA_DIR, 'merchantCategoryMappings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache loaded from persistent JSON
let accountMappings: AccountCategoryMapping[] = [];
let merchantMappings: MerchantCategoryMapping[] = [];

function loadData() {
  try {
    if (fs.existsSync(MAPPINGS_FILE)) {
      const content = fs.readFileSync(MAPPINGS_FILE, 'utf-8');
      accountMappings = JSON.parse(content);
    } else {
      accountMappings = [];
      saveAccountMappings();
    }
  } catch (err) {
    console.error('Error loading account mappings:', err);
    accountMappings = [];
  }

  try {
    if (fs.existsSync(MERCHANT_MAPPINGS_FILE)) {
      const content = fs.readFileSync(MERCHANT_MAPPINGS_FILE, 'utf-8');
      merchantMappings = JSON.parse(content);
    } else {
      merchantMappings = [];
      saveMerchantMappings();
    }
  } catch (err) {
    console.error('Error loading merchant mappings:', err);
    merchantMappings = [];
  }
}

function saveAccountMappings() {
  try {
    fs.writeFileSync(MAPPINGS_FILE, JSON.stringify(accountMappings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving account mappings:', err);
  }
}

function saveMerchantMappings() {
  try {
    fs.writeFileSync(MERCHANT_MAPPINGS_FILE, JSON.stringify(merchantMappings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving merchant mappings:', err);
  }
}

// Initial load
loadData();

export class AccountCategoryMappingService {
  /**
   * Normalize account number for consistent matching (case-insensitive, trimmed)
   */
  static normalizeAccountNumber(accNum: string): string {
    return accNum.trim().toUpperCase();
  }

  /**
   * Find learned category for a given account number and user
   */
  static async getMapping(userId: string, accountNumber: string): Promise<AccountCategoryMapping | null> {
    const normalized = this.normalizeAccountNumber(accountNumber);
    const found = accountMappings.find(
      (m) => m.userId === userId && this.normalizeAccountNumber(m.accountNumber) === normalized
    );
    return found || null;
  }

  /**
   * Get all learned account mappings for a user
   */
  static async getAllMappings(userId: string): Promise<AccountCategoryMapping[]> {
    return accountMappings.filter((m) => m.userId === userId);
  }

  /**
   * Learn or update an account-category mapping
   */
  static async setMapping(userId: string, accountNumber: string, category: string): Promise<AccountCategoryMapping> {
    const normalized = this.normalizeAccountNumber(accountNumber);
    const now = new Date().toISOString();

    const existingIndex = accountMappings.findIndex(
      (m) => m.userId === userId && this.normalizeAccountNumber(m.accountNumber) === normalized
    );

    if (existingIndex >= 0) {
      accountMappings[existingIndex].category = category;
      accountMappings[existingIndex].updatedAt = now;
      saveAccountMappings();
      return accountMappings[existingIndex];
    } else {
      const newMapping: AccountCategoryMapping = {
        id: `map_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        accountNumber: normalized,
        category,
        createdAt: now,
        updatedAt: now
      };
      accountMappings.push(newMapping);
      saveAccountMappings();
      return newMapping;
    }
  }

  /**
   * Delete an account mapping
   */
  static async deleteMapping(userId: string, accountNumber: string): Promise<boolean> {
    const normalized = this.normalizeAccountNumber(accountNumber);
    const initialLen = accountMappings.length;
    accountMappings = accountMappings.filter(
      (m) => !(m.userId === userId && this.normalizeAccountNumber(m.accountNumber) === normalized)
    );
    if (accountMappings.length !== initialLen) {
      saveAccountMappings();
      return true;
    }
    return false;
  }

  /**
   * Merchant mapping support
   */
  static async getMerchantMapping(userId: string, merchantName: string): Promise<MerchantCategoryMapping | null> {
    const normalized = merchantName.trim().toLowerCase();
    const found = merchantMappings.find(
      (m) => m.userId === userId && m.merchantName.trim().toLowerCase() === normalized
    );
    return found || null;
  }

  static async setMerchantMapping(userId: string, merchantName: string, category: string): Promise<MerchantCategoryMapping> {
    const normalized = merchantName.trim();
    const now = new Date().toISOString();

    const existingIndex = merchantMappings.findIndex(
      (m) => m.userId === userId && m.merchantName.trim().toLowerCase() === normalized.toLowerCase()
    );

    if (existingIndex >= 0) {
      merchantMappings[existingIndex].category = category;
      merchantMappings[existingIndex].updatedAt = now;
      saveMerchantMappings();
      return merchantMappings[existingIndex];
    } else {
      const newMapping: MerchantCategoryMapping = {
        id: `mmap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        merchantName: normalized,
        category,
        createdAt: now,
        updatedAt: now
      };
      merchantMappings.push(newMapping);
      saveMerchantMappings();
      return newMapping;
    }
  }

  /**
   * Reset / clear for tests
   */
  static clearForUser(userId: string) {
    accountMappings = accountMappings.filter((m) => m.userId !== userId);
    merchantMappings = merchantMappings.filter((m) => m.userId !== userId);
    saveAccountMappings();
    saveMerchantMappings();
  }
}
