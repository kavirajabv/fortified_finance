import {
  Transaction,
  BudgetCategory,
  SavingsGoal,
  Product,
  Invoice,
  Customer,
  SecurityAlert,
  UserProfile,
  FinancialAccount,
  BusinessAccount,
  GeneralTransaction,
  AccountTransaction
} from '../types';

export const initialUserProfile: UserProfile = {
  id: 'usr_001',
  name: 'Vikram Sharma',
  email: 'vikram.sharma@example.com',
  preferredCurrency: '₹',
  mode: 'personal',
  mfaEnabled: true,
  securityScore: 86
};

export const sampleFinancialAccounts: FinancialAccount[] = [
  {
    id: 'fa_hdfc_01',
    userId: 'usr_001',
    provider: 'account_aggregator',
    accountReference: 'HDFC-AA-REF-892110',
    accountType: 'Savings',
    maskedAccountNumber: '••4092',
    institutionName: 'HDFC Bank',
    status: 'CONNECTED — READ ONLY',
    consentId: 'consent_aa_hdfc_8921',
    consentStatus: 'ACTIVE',
    consentCreatedAt: '2026-10-01T09:30:00Z',
    consentExpiresAt: '2027-10-01T09:30:00Z',
    lastSyncedAt: '05 Oct 2026, 10:15 AM',
    balance: 82450,
    permissionsGranted: [
      'Account profile and basic metadata',
      'Read-only transaction history (90 days)',
      'Account balance summary'
    ],
    permissionsDenied: [
      'Money transfer or remittance initiation',
      'Bill payments & third-party debits',
      'Account configuration & beneficiary modification',
      'Credential or authentication factor retention'
    ],
    createdAt: '2026-10-01',
    updatedAt: '2026-10-05'
  }
];

export const sampleTransactions: Transaction[] = [
  {
    id: 'tx_01',
    amount: 27500,
    type: 'expense',
    merchant: 'Offshore Remit Ltd (Unverified Gateway)',
    category: 'international transfer',
    date: '2026-10-04',
    description: 'Urgent overseas remittance flagged for abnormal spending jump',
    riskLevel: 'high',
    riskReasons: [
      'Amount (₹27,500) deviates 15x from your daily normal transaction average',
      'Merchant entity is registered outside primary banking residency region',
      'First-time recipient with rapid authorization attempt'
    ],
    account: 'HDFC Priority A/C ••4092',
    source: 'DEMO'
  },
  {
    id: 'tx_02',
    amount: 55000,
    type: 'income',
    merchant: 'FinTech Innovations Inc',
    category: 'salary',
    date: '2026-10-01',
    description: 'Monthly payroll deposit',
    riskLevel: 'low',
    account: 'HDFC Priority A/C ••4092',
    source: 'DEMO'
  },
  {
    id: 'tx_03',
    amount: 18000,
    type: 'income',
    merchant: 'CloudCraft Consulting Client',
    category: 'freelance',
    date: '2026-10-03',
    description: 'Quarterly architecture review retainer',
    riskLevel: 'low',
    account: 'ICICI Direct ••8114',
    source: 'DEMO'
  },
  {
    id: 'tx_04',
    amount: 2499,
    type: 'expense',
    merchant: 'Amazon Retail India',
    category: 'shopping',
    date: '2026-10-04',
    description: 'Ergonomic mousepad & wireless desktop charger',
    riskLevel: 'low',
    account: 'HDFC Priority A/C ••4092',
    source: 'DEMO'
  },
  {
    id: 'tx_05',
    amount: 650,
    type: 'expense',
    merchant: 'Swiggy Gourmet',
    category: 'food',
    date: '2026-10-04',
    description: 'Lunch delivery - Mediterranean Bowl',
    riskLevel: 'low',
    account: 'ICICI Direct ••8114',
    source: 'DEMO'
  },
  {
    id: 'tx_06',
    amount: 12500,
    type: 'expense',
    merchant: 'Prestige Apartments HOA',
    category: 'housing',
    date: '2026-10-02',
    description: 'Monthly residential maintenance & utilities',
    riskLevel: 'low',
    account: 'HDFC Priority A/C ••4092',
    source: 'DEMO'
  },
  {
    id: 'tx_07',
    amount: 4200,
    type: 'expense',
    merchant: 'FitPro Athletic Club',
    category: 'health',
    date: '2026-10-02',
    description: 'Gym & wellness membership',
    riskLevel: 'low',
    account: 'HDFC Priority A/C ••4092',
    source: 'DEMO'
  },
  {
    id: 'tx_08',
    amount: 3200,
    type: 'expense',
    merchant: 'FuelStation Express',
    category: 'transport',
    date: '2026-10-03',
    description: 'Weekly vehicle fuel refill',
    riskLevel: 'low',
    account: 'ICICI Direct ••8114',
    source: 'DEMO'
  },
  {
    id: 'tx_09',
    amount: 1150,
    type: 'expense',
    merchant: 'Netflix & Spotify Digital',
    category: 'entertainment',
    date: '2026-10-03',
    description: 'Digital entertainment family bundle',
    riskLevel: 'low',
    account: 'ICICI Direct ••8114',
    source: 'DEMO'
  }
];

