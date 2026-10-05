import { PREDEFINED_CATEGORIES, type TransactionCategory, type AccountCategoryMapping } from '../types/index.ts';

interface CategoryRule {
  category: TransactionCategory;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Food',
    keywords: [
      'candy', 'candies', 'chocolate', 'sweets', 'burger', 'pizza', 'sandwich',
      'coffee', 'tea', 'chai', 'milk', 'bread', 'rice', 'dal', 'vegetable', 'vegetables',
      'fruit', 'fruits', 'snack', 'snacks', 'biscuit', 'cookies', 'restaurant',
      'hotel', 'dining', 'lunch', 'dinner', 'breakfast', 'cake', 'juice', 'soda',
      'ice cream', 'biryani', 'grocery', 'groceries', 'food material', 'food materials',
      'food', 'paneer', 'chicken', 'egg', 'eggs', 'flour', 'atta', 'oil', 'masala',
      'spices', 'bakery', 'swiggy', 'zomato', 'canteen'
    ]
  },
  {
    category: 'Education',
    keywords: [
      'notebook', 'notebooks', 'book', 'books', 'textbook', 'pen', 'pens', 'pencil',
      'pencils', 'eraser', 'sharpener', 'scale', 'ruler', 'geometry', 'stationery',
      'exam', 'tuition', 'school', 'college', 'university', 'course', 'fees',
      'admission', 'academy', 'library', 'coaching', 'study material', 'calculator',
      'drawing book', 'binder', 'worksheet', 'notes'
    ]
  },
  {
    category: 'Transport',
    keywords: [
      'bus ticket', 'bus fare', 'train ticket', 'flight', 'air ticket', 'auto fare',
      'taxi', 'cab', 'uber', 'ola', 'rapido', 'petrol', 'diesel', 'fuel', 'gasoline',
      'toll', 'metro', 'parking', 'fastag', 'bike repair', 'scooter repair', 'commute',
      'ticket', 'fare', 'subway'
    ]
  },
  {
    category: 'Clothing',
    keywords: [
      'shirt', 't-shirt', 'dress', 'pants', 'trousers', 'jeans', 'saree', 'sari',
      'fabric', 'cloth', 'cotton', 'silk', 'garment', 'garments', 'tailor',
      'tailoring', 'skirt', 'suit', 'blazer', 'shoes', 'sandals', 'slippers',
      'chappal', 'textile', 'kurti', 'kurta', 'shawl', 'socks', 'jacket',
      'hoodie', 'apparel', 'uniform'
    ]
  },
  {
    category: 'Electronics',
    keywords: [
      'cable', 'charger', 'adapter', 'mouse', 'keyboard', 'monitor', 'screen',
      'mobile', 'phone', 'smartphone', 'laptop', 'computer', 'printer', 'printer ink',
      'xerox machine', 'toner', 'cartridge', 'battery', 'batteries', 'headphone',
      'earbuds', 'earphones', 'usb', 'hard drive', 'ssd', 'ram', 'pen drive',
      'tablet', 'gadget', 'electronic'
    ]
  },
  {
    category: 'Bills',
    keywords: [
      'electricity', 'eb bill', 'power bill', 'water bill', 'wifi', 'broadband',
      'internet bill', 'mobile recharge', 'phone recharge', 'postpaid', 'prepaid',
      'lpg', 'gas cylinder', 'gas bill', 'maintenance', 'house rent', 'shop rent',
      'office rent', 'dth', 'tata play', 'cable tv', 'property tax'
    ]
  },
  {
    category: 'Business',
    keywords: [
      'xerox material', 'xerox materials', 'xerox paper', 'a4 paper', 'copier paper',
      'printing paper', 'binding sheet', 'lamination pouch', 'lamination',
      'raw material', 'raw materials', 'supplier', 'inventory', 'vendor',
      'wholesale', 'packaging', 'courier', 'delivery', 'shipping', 'box',
      'carton', 'gst', 'audit', 'trademark', 'license', 'business card',
      'flyer', 'banner', 'pos roll', 'thermal paper'
    ]
  },
  {
    category: 'Entertainment',
    keywords: [
      'movie', 'cinema', 'theatre', 'theater', 'netflix', 'prime video', 'hotstar',
      'spotify', 'game', 'gaming', 'playstation', 'concert', 'park', 'amusement',
      'festival', 'circus', 'bowling', 'party'
    ]
  },
  {
    category: 'Healthcare',
    keywords: [
      'medicine', 'medicines', 'tablet', 'tablets', 'capsule', 'syrup', 'doctor',
      'clinic', 'hospital', 'dental', 'dentist', 'medical', 'pharmacy', 'chemist',
      'injection', 'bandage', 'health checkup', 'diagnostic', 'blood test', 'scan',
      'consultation'
    ]
  },
  {
    category: 'Shopping',
    keywords: [
      'supermarket', 'mall', 'mart', 'amazon', 'flipkart', 'myntra', 'retail store',
      'bazaar', 'general store', 'department store', 'shopping'
    ]
  }
];

export interface ClassificationResult {
  category: TransactionCategory;
  confidence: 'high' | 'medium' | 'low' | 'none';
  matchedKeyword?: string;
  cleanItemName: string;
  isGeneralTransaction: boolean;
}

