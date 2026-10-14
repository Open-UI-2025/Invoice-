import React, { useState } from 'react';
import { Plus, Search, AlertTriangle, Download, Edit3, Trash2, PackagePlus, Barcode, LayoutGrid, List } from 'lucide-react';
import { GstRate, InventoryItem } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAddOrUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onQuickRestock: (id: string, qty: number) => void;
  onOpenCopilotWithQuery: (q: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onAddOrUpdateItem,
  onDeleteItem,
  onQuickRestock,
  onOpenCopilotWithQuery,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Quick Restock modal state
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  // Form states for Add/Edit
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<InventoryItem['category']>('Electronics');
  const [formUnit, setFormUnit] = useState<InventoryItem['unit']>('pcs');
  const [formCostPrice, setFormCostPrice] = useState<number>(1000);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(1500);
  const [formStock, setFormStock] = useState<number>(20);
  const [formMinThreshold, setFormMinThreshold] = useState<number>(5);
  const [formGstRate, setFormGstRate] = useState<GstRate>(18);
  const [formSupplier, setFormSupplier] = useState('');

  const categories = ['all', 'Electronics', 'Groceries', 'Apparel', 'Hardware', 'FMCG', 'Packaging'];

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStock = filterStockStatus === 'all' || item.stockQuantity <= item.minThreshold;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormCategory('Electronics');
    setFormUnit('pcs');
    setFormCostPrice(500);
    setFormSellingPrice(800);
    setFormStock(25);
    setFormMinThreshold(5);
    setFormGstRate(18);
    setFormSupplier('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormSku(item.sku);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormUnit(item.unit);
    setFormCostPrice(item.costPrice);
    setFormSellingPrice(item.sellingPrice);
    setFormStock(item.stockQuantity);
    setFormMinThreshold(item.minThreshold);
    setFormGstRate(item.gstRate);
    setFormSupplier(item.supplier);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) return;

    const newItem: InventoryItem = {
      id: editingItem ? editingItem.id : `inv_${Date.now()}`,
      sku: formSku,
      name: formName,
      category: formCategory,
      unit: formUnit,
      costPrice: Number(formCostPrice),
      sellingPrice: Number(formSellingPrice),
      stockQuantity: Number(formStock),
      minThreshold: Number(formMinThreshold),
      gstRate: formGstRate,
      barcode: editingItem ? editingItem.barcode : `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      supplier: formSupplier || 'Direct Merchant',
      updatedAt: new Date().toISOString(),
    };

    onAddOrUpdateItem(newItem);
    setIsModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = ['SKU', 'Name', 'Category', 'Unit', 'Cost Price', 'Selling Price', 'Stock Qty', 'Min Threshold', 'GST Rate %', 'Supplier'];
    const rows = filteredItems.map((i) => [
      i.sku,
      `"${i.name.replace(/"/g, '""')}"`,
      i.category,
      i.unit,
      i.costPrice,
      i.sellingPrice,
      i.stockQuantity,
      i.minThreshold,
      i.gstRate,
      `"${i.supplier.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradeflow_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Inventory Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time SKU quantities, automatic sales depletion, and reorder alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="min-h-[42px] px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="min-h-[42px] flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Mobile-Friendly Search & Horizontal Scroll Filter Bar */}
      <div className="space-y-2.5 bg-white p-3 border border-slate-200 rounded-2xl shadow-2xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU, Product Name, or Barcode..."
            className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-600"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            <button
              onClick={() => setFilterStockStatus(filterStockStatus === 'all' ? 'low' : 'all')}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95 ${
                filterStockStatus === 'low'
                  ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Low Stock ({inventory.filter((i) => i.stockQuantity <= i.minThreshold).length})</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 whitespace-nowrap capitalize active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
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
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 col-span-full">
            No products found matching your filter criteria.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLow = item.stockQuantity <= item.minThreshold;
            const marginPct = Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100);

            return (
              <div
                key={item.id}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md font-semibold">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-1 leading-snug">{item.name}</h3>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>{item.sku}</span>
                        <span>·</span>
                        <Barcode className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.barcode}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black font-mono tabular-nums text-slate-900">
                        ₹{item.sellingPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold font-mono">
                        +{marginPct}% margin
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                        isLow
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {item.stockQuantity} {item.unit}
                    </span>
                    {isLow && (
                      <span className="text-[10px] text-amber-700 font-medium hidden sm:inline">
                        Min safe: {item.minThreshold}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setRestockModalItem(item);
                        setRestockQty(10);
                      }}
                      className="min-h-[38px] px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      <span>Restock</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="min-h-[38px] p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${item.name}?`)) onDeleteItem(item.id);
                      }}
                      className="min-h-[38px] p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TABLE VIEW: High-density Data Table with tablet scrolling */}
      <div className={`${viewMode === 'table' ? 'hidden md:block' : 'hidden'} bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px] lg:min-w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-3 md:px-3.5 lg:px-4 py-3">Product & SKU</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3">Category</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3 text-right">Cost Price</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3 text-right">Selling Price</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3 text-right">Margin</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3 text-center">Stock Level</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3 text-center">GST Slab</th>
                <th className="px-2.5 md:px-3 lg:px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No products found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.stockQuantity <= item.minThreshold;
                  const marginPct = Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 md:px-3.5 lg:px-4 py-3">
                        <div className="font-semibold text-slate-900 leading-snug">{item.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>{item.sku}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-slate-400" />
                            {item.barcode}
                          </span>
                        </div>
                      </td>

                      <td className="px-2.5 md:px-3 lg:px-4 py-3 text-slate-600">
                        <span>{item.category}</span>
                      </td>

                      <td className="px-2.5 md:px-3 lg:px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                        ₹{item.costPrice.toLocaleString('en-IN')}
                      </td>

                      <td className="px-2.5 md:px-3 lg:px-4 py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        ₹{item.sellingPrice.toLocaleString('en-IN')}
                      </td>

                      <td className="px-2.5 md:px-3 lg:px-4 py-3 text-right font-mono tabular-nums text-emerald-600 font-medium">
                        +{marginPct}%
                      </td>

                      <td className="px-2.5 md:px-3 lg:px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono">
                          <span className={`font-bold tabular-nums ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                            {item.stockQuantity}
                          </span>
                          <span className="text-slate-500 text-[11px]">{item.unit}</span>
                          {isLow && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded-sm ml-1">
                              Low (Min: {item.minThreshold})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-2.5 md:px-3 lg:px-4 py-3 text-center">
                        <span className="font-mono text-slate-700 text-[11px]">{item.gstRate}%</span>
                      </td>

                      <td className="px-2.5 md:px-3 lg:px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setRestockModalItem(item);
                              setRestockQty(10);
                            }}
                            title="Quick Restock"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Product"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${item.name}?`)) onDeleteItem(item.id);
                            }}
                            title="Delete"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal (Bottom Sheet on Mobile, Centered on Desktop) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-slate-200 animate-in slide-in-from-bottom duration-200">
            {/* Mobile & Tablet Sheet Handle */}
            <div className="pt-3 pb-1">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />
            </div>

            <div className="px-5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900">
                {editingItem ? 'Edit Inventory Product' : 'Add New Inventory Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600 bg-white"
                  >
                    {['Electronics', 'Groceries', 'Apparel', 'Hardware', 'FMCG', 'Packaging'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Basmati Rice 25kg Sack"
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GST Slab</label>
                  <select
                    value={formGstRate}
                    onChange={(e) => setFormGstRate(Number(e.target.value) as GstRate)}
                    className="w-full px-2.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600 bg-white"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as any)}
                    className="w-full px-2.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600 bg-white"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="box">box</option>
                    <option value="meter">meter</option>
                    <option value="litre">litre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Alert Level</label>
                  <input
                    type="number"
                    value={formMinThreshold}
                    onChange={(e) => setFormMinThreshold(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Distributor</label>
                <input
                  type="text"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  placeholder="e.g. Punjab Agro Mandi Traders"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs"
                >
                  {editingItem ? 'Save Changes' : 'Add Item to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Restock Bottom Sheet / Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="pt-1 pb-2">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />
            </div>

            <h3 className="font-bold text-base text-slate-900">Restock Product</h3>
            <p className="text-xs text-slate-600">
              Adding new units for <span className="font-bold text-slate-900">{restockModalItem.name}</span>. Current stock:{' '}
              <span className="font-mono font-bold text-slate-900">{restockModalItem.stockQuantity}</span> {restockModalItem.unit}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity to Add</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-base sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                />
                <span className="text-xs font-bold text-slate-500">{restockModalItem.unit}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2.5">
                {[5, 10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRestockQty(preset)}
                    className="min-h-[36px] px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-lg text-slate-800 font-mono font-bold transition-all"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onQuickRestock(restockModalItem.id, restockQty);
                  setRestockModalItem(null);
                }}
                className="min-h-[44px] flex-1 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
