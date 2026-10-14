# TradeFlow: Inventory, Billing & CRM Enterprise Platform

A unified commercial operations suite designed for retail and wholesale businesses to manage stock levels, issue GST-compliant automated invoices, track end-to-end client CRM interactions, and handle recurring ₹299/month subscriptions with seamless Razorpay-style payment processing and a Gemini 3.8 Flash business copilot grounded in Google Search.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during interactive clarification and will govern the implementation:

- **Target Domain & Industry**: Retail, wholesale, and multi-category commerce with SKU catalogs, category hierarchies, and reorder threshold monitoring.
- **Payment Gateway Experience**: Full Razorpay-style payment modal supporting UPI (QR & VPA), Debit/Credit cards, Netbanking, and Wallet rails, integrated for both the ₹299/month SaaS subscription barrier/tier and customer invoice collections with printable digital receipts.
- **AI Business Copilot**: Integrated multi-turn Gemini 3.8 Flash chatbot with real-time Google Search grounding (`googleSearch` tool), assisting with supplier price discovery, inventory restock advisories, and CRM interaction summarization.
- **Data Persistence Strategy**: High-fidelity local persistence with localStorage backing plus real-time reactive state, allowing users to seed realistic wholesale demo data, record live transactions, adjust inventory levels in real-time on invoice creation, and generate printable PDF-style invoices.

---

## 1. Overview & Core Concept

**TradeFlow** delivers an all-in-one business management operating system for small-to-medium enterprises (SMEs), retailers, and wholesalers who need:
1. **Real-time Inventory Management**: Stock tracking across categories, low-stock notifications, SKU and barcode generation, reorder thresholds, and automatic stock depletion upon invoice generation.
2. **Automated Billing & Invoicing**: Fast point-of-sale invoice generator with automated tax calculation (GST 5%, 12%, 18%, 28%), line-item discounts, instant payment link/QR generation, status management (Paid, Unpaid, Overdue), and print-ready thermal/A4 invoice templates.
3. **Integrated Client CRM**: Comprehensive client directory, purchase history tracking, interaction logs (calls, meetings, notes, WhatsApp messages), credit balance / dues ledger, and lead status tracking.
4. **Subscription Management (₹299 / Month)**: Transparent subscription dashboard with billing cycle tracking, active plan features, renewal countdown, and Razorpay-inspired checkout simulation with realistic payment verification states.
5. **Gemini 3.8 Flash Copilot with Google Search Grounding**: An interactive sidebar copilot that analyzes current catalog inventory levels, drafts payment reminder emails to overdue clients, and fetches live wholesale commodity and market pricing via Google Search.

---

## 2. User Experience & Visual Design

### Aesthetic Direction & Layout
Following the **SaaS & Enterprise Dashboard Constitution**:
- **Layout Model**: Robust sidebar navigation ($260\text{px}$) with collapsible mobile sheet + high-density workspace canvas with contextual breadcrumb navigation and action toolbar.
- **Top Bar Contract**: Breadcrumb trail (`TradeFlow / Operations / Invoices`) on the left, active subscription status indicator in the center, and unified primary CTA + AI Copilot toggle on the right.
- **Zero-Pill Discipline**: All categories, timestamps, SKU labels, and status badges avoid garish candy pills; statuses use subtle textual indicators with dot markers and neutral hairline dividers.
- **Single-Elevation Depth**: Flat structural surfaces with clean $1\text{px}$ hairline borders (`border-slate-200` light / `border-slate-800` dark), eliminating nested card-in-card visual noise.

### Color Palette & Visual Hierarchy (60-30-10 Rule)
- **60% Dominant Canvas**: Clean neutral white/slate (`bg-slate-50` light, `bg-slate-950` dark).
- **30% Structural Surfaces**: Crisp card surfaces (`bg-white` light, `bg-slate-900` dark) with refined borders (`border-slate-200/80` light, `border-slate-800/80` dark) and slate typography (`text-slate-900`, `text-slate-600`, `text-slate-400`).
- **10% Accent Budget**: Precision Indigo/Cobalt (`bg-indigo-600`, `hover:bg-indigo-700`, `text-indigo-600`) for primary action buttons, active tab states, and checkout triggers.
- **Semantic Status Markers**: Emerald (`#16a34a`) for paid invoices & healthy stock, Amber (`#d97706`) for low stock & pending payments, Crimson (`#dc2626`) for out-of-stock & overdue invoices.

### Typography
- **Display & Headings**: `Plus Jakarta Sans` for clean, professional typographic punch.
- **Body & Data Prose**: `Plus Jakarta Sans` for dense, legible 13px–15px information scanning.
- **Financial & Telemetry Figures**: `JetBrains Mono` / tabular numbers (`tabular-nums font-mono`) across all invoice line totals, SKU codes, prices, GST splits, and inventory counters to ensure vertical alignment.

---

## 3. Key Product Decisions & Trade-Offs

