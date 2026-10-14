import React, { useState } from 'react';
import { Plus, Search, Printer, CreditCard, FileText, Trash2, Eye, QrCode, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { CustomerCRM, GstRate, InventoryItem, Invoice, InvoiceItem } from '../types';

interface BillingViewProps {
  invoices: Invoice[];
  inventory: InventoryItem[];
  customers: CustomerCRM[];
  onCreateInvoice: (inv: Invoice) => void;
  onOpenPaymentGateway: (inv: Invoice) => void;
  isCreateModalOpenDirectly?: boolean;
  onCloseDirectModal?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  invoices,
  inventory,
  customers,
  onCreateInvoice,
  onOpenPaymentGateway,
  isCreateModalOpenDirectly = false,
  onCloseDirectModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [isBuilderOpen, setIsBuilderOpen] = useState(isCreateModalOpenDirectly);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // New Invoice Builder State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCRM | null>(customers[0] || null);
  const [builderInvoiceNumber, setBuilderInvoiceNumber] = useState(`TF-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [builderDueDate, setBuilderDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [builderNotes, setBuilderNotes] = useState('Payment terms: Net 7 days. Thanks for your business.');

  const [builderItems, setBuilderItems] = useState<
    {
      itemId: string;
      qty: number;
      unitPrice: number;
      gstRate: GstRate;
    }[]
  >([
    {
      itemId: inventory[0]?.id || '',
      qty: 1,
      unitPrice: inventory[0]?.sellingPrice || 1000,
      gstRate: inventory[0]?.gstRate || 18,
    },
  ]);

  const [builderDiscount, setBuilderDiscount] = useState<number>(0);

  // Filtered invoices list
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals for builder
  const calculatedItems: InvoiceItem[] = builderItems
    .map((bi) => {
      const invItem = inventory.find((i) => i.id === bi.itemId);
      if (!invItem) return null;
      const basePrice = bi.unitPrice * bi.qty;
      const taxAmount = (basePrice * bi.gstRate) / 100;
      const total = basePrice + taxAmount;
      return {
        itemId: invItem.id,
        name: invItem.name,
        sku: invItem.sku,
        qty: bi.qty,
        unit: invItem.unit,
        unitPrice: bi.unitPrice,
        gstRate: bi.gstRate,
        taxAmount,
        total,
      };
    })
    .filter(Boolean) as InvoiceItem[];

  const subtotal = calculatedItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const taxTotal = calculatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const isInterstate = selectedCustomer ? !selectedCustomer.state.includes('Delhi') : false;
  const cgst = isInterstate ? 0 : taxTotal / 2;
  const sgst = isInterstate ? 0 : taxTotal / 2;
  const igst = isInterstate ? taxTotal : 0;
  const grandTotal = Math.max(0, subtotal + taxTotal - builderDiscount);

  const handleAddItemRow = () => {
    if (inventory.length === 0) return;
    const defaultItem = inventory[0];
    setBuilderItems([
      ...builderItems,
      {
        itemId: defaultItem.id,
        qty: 1,
        unitPrice: defaultItem.sellingPrice,
        gstRate: defaultItem.gstRate,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setBuilderItems(builderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...builderItems];
    if (field === 'itemId') {
      const found = inventory.find((i) => i.id === value);
      if (found) {
        updated[index] = {
          ...updated[index],
          itemId: found.id,
          unitPrice: found.sellingPrice,
          gstRate: found.gstRate,
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setBuilderItems(updated);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || calculatedItems.length === 0) return;

    const newInvoice: Invoice = {
      id: `inv_rec_${Date.now()}`,
      invoiceNumber: builderInvoiceNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.company || selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerEmail: selectedCustomer.email,
      customerGstin: selectedCustomer.gstin,
      customerAddress: `${selectedCustomer.address}, ${selectedCustomer.city}, ${selectedCustomer.state}`,
      items: calculatedItems,
      subtotal,
      cgst,
      sgst,
      igst,
      taxTotal,
      discount: builderDiscount,
      grandTotal,
      status: 'unpaid',
      dueDate: builderDueDate,
      createdAt: new Date().toISOString(),
      notes: builderNotes,
    };

    onCreateInvoice(newInvoice);
    setIsBuilderOpen(false);
    if (onCloseDirectModal) onCloseDirectModal();
    setPreviewInvoice(newInvoice);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Billing & Automated GST Invoices</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Point-of-sale tax billing with instant stock synchronization and Razorpay settlement.
          </p>
        </div>

        <button
          onClick={() => {
            setBuilderInvoiceNumber(`TF-2026-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsBuilderOpen(true);
          }}
          className="min-h-[44px] px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Invoice Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-2xl shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice number or client name..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
            {(['all', 'paid', 'unpaid', 'overdue'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`min-h-[34px] px-3 py-1 text-xs font-semibold rounded-lg transition-all capitalize whitespace-nowrap active:scale-95 ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Tablet & Desktop View Mode Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table view"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Touch Cards grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* CARD VIEW: Native Touch Cards (Mobile & Tablet Grid) */}
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5' : 'md:hidden space-y-3'}`}>
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 col-span-full">
            No invoices found. Click "Create New Invoice" to start billing!
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900">{inv.invoiceNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'overdue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1 truncate">{inv.customerName}</h3>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Due: {inv.dueDate} · {inv.items.length} items
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black font-mono tabular-nums text-slate-900">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      GST: ₹{inv.taxTotal.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setPreviewInvoice(inv)}
                  className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Tax Invoice</span>
                </button>

                {inv.status !== 'paid' && (
                  <button
                    onClick={() => onOpenPaymentGateway(inv)}
                    className="min-h-[40px] px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Collect Payment</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* TABLE VIEW: High-density Table (Visible on screens >= md when table mode selected) */}
      <div className={`${viewMode === 'table' ? 'hidden md:block' : 'hidden'} bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px] lg:min-w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-3 md:px-3.5 lg:px-4 py-3">Invoice Number</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3">Client / Company</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3">Created Date</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3">Due Date</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3 text-right">Tax (GST)</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3 text-right">Grand Total</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3 text-center">Status</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No invoices found. Click "Create New Invoice" to generate your first automated bill!
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 md:px-3.5 lg:px-4 py-3">
                      <span className="font-mono font-semibold text-slate-900">{inv.invoiceNumber}</span>
                      <div className="text-[11px] text-slate-500">{inv.items.length} items</div>
                    </td>

                    <td className="px-2.5 md:px-3 lg:px-4 py-3">
                      <div className="font-medium text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{inv.customerPhone}</div>
                    </td>

                    <td className="px-2.5 md:px-3 lg:px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {new Date(inv.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-2.5 md:px-3 lg:px-4 py-3 font-mono text-[11px] text-slate-600">
                      {inv.dueDate}
                    </td>

                    <td className="px-2.5 md:px-3 lg:px-4 py-3 text-right font-mono tabular-nums text-slate-600">
                      ₹{inv.taxTotal.toLocaleString('en-IN')}
                    </td>

                    <td className="px-2.5 md:px-3 lg:px-4 py-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>

                    <td className="px-2.5 md:px-3 lg:px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium capitalize ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'overdue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    <td className="px-2.5 md:px-3 lg:px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          title="View & Print GST Tax Invoice"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => onOpenPaymentGateway(inv)}
                            className="px-2.5 py-1 text-[11px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Collect</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Builder Bottom Sheet / Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-y-auto border border-slate-200 my-0 sm:my-8 animate-in slide-in-from-bottom duration-200">
            {/* Mobile & Tablet App Sheet Handle */}
            <div className="pt-3 pb-1">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />
            </div>

            <div className="px-5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Create Automated Tax Invoice</h3>
                <p className="text-xs text-slate-400">Inventory automatically decrements upon submission.</p>
              </div>
              <button
                onClick={() => {
                  setIsBuilderOpen(false);
                  if (onCloseDirectModal) onCloseDirectModal();
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="p-5 sm:p-6 space-y-5">
              {/* Client & Date Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client (CRM)</label>
                  <select
                    value={selectedCustomer?.id || ''}
                    onChange={(e) => {
                      const c = customers.find((cust) => cust.id === e.target.value);
                      if (c) setSelectedCustomer(c);
                    }}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600 bg-white"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={builderInvoiceNumber}
                    onChange={(e) => setBuilderInvoiceNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={builderDueDate}
                    onChange={(e) => setBuilderDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Items Card List on Mobile, Clean Grid on Desktop */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Line Items</h4>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Stacked mobile items */}
                <div className="space-y-3">
                  {builderItems.map((bi, idx) => {
                    const invItem = inventory.find((i) => i.id === bi.itemId);
                    const isStockLow = invItem ? bi.qty > invItem.stockQuantity : false;
                    const lineTotal = bi.unitPrice * bi.qty * (1 + bi.gstRate / 100);

                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Item #{idx + 1}</span>
                          {builderItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">Product</label>
                          <select
                            value={bi.itemId}
                            onChange={(e) => handleItemChange(idx, 'itemId', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600 bg-white"
                          >
                            {inventory.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.name} (Stock: {inv.stockQuantity} {inv.unit})
                              </option>
                            ))}
                          </select>
                          {isStockLow && (
                            <span className="text-[11px] text-rose-600 font-bold block mt-1">
                              Warning: Exceeds warehouse stock ({invItem?.stockQuantity})
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">Quantity</label>
                            <input
                              type="number"
                              min={1}
                              value={bi.qty}
                              onChange={(e) => handleItemChange(idx, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-center"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">Unit Price (₹)</label>
                            <input
                              type="number"
                              min={0}
                              value={bi.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-right"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">GST Slab</label>
                            <select
                              value={bi.gstRate}
                              onChange={(e) => handleItemChange(idx, 'gstRate', Number(e.target.value))}
                              className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-center bg-white"
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                              <option value={28}>28%</option>
                            </select>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Line Total (incl. GST):</span>
                          <span className="font-mono font-bold text-slate-900 tabular-nums">
                            ₹{lineTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tax Breakup & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Notes / Terms</label>
                  <textarea
                    rows={2}
                    value={builderNotes}
                    onChange={(e) => setBuilderNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {isInterstate ? (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST:</span>
                      <span className="font-mono tabular-nums">₹{igst.toFixed(2)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST:</span>
                        <span className="font-mono tabular-nums">₹{cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST:</span>
                        <span className="font-mono tabular-nums">₹{sgst.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 font-medium">Discount (₹):</span>
                    <input
                      type="number"
                      min={0}
                      value={builderDiscount}
                      onChange={(e) => setBuilderDiscount(Number(e.target.value))}
                      className="w-24 px-2 py-1 text-right font-mono text-xs border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                    <span>Grand Total:</span>
                    <span className="font-mono tabular-nums text-indigo-700 text-base">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsBuilderOpen(false);
                    if (onCloseDirectModal) onCloseDirectModal();
                  }}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs"
                >
                  Generate Invoice & Sync Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal (Mobile Viewport Optimized) */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-y-auto border border-slate-200 my-0 sm:my-8 animate-in slide-in-from-bottom duration-200">
            <div className="no-print px-5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">Tax Invoice</span>
                <span className="text-xs text-slate-400 font-mono">({previewInvoice.invoiceNumber})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print A4</span>
                </button>
                {previewInvoice.status !== 'paid' && (
                  <button
                    onClick={() => {
                      const inv = previewInvoice;
                      setPreviewInvoice(null);
                      onOpenPaymentGateway(inv);
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay</span>
                  </button>
                )}
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-5 sm:p-8 text-slate-900 space-y-6 bg-white overflow-x-auto">
              <div className="flex items-start justify-between border-b pb-5 border-slate-200">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">TradeFlow Commerce Ltd.</h1>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Wholesale & Retail Merchandise Logistics Hub
                    <br />
                    Connaught Place, Barakhamba Road, New Delhi 110001
                    <br />
                    GSTIN: <span className="font-mono font-medium">07AABCT1334Q1Z2</span> · State: Delhi (07)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">TAX INVOICE</div>
                  <div className="text-base sm:text-lg font-mono font-bold mt-1">{previewInvoice.invoiceNumber}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Date: {new Date(previewInvoice.createdAt).toLocaleDateString('en-IN')}
                    <br />
                    Due: {previewInvoice.dueDate}
                  </div>
                </div>
              </div>

              {/* Billed To / QR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b pb-5 border-slate-200">
                <div>
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                    Billed To (Client / Consignee)
                  </div>
                  <div className="font-bold text-sm text-slate-900">{previewInvoice.customerName}</div>
                  <div className="text-slate-600 mt-0.5">{previewInvoice.customerAddress}</div>
                  <div className="mt-1 font-mono text-[11px]">
                    Phone: {previewInvoice.customerPhone} · GSTIN: {previewInvoice.customerGstin || 'Unregistered'}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div>
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                      Status
                    </div>
                    <div className="inline-block px-2.5 py-1 rounded text-xs font-bold uppercase font-mono">
                      {previewInvoice.status === 'paid' ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                          PAID ({previewInvoice.paymentMethod})
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded">
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2 border border-slate-200 rounded-xl flex items-center gap-2 bg-slate-50 shrink-0">
                    <QrCode className="w-10 h-10 text-slate-800" />
                    <div className="text-[10px] leading-tight">
                      <span className="font-bold block">UPI QR</span>
                      <span className="font-mono text-slate-500">tradeflow@rzp</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table with horizontal scroll if screen is small */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-2">Item Description & SKU</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-center">GST %</th>
                      <th className="py-2 text-right">Tax (₹)</th>
                      <th className="py-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {previewInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2.5">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">SKU: {item.sku}</div>
                        </td>
                        <td className="py-2.5 text-center font-mono">
                          {item.qty} {item.unit}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 text-center font-mono">{item.gstRate}%</td>
                        <td className="py-2.5 text-right font-mono tabular-nums">
                          ₹{item.taxAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums font-bold">
                          ₹{item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Breakup */}
              <div className="flex justify-end pt-3 border-t border-slate-200">
                <div className="w-full sm:w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span className="font-mono tabular-nums">₹{previewInvoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {previewInvoice.igst > 0 ? (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST:</span>
                      <span className="font-mono tabular-nums">₹{previewInvoice.igst.toFixed(2)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST:</span>
                        <span className="font-mono tabular-nums">₹{previewInvoice.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST:</span>
                        <span className="font-mono tabular-nums">₹{previewInvoice.sgst.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {previewInvoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount:</span>
                      <span className="font-mono tabular-nums">-₹{previewInvoice.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-900 pt-2 flex justify-between font-bold text-sm text-slate-900">
                    <span>Grand Total:</span>
                    <span className="font-mono tabular-nums text-indigo-700 text-base">
                      ₹{previewInvoice.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