export const sampleBudgets: BudgetCategory[] = [
  { id: 'b_1', category: 'Food & Dining', allocated: 10000, spent: 8250, period: 'October 2026' },
  { id: 'b_2', category: 'Housing & Utilities', allocated: 18000, spent: 14500, period: 'October 2026' },
  { id: 'b_3', category: 'Transportation', allocated: 6000, spent: 3950, period: 'October 2026' },
  { id: 'b_4', category: 'Shopping', allocated: 8000, spent: 6800, period: 'October 2026' },
  { id: 'b_5', category: 'Entertainment', allocated: 3000, spent: 2850, period: 'October 2026' },
  { id: 'b_6', category: 'Health & Wellness', allocated: 5000, spent: 4200, period: 'October 2026' }
];

export const sampleSavingsGoals: SavingsGoal[] = [
  {
    id: 'g_1',
    title: 'Emergency Safety Cushion',
    targetAmount: 250000,
    currentAmount: 195000,
    targetDate: '2026-12-31'
  },
  {
    id: 'g_2',
    title: 'M3 Pro Workstation Rig',
    targetAmount: 180000,
    currentAmount: 142000,
    targetDate: '2026-11-30'
  },
  {
    id: 'g_3',
    title: 'Kyoto Travel Fund',
    targetAmount: 120000,
    currentAmount: 48000,
    targetDate: '2027-04-15'
  }
];

export const sampleProducts: Product[] = [
  {
    id: 'prod_1',
    sku: 'CAB-USB-01',
    name: 'Braided Type-C Thunderbolt Cable 2m',
    category: 'Cables & Adapters',
    price: 699,
    cost: 280,
    stock: 12,
    minimumStock: 10,
    supplier: 'NexGen Peripherals Hub'
  },
  {
    id: 'prod_2',
    sku: 'MSE-WL-PRO',
    name: 'ErgoPrecision Wireless Mouse',
    category: 'Peripherals',
    price: 2499,
    cost: 1100,
    stock: 8,
    minimumStock: 15,
    supplier: 'OptiGrip Hardware Ltd'
  },
  {
    id: 'prod_3',
    sku: 'KB-MECH-RGB',
    name: 'Tactile Mechanical Keyboard 75%',
    category: 'Peripherals',
    price: 4999,
    cost: 2600,
    stock: 24,
    minimumStock: 8,
    supplier: 'Apex Keyboards Co'
  },
  {
    id: 'prod_4',
    sku: 'HUB-USB-10IN1',
    name: 'Aluminum 10-in-1 Dual 4K USB-C Dock',
    category: 'Docks & Hubs',
    price: 5499,
    cost: 2900,
    stock: 6,
    minimumStock: 10,
    supplier: 'NexGen Peripherals Hub'
  },
  {
    id: 'prod_5',
    sku: 'MNT-ARM-DUAL',
    name: 'Heavy-Duty Gas Spring Dual Monitor Arm',
    category: 'Mounts & Ergonomics',
    price: 3799,
    cost: 1950,
    stock: 18,
    minimumStock: 5,
    supplier: 'ErgoTech Industries'
  }
];

