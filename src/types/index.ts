export type GstRate = 0 | 5 | 12 | 18 | 28;

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Electronics' | 'Apparel' | 'Groceries' | 'FMCG' | 'Hardware' | 'Packaging';
  unit: 'pcs' | 'kg' | 'box' | 'meter' | 'litre';
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minThreshold: number;
  gstRate: GstRate;
  barcode: string;
  supplier: string;
  updatedAt: string;
}

export interface InvoiceItem {
  itemId: string;
  name: string;
  sku: string;
  qty: number;
  unit: string;
  unitPrice: number;
  gstRate: GstRate;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerGstin?: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxTotal: number;
  discount: number;
  grandTotal: number;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: string;
  createdAt: string;
  paymentMethod?: 'UPI' | 'Card' | 'Netbanking' | 'Cash' | 'Bank Transfer';
  paymentId?: string;
  notes?: string;
}

export interface CustomerInteraction {
  id: string;
  type: 'call' | 'meeting' | 'whatsapp' | 'email' | 'note';
  date: string;
  summary: string;
  outcome: 'completed' | 'follow_up_needed' | 'closed';
  loggedBy: string;
}

export interface CustomerCRM {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  tags: string[];
  totalPurchases: number;
  outstandingBalance: number;
  creditLimit: number;
  interactions: CustomerInteraction[];
  createdAt: string;
}

export interface SubscriptionState {
  planName: 'TradeFlow Pro';
  monthlyRate: number; // 299
  currency: 'INR';
  status: 'active' | 'trial' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  paymentMethod: string;
  paymentHistory: {
    id: string;
    paymentId: string;
    receiptNumber: string;
    date: string;
    amount: number;
    method: string;
    status: 'success';
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: {
    title?: string;
    uri?: string;
  }[];
}