/**
 * Intelligent category classifier for items/products.
 * If unable to identify confidently, assigns "General Transactions".
 */
export function classifyItemCategory(rawInput: string): ClassificationResult {
  if (!rawInput || !rawInput.trim()) {
    return {
      category: 'General Transactions',
      confidence: 'none',
      cleanItemName: 'General Item',
      isGeneralTransaction: true
    };
  }

  const normalized = rawInput.toLowerCase().trim();

  // Strip common transaction fluff like "Bought a", "Purchased", "Paid for", "for ₹500", etc.
  let cleaned = rawInput
    .replace(/^(bought|purchased|paid\s+for|bought\s+a|bought\s+an|got\s+a|got|ordered)\s+/i, '')
    .replace(/\s+(for|worth|costing|at)\s+(₹|rs\.?|inr)?\s*\d+(\.\d+)?/gi, '')
    .trim();

  if (!cleaned) {
    cleaned = rawInput.trim();
  }

  // 1. Check for exact or multi-word phrase matches
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      // Regex check with word boundary
      const regex = new RegExp(`\\b${kw}s?\\b`, 'i');
      if (regex.test(normalized)) {
        return {
          category: rule.category,
          confidence: 'high',
          matchedKeyword: kw,
          cleanItemName: capitalizeFirst(cleaned),
          isGeneralTransaction: false
        };
      }
    }
  }

  // 2. Check for partial substring match (medium confidence)
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (kw.length >= 4 && normalized.includes(kw)) {
        return {
          category: rule.category,
          confidence: 'medium',
          matchedKeyword: kw,
          cleanItemName: capitalizeFirst(cleaned),
          isGeneralTransaction: false
        };
      }
    }
  }

  // 3. Fallback: Cannot confidently identify
  // DO NOT REJECT. DO NOT ASSIGN RANDOM CATEGORY.
  // Save as "General Transactions".
  return {
    category: 'General Transactions',
    confidence: 'none',
    cleanItemName: capitalizeFirst(cleaned),
    isGeneralTransaction: true
  };
}

function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export interface CategoryResolutionParams {
  accountNumber?: string;
  merchantName?: string;
  itemName?: string;
  learnedAccountMappings?: AccountCategoryMapping[];
}

export interface CategoryResolutionResult {
  category: TransactionCategory;
  source: 'ACCOUNT_LEARNED' | 'ITEM_DETECTED' | 'UNKNOWN_ACCOUNT_FALLBACK' | 'UNRESOLVED_FALLBACK';
  confidence: 'high' | 'medium' | 'low' | 'none';
  matchedRule?: string;
  isGeneralTransaction: boolean;
  cleanItemName: string;
}

/**
 * Resolves category following Priority Rule (Section 4):
 * 1. If Account Number is provided:
 *    - If learned: Use learned category
 *    - If unknown: Save under "General Transactions"
 * 2. If Account Number is not provided:
 *    - Try normal item/merchant category detection
 *    - If confidently identified -> use detected category
 *    - Else -> save as "General Transactions"
 */
export function resolveCategoryWithAccountPriority(params: CategoryResolutionParams): CategoryResolutionResult {
  const { accountNumber, merchantName, itemName, learnedAccountMappings = [] } = params;
  const inputTarget = (itemName || merchantName || '').trim();
  const cleanedItem = inputTarget ? classifyItemCategory(inputTarget).cleanItemName : 'Transaction Item';

  // Rule 4: Check Account Number first if provided
  if (accountNumber && accountNumber.trim()) {
    const normalizedAcc = accountNumber.trim().toUpperCase();
    const learnedMapping = learnedAccountMappings.find(
      (m) => m.accountNumber.trim().toUpperCase() === normalizedAcc
    );

    if (learnedMapping) {
      // YES -> Use learned category
      return {
        category: learnedMapping.category,
        source: 'ACCOUNT_LEARNED',
        confidence: 'high',
        matchedRule: `Learned Account (${normalizedAcc} → ${learnedMapping.category})`,
        isGeneralTransaction: learnedMapping.category === 'General Transactions',
        cleanItemName: cleanedItem
      };
    } else {
      // NO -> Unknown account number
      // Accept user request rule:
      // "Because 'XXXX1234' is not known yet: Category: General Transactions. The transaction must be successfully saved. Do NOT reject the transaction. Do NOT randomly assign a category."
      return {
        category: 'General Transactions',
        source: 'UNKNOWN_ACCOUNT_FALLBACK',
        confidence: 'none',
        matchedRule: `Unknown Account (${normalizedAcc})`,
        isGeneralTransaction: true,
        cleanItemName: cleanedItem
      };
    }
  }

  // If no account number was provided, use normal item/merchant category detection
  const detected = classifyItemCategory(inputTarget);
  return {
    category: detected.category,
    source: detected.isGeneralTransaction ? 'UNRESOLVED_FALLBACK' : 'ITEM_DETECTED',
    confidence: detected.confidence,
    matchedRule: detected.matchedKeyword ? `Keyword: ${detected.matchedKeyword}` : undefined,
    isGeneralTransaction: detected.isGeneralTransaction,
    cleanItemName: detected.cleanItemName
  };
}