export const sampleInvoices: Invoice[] = [
  {
    id: 'inv_101',
    invoiceNumber: 'INV-2026-8812',
    customerName: 'Apex Studio Labs',
    customerEmail: 'procurement@apexstudios.design',
    items: [
      { productId: 'prod_3', name: 'Tactile Mechanical Keyboard 75%', sku: 'KB-MECH-RGB', unitPrice: 4999, quantity: 2, total: 9998 },
      { productId: 'prod_2', name: 'ErgoPrecision Wireless Mouse', sku: 'MSE-WL-PRO', unitPrice: 2499, quantity: 2, total: 4998 }
    ],
    subtotal: 14996,
    discount: 500,
    tax: 2609,
    total: 17105,
    status: 'paid',
    createdAt: '2026-10-04',
    dueDate: '2026-10-18'
  },
  {
    id: 'inv_102',
    invoiceNumber: 'INV-2026-8794',
    customerName: 'Zenith Tech Systems',
    customerEmail: 'accounts@zenithtech.io',
    items: [
      { productId: 'prod_4', name: 'Aluminum 10-in-1 Dual 4K USB-C Dock', sku: 'HUB-USB-10IN1', unitPrice: 5499, quantity: 4, total: 21996 }
    ],
    subtotal: 21996,
    discount: 1000,
    tax: 3779,
    total: 24775,
    status: 'pending',
    createdAt: '2026-09-28',
    dueDate: '2026-10-12'
  },
  {
    id: 'inv_103',
    invoiceNumber: 'INV-2026-8650',
    customerName: 'Kaveri Co-Working Spaces',
    customerEmail: 'billing@kaverispaces.com',
    items: [
      { productId: 'prod_5', name: 'Heavy-Duty Gas Spring Dual Monitor Arm', sku: 'MNT-ARM-DUAL', unitPrice: 3799, quantity: 2, total: 7598 }
    ],
    subtotal: 7598,
    discount: 370,
    tax: 1301,
    total: 8529,
    status: 'pending',
    createdAt: '2026-09-20',
    dueDate: '2026-10-05'
  }
];

export const sampleCustomers: Customer[] = [
  { id: 'c_1', name: 'Apex Studio Labs', email: 'procurement@apexstudios.design', phone: '+91 98401 22891', totalPurchases: 42100, lastOrderDate: '2026-10-04' },
  { id: 'c_2', name: 'Zenith Tech Systems', email: 'accounts@zenithtech.io', phone: '+91 97110 54109', totalPurchases: 68500, lastOrderDate: '2026-09-28' },
  { id: 'c_3', name: 'Kaveri Co-Working Spaces', email: 'billing@kaverispaces.com', phone: '+91 98840 91023', totalPurchases: 25400, lastOrderDate: '2026-09-20' }
];

export const sampleSecurityAlerts: SecurityAlert[] = [
  {
    id: 'sec_1',
    title: 'Extreme Outlier Transaction Detected (₹27,500)',
    description: 'Transaction to Offshore Remit Ltd exceeds 15x normal expense median. Flagged for fraud verification.',
    severity: 'high',
    type: 'transaction_anomaly',
    timestamp: 'Today, 14:22',
    status: 'active'
  },
  {
    id: 'sec_2',
    title: 'Suspicious Phishing SMS Blocked by CyberShield',
    description: 'Simulated alert: Message claiming KYC suspension with fake banking redirect URL stopped.',
    severity: 'high',
    type: 'phishing',
    timestamp: 'Yesterday, 19:05',
    status: 'active'
  },
  {
    id: 'sec_3',
    title: 'Unfamiliar IP Range Verification Requested',
    description: 'New login session from unrecognized autonomous system. Two-factor authentication successfully cleared.',
    severity: 'medium',
    type: 'unusual_login',
    timestamp: 'Oct 02, 2026',
    status: 'resolved'
  }
];

// ==========================================
// Multi-Business Accounts & General Transfers
// ==========================================

export const sampleBusinessAccounts: BusinessAccount[] = [
  {
    id: 'acc_food',
    name: 'Food Business',
    type: 'Food',
    balance: 15000, // Starts at 20,000, 5,000 transferred
    currency: '₹',
    color: 'emerald',
    icon: 'Utensils',
    description: 'Restaurant, catering, snacks & pantry operations',
    createdAt: '2026-10-01'
  },
  {
    id: 'acc_dress',
    name: 'Dress Business',
    type: 'Dress',
    balance: 32500, // Starts at 35,000, 2,500 transferred
    currency: '₹',
    color: 'purple',
    icon: 'Shirt',
    description: 'Boutique, ethnic apparel & textile supplies',
    createdAt: '2026-10-01'
  },
  {
    id: 'acc_xerox',
    name: 'Xerox Business',
    type: 'Xerox',
    balance: 13800, // Starts at 15,000, 1,200 transferred
    currency: '₹',
    color: 'blue',
    icon: 'Printer',
    description: 'Document printing, lamination & scanning center',
    createdAt: '2026-10-01'
  }
];