### 1. Razorpay Payment Gateway Experience
- **Chosen Approach**: Built-in interactive Razorpay-style payment modal replicating the official Razorpay checkout experience with authentic tabs:
  - **UPI (GPay, PhonePe, Paytm, BHIM)**: Dynamic QR code with auto-refresh timer & UPI ID verification.
  - **Cards**: Card number with Luhn formatting, expiry MM/YY, CVV, and saved card simulation.
  - **Netbanking**: Major banks (HDFC, ICICI, SBI, Axis, Kotak) with simulated OTP authentication.
  - **Subscription Billing Engine**: Tracks ₹299/month cycle, subscription expiration, auto-debit status, and downloadable subscription tax receipts.
- **Why**: Delivers an authentic Indian commerce payment experience tailored for the ₹299/mo brief while providing immediate visual confirmation and invoice status updates.

### 2. Live Inventory Depletion Linked to Invoices
- **Chosen Approach**: When an invoice is finalized or marked as paid, the inventory quantities for invoiced items automatically decrement in real-time, triggering automated low-stock warnings if quantity drops below threshold.
- **Why**: Prevents double-entry bookkeeping and mirrors real-world ERP operations.

### 3. Gemini 3.8 Flash Business Copilot with Google Search Grounding
- **Chosen Approach**: Server-side proxy endpoint `/api/gemini/copilot` utilizing `@google/genai` SDK with `gemini-3.8-flash` and `tools: [{ googleSearch: {} }]`.
- **Capabilities**:
  - Contextual awareness: automatically receives current out-of-stock inventory items and overdue CRM clients.
  - Live market grounding: can look up current market price benchmarks for commodities and electronics in India.
  - Generates actionable CRM follow-up messages and stock restock purchase orders.
- **Why**: Gives the user genuine business intelligence and satisfies both prompt feature requirements without leaving the dashboard.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TradeFlow Web Application                       │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation: Breadcrumbs · Plan Badge (₹299/mo) · AI Copilot CTA  │
├───────────────┬────────────────────────────────────────────────────────┤
│ Sidebar       │ Main Viewport Content                                  │
│ - Dashboard   │ ┌────────────────────────────────────────────────────┐ │
│ - Inventory   │ │ Tab Views:                                         │ │
│ - Invoices    │ │ 1. Executive Dashboard (KPIs, revenue, stock alert)│ │
│ - CRM Clients │ │ 2. Inventory Hub (SKU, categories, restock modal)  │ │
│ - Billing/Pay │ │ 3. Invoice Creator & Tax Engine (GST, printable)   │ │
│ - Settings    │ │ 4. CRM Client Directory & Interaction History      │ │
│               │ │ 5. Subscription & Payment Center (₹299/mo Plan)    │ │
│               │ └────────────────────────────────────────────────────┘ │
│               ├────────────────────────────────────────────────────────┤
│               │ Gemini 3.8 Flash Assistant Drawer (Google Grounded)    │
└───────────────┴────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Server API (/server.ts & Vite Plugin Server API)                       │
│ - POST /api/gemini/copilot (Google GenAI + Google Search grounding)    │
│ - POST /api/payment/verify (Simulated payment verification & receipt)  │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Entities & State Model

1. **InventoryItem**:
   `id`, `sku`, `name`, `category`, `costPrice`, `sellingPrice`, `stockQuantity`, `minThreshold`, `unit` (pcs, kg, box), `gstRate` (5%, 12%, 18%, 28%), `barcode`, `lastRestocked`.
2. **Invoice**:
   `id`, `invoiceNumber`, `customerId`, `customerName`, `customerPhone`, `customerGstin`, `items`: `[{ itemId, name, sku, qty, unitPrice, gstRate, total }]`, `subtotal`, `taxTotal`, `grandTotal`, `status` (`paid`, `unpaid`, `overdue`), `dueDate`, `createdAt`, `paymentMethod`.
3. **CustomerCRM**:
   `id`, `name`, `company`, `email`, `phone`, `gstin`, `address`, `tags`, `totalPurchases`, `outstandingBalance`, `interactions`: `[{ id, type: 'call'|'meeting'|'email'|'note', date, notes, outcome }]`.
4. **SubscriptionState**:
   `status` (`active`, `expired`, `trial`), `planName`: `"TradeFlow Pro"`, `amount`: `299`, `currency`: `"INR"`, `billingInterval`: `"month"`, `renewsAt`, `paymentHistory`: `[{ id, paymentId, amount, date, method, invoicePdf }]`.

### Interactive Handlers & Workflows
- **Stock Restock & Adjustment**: Quick increment/decrement buttons with low-stock visual cues, plus batch CSV import/export.
- **Invoice Builder**: Dynamic multi-item form with instant SKU search, live GST calculation, PDF preview modal, and instant "Pay via Razorpay" trigger.
- **CRM Timeline & Notes**: Add call/meeting notes with timestamps, log customer communication, and filter clients by overdue balances.
- **Payment Gateway Modal**: Realistic interactive multi-step checkout with instant verification screen, receipt download, and auto-activation.
- **Gemini Copilot**: Multi-turn conversation with prompt quick-actions ("Find wholesale price trends", "Draft payment reminder for overdue clients", "Recommend reorder list").
