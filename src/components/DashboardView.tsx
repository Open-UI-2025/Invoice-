import React from 'react';
import { AlertTriangle, ArrowUpRight, CheckCircle2, DollarSign, Package, PlusCircle, CreditCard, Sparkles, ChevronRight } from 'lucide-react';
import { CustomerCRM, InventoryItem, Invoice, SubscriptionState } from '../types';

interface DashboardViewProps {
  inventory: InventoryItem[];
  invoices: Invoice[];
  customers: CustomerCRM[];
  subscription: SubscriptionState;
  onNavigate: (tab: 'inventory' | 'billing' | 'crm' | 'subscription') => void;
  onOpenCreateInvoice: () => void;
  onOpenAddProduct: () => void;
  onOpenAddCustomer: () => void;
  onOpenCopilot: () => void;
  onSelectInvoiceForPayment: (inv: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inventory,
  invoices,
  customers,
  subscription,
  onNavigate,
  onOpenCreateInvoice,
  onOpenAddProduct,
  onOpenAddCustomer,
  onOpenCopilot,
  onSelectInvoiceForPayment,
}) => {
  // Calculations
  const totalStockValue = inventory.reduce((sum, item) => sum + item.costPrice * item.stockQuantity, 0);
  const totalPotentialRevenue = inventory.reduce((sum, item) => sum + item.sellingPrice * item.stockQuantity, 0);
  const lowStockItems = inventory.filter((item) => item.stockQuantity <= item.minThreshold);
  const totalInvoicedMonth = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalOutstandingReceivables = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

  const recentInvoices = invoices.slice(0, 5);
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue' || (i.status === 'unpaid' && new Date(i.dueDate) < new Date()));

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Operations Hub</h1>
            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              Live POS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock valuation, automated GST billing, client dues, and subscription tracking.
          </p>
        </div>

        {/* Thumb-friendly action buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <button
            onClick={onOpenCreateInvoice}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
          <button
            onClick={onOpenAddProduct}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Package className="w-4 h-4 text-slate-500" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip (Mobile 2x2, Tablet 2x2, Desktop 4-in-a-row) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4">
        {/* Card 1: Inventory Valuation */}
        <div className="p-3.5 sm:p-4 md:p-4.5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1 sm:space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Stock Valuation</span>
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono tabular-nums text-slate-900 truncate">
            ₹{totalStockValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">
            Retail: ₹{totalPotentialRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Card 2: Low Stock Alert */}
        <div
          onClick={() => onNavigate('inventory')}
          className={`p-3.5 sm:p-4 md:p-4.5 border rounded-2xl shadow-2xs space-y-1 sm:space-y-1.5 cursor-pointer active:scale-98 transition-all ${
            lowStockItems.length > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600">
              Low Stock Alerts
            </span>
            <AlertTriangle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono tabular-nums text-amber-900">
            {lowStockItems.length} <span className="text-[10px] font-normal text-amber-700">items</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-amber-700 flex items-center justify-between font-medium">
            <span>Restock now</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Settled Invoiced Sales */}
        <div className="p-3.5 sm:p-4 md:p-4.5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1 sm:space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Sales Revenue</span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono tabular-nums text-emerald-600 truncate">
            ₹{totalInvoicedMonth.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">
            {invoices.filter((i) => i.status === 'paid').length} settled bills
          </div>
        </div>

        {/* Card 4: Outstanding Receivables */}
        <div
          onClick={() => onNavigate('crm')}
          className="p-3.5 sm:p-4 md:p-4.5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1 sm:space-y-1.5 cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Client Dues</span>
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono tabular-nums text-rose-600 truncate">
            ₹{totalOutstandingReceivables.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] sm:text-[11px] text-rose-600 flex items-center justify-between font-medium">
            <span>{overdueInvoices.length} overdue bills</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                {lowStockItems.length} Products At Or Below Reorder Threshold
              </h4>
              <p className="text-[11px] text-amber-800 line-clamp-1">
                {lowStockItems.map((i) => `${i.name} (${i.stockQuantity} left)`).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="w-full sm:w-auto min-h-[38px] px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-xl transition-colors text-center"
          >
            Restock Inventory
          </button>
        </div>
      )}

      {/* Two Column Section for Tablet & Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Left: Recent Invoices & POS Sales */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 md:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Invoices</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Instant GST tax billing & collections.</p>
            </div>
            <button
              onClick={() => onNavigate('billing')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Touch-Friendly Card Rows for Mobile & Desktop */}
          <div className="divide-y divide-slate-100">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/50 rounded-xl px-1 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{inv.invoiceNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-800 truncate">{inv.customerName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Due: {inv.dueDate}</span>
                    <span>·</span>
                    <span>{inv.items.length} items</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="text-xs sm:text-sm font-black font-mono tabular-nums text-slate-900">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider">
                      {inv.status === 'paid' ? (
                        <span className="text-emerald-700">Paid ({inv.paymentMethod})</span>
                      ) : inv.status === 'overdue' ? (
                        <span className="text-rose-700">Overdue</span>
                      ) : (
                        <span className="text-amber-700">Unpaid</span>
                      )}
                    </div>
                  </div>

                  {inv.status !== 'paid' && (
                    <button
                      onClick={() => onSelectInvoiceForPayment(inv)}
                      className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Collect</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CRM Customer Dues & Subscription Card */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          {/* CRM Dues List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Pending Receivables</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">Clients with unpaid ledger balances.</p>
              </div>
              <button
                onClick={() => onNavigate('crm')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                <span>CRM list</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {customers
                .filter((c) => c.outstandingBalance > 0)
                .map((client) => (
                  <div
                    key={client.id}
                    onClick={() => onNavigate('crm')}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 active:scale-98 transition-all cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{client.company}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {client.name} · {client.phone}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-black font-mono tabular-nums text-rose-600">
                        ₹{client.outstandingBalance.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Limit: ₹{client.creditLimit.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Subscription Mini Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
                {subscription.planName}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                Active Plan
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black font-mono tabular-nums">
                ₹{subscription.monthlyRate} <span className="text-xs font-normal text-slate-400">/ month</span>
              </div>
              <button
                onClick={() => onNavigate('subscription')}
                className="text-xs font-semibold text-indigo-300 hover:text-white underline"
              >
                Billing Center
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Unlimited GST Invoices, automatic inventory sync, and Gemini 3.8 Flash AI Copilot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