export const sampleGeneralTransactions: GeneralTransaction[] = [
  {
    id: 'gen_01',
    date: '05 Oct 2026',
    time: '10:30 AM',
    fromAccountId: 'acc_food',
    fromAccountName: 'Food Business',
    toPerson: 'Kumar',
    isUnknownPerson: false,
    amount: 5000,
    purpose: 'Food materials',
    note: 'Paid through transfer',
    userId: 'usr_001',
    createdAt: '2026-10-05T10:30:00Z'
  },
  {
    id: 'gen_02',
    date: '05 Oct 2026',
    time: '11:45 AM',
    fromAccountId: 'acc_dress',
    fromAccountName: 'Dress Business',
    toPerson: 'Unknown Person',
    isUnknownPerson: true,
    amount: 2500,
    purpose: 'Dress purchase',
    note: '-',
    userId: 'usr_001',
    createdAt: '2026-10-05T11:45:00Z'
  },
  {
    id: 'gen_03',
    date: '05 Oct 2026',
    time: '02:15 PM',
    fromAccountId: 'acc_xerox',
    fromAccountName: 'Xerox Business',
    toPerson: 'Supplier',
    isUnknownPerson: false,
    amount: 1200,
    purpose: 'Xerox materials',
    note: '-',
    userId: 'usr_001',
    createdAt: '2026-10-05T14:15:00Z'
  }
];

export const sampleAccountTransactions: AccountTransaction[] = [
  // Food Business Account Transactions
  {
    id: 'atx_f01',
    accountId: 'acc_food',
    accountName: 'Food Business',
    itemName: 'Candy & Snacks Restock',
    amount: 500,
    type: 'expense',
    category: 'Food',
    paymentMethod: 'UPI',
    date: '05 Oct 2026',
    time: '09:15 AM',
    userId: 'usr_001',
    note: 'Cash counter confectionary',
    wasAutoCategorized: true
  },
  {
    id: 'atx_f02',
    accountId: 'acc_food',
    accountName: 'Food Business',
    itemName: 'Transfer to Kumar (Food materials)',
    amount: 5000,
    type: 'transfer_out',
    category: 'General Transactions',
    paymentMethod: 'Bank Transfer',
    date: '05 Oct 2026',
    time: '10:30 AM',
    userId: 'usr_001',
    note: 'Paid through transfer',
    transferId: 'gen_01'
  },

  // Dress Business Account Transactions
  {
    id: 'atx_d01',
    accountId: 'acc_dress',
    accountName: 'Dress Business',
    itemName: 'Cotton Silk Fabric Rolls',
    amount: 2000,
    type: 'expense',
    category: 'Clothing',
    paymentMethod: 'Bank Transfer',
    date: '05 Oct 2026',
    time: '10:00 AM',
    userId: 'usr_001',
    note: 'Raw fabric material',
    wasAutoCategorized: true
  },
  {
    id: 'atx_d02',
    accountId: 'acc_dress',
    accountName: 'Dress Business',
    itemName: 'Transfer to Unknown Person (Dress purchase)',
    amount: 2500,
    type: 'transfer_out',
    category: 'General Transactions',
    paymentMethod: 'Bank Transfer',
    date: '05 Oct 2026',
    time: '11:45 AM',
    userId: 'usr_001',
    note: 'Walk-in buyer return payment',
    transferId: 'gen_02'
  },

  // Xerox Business Account Transactions
  {
    id: 'atx_x01',
    accountId: 'acc_xerox',
    accountName: 'Xerox Business',
    itemName: '75 GSM A4 Copier Paper Bundle',
    amount: 300,
    type: 'expense',
    category: 'Business',
    paymentMethod: 'Cash',
    date: '05 Oct 2026',
    time: '01:20 PM',
    userId: 'usr_001',
    note: 'Daily xerox paper supply',
    wasAutoCategorized: true
  },
  {
    id: 'atx_x02',
    accountId: 'acc_xerox',
    accountName: 'Xerox Business',
    itemName: 'Transfer to Supplier (Xerox materials)',
    amount: 1200,
    type: 'transfer_out',
    category: 'General Transactions',
    paymentMethod: 'UPI',
    date: '05 Oct 2026',
    time: '02:15 PM',
    userId: 'usr_001',
    note: 'Toner and developer powder refill',
    transferId: 'gen_03'
  }
];

