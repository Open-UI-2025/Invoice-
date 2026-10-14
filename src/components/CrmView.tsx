import React, { useState } from 'react';
import { Plus, Search, Phone, Mail, MessageSquare, Copy, Check, Sparkles, ChevronRight, ArrowUpRight, LayoutGrid, List } from 'lucide-react';
import { CustomerCRM, CustomerInteraction, Invoice } from '../types';

interface CrmViewProps {
  customers: CustomerCRM[];
  invoices: Invoice[];
  onAddOrUpdateCustomer: (customer: CustomerCRM) => void;
  onAddInteraction: (customerId: string, interaction: CustomerInteraction) => void;
  onOpenCopilotWithQuery: (q: string) => void;
  isAddModalOpenDirectly?: boolean;
  onCloseDirectModal?: () => void;
}

export const CrmView: React.FC<CrmViewProps> = ({
  customers,
  invoices,
  onAddOrUpdateCustomer,
  onAddInteraction,
  onOpenCopilotWithQuery,
  isAddModalOpenDirectly = false,
  onCloseDirectModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCRM | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(isAddModalOpenDirectly);

  // Interaction Form State
  const [interactionType, setInteractionType] = useState<CustomerInteraction['type']>('call');
  const [interactionSummary, setInteractionSummary] = useState('');
  const [interactionOutcome, setInteractionOutcome] = useState<CustomerInteraction['outcome']>('completed');
  const [copiedReminder, setCopiedReminder] = useState(false);

  // New Customer Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Delhi (07)');
  const [creditLimit, setCreditLimit] = useState(50000);
  const [tagInput, setTagInput] = useState('Wholesale, Regular');

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag =
      tagFilter === 'all'
        ? true
        : tagFilter === 'dues'
        ? c.outstandingBalance > 0
        : c.tags.some((t) => t.toLowerCase().includes(tagFilter.toLowerCase()));
    return matchesSearch && matchesTag;
  });

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !phone.trim()) return;

    const newCustomer: CustomerCRM = {
      id: `cust_${Date.now()}`,
      name,
      company,
      email,
      phone,
      gstin: gstin.trim() || undefined,
      address,
      city: city || 'New Delhi',
      state: state || 'Delhi (07)',
      tags: tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      totalPurchases: 0,
      outstandingBalance: 0,
      creditLimit: Number(creditLimit),
      createdAt: new Date().toISOString(),
      interactions: [
        {
          id: `int_${Date.now()}`,
          type: 'note',
          date: new Date().toISOString(),
          summary: 'Client account provisioned in TradeFlow CRM.',
          outcome: 'completed',
          loggedBy: 'System',
        },
      ],
    };

    onAddOrUpdateCustomer(newCustomer);
    setIsAddCustomerOpen(false);
    if (onCloseDirectModal) onCloseDirectModal();
    setSelectedCustomer(newCustomer);

    // reset
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setGstin('');
    setAddress('');
  };

  const handleAddInteractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !interactionSummary.trim()) return;

    const newInteraction: CustomerInteraction = {
      id: `int_${Date.now()}`,
      type: interactionType,
      date: new Date().toISOString(),
      summary: interactionSummary,
      outcome: interactionOutcome,
      loggedBy: 'Executive Account Desk',
    };

    onAddInteraction(selectedCustomer.id, newInteraction);

    const updatedCustomer = {
      ...selectedCustomer,
      interactions: [newInteraction, ...selectedCustomer.interactions],
    };
    setSelectedCustomer(updatedCustomer);
    setInteractionSummary('');
  };

  const handleCopyWhatsAppReminder = (client: CustomerCRM) => {
    const text = `Dear ${client.name} (${client.company}),\n\nGreetings from TradeFlow Commerce. This is a gentle reminder regarding your outstanding ledger balance of ₹${client.outstandingBalance.toLocaleString(
      'en-IN'
    )}.\n\nYou can settle via instant UPI or Netbanking on our payment portal.\n\nPlease let us know once initiated. Thank you!`;
    navigator.clipboard.writeText(text);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Client CRM Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed contact records, interaction logs, credit limits, and WhatsApp payment reminders.
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="min-h-[44px] px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate block">
            Accounts
          </span>
          <div className="text-lg sm:text-2xl font-black font-mono tabular-nums text-slate-900">
            {customers.length}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">Registered</div>
        </div>

        <div className="p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate block">
            Total Dues
          </span>
          <div className="text-lg sm:text-2xl font-black font-mono tabular-nums text-rose-600 truncate">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] sm:text-[11px] text-rose-600 truncate">
            {customers.filter((c) => c.outstandingBalance > 0).length} clients
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate block">
            Interactions
          </span>
          <div className="text-lg sm:text-2xl font-black font-mono tabular-nums text-indigo-600">
            {customers.reduce((acc, c) => acc + c.interactions.length, 0)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">Logs</div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-2xl shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, company, phone, or GSTIN..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Accounts' },
              { id: 'dues', label: 'Pending Dues' },
              { id: 'wholesale', label: 'Wholesale' },
              { id: 'retail', label: 'Retail' },
            ].map((tag) => (
              <button
                key={tag.id}
                onClick={() => setTagFilter(tag.id)}
                className={`min-h-[34px] px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap active:scale-95 ${
                  tagFilter === tag.id ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tag.label}
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
              title="Directory Table view"
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
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 col-span-full">
            No clients found. Click "Add New Client" to start managing client relationships.
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const hasDues = c.outstandingBalance > 0;
            return (
              <div
                key={c.id}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{c.company}</h3>
                      <div className="text-xs text-slate-600 mt-0.5">{c.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {c.phone} · {c.city}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-base font-black font-mono tabular-nums ${hasDues ? 'text-rose-600' : 'text-slate-900'}`}>
                        ₹{c.outstandingBalance.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Limit: ₹{c.creditLimit.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${c.phone}`}
                      className="min-h-[38px] px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Call</span>
                    </a>
                    {hasDues && (
                      <button
                        onClick={() => handleCopyWhatsAppReminder(c)}
                        className="min-h-[38px] px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Remind</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="min-h-[38px] px-3.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span>Timeline ({c.interactions.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TABLE VIEW: High-density Table (Visible on screens >= md when table mode selected) */}
      <div className={`${viewMode === 'table' ? 'hidden md:block' : 'hidden'} bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px] lg:min-w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Client & Company</th>
                <th className="px-4 py-3">Contact Details</th>
                <th className="px-4 py-3">Location & GSTIN</th>
                <th className="px-4 py-3 text-right">Lifetime Sales</th>
                <th className="px-4 py-3 text-right">Current Dues</th>
                <th className="px-4 py-3 text-center">Interactions</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No clients found. Click "Add New Client" to start managing client relationships.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const hasDues = c.outstandingBalance > 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{c.company}</div>
                        <div className="text-[11px] text-slate-500">{c.name}</div>
                        <div className="flex gap-1 mt-1">
                          {c.tags.map((t, i) => (
                            <span key={i} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono text-slate-900 text-[11px]">{c.phone}</div>
                        <div className="text-[11px] text-slate-500 truncate">{c.email}</div>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        <div>{c.city}, {c.state}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {c.gstin || 'Unregistered'}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                        ₹{c.totalPurchases.toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className={`font-mono tabular-nums font-bold ${hasDues ? 'text-rose-600' : 'text-slate-900'}`}>
                          ₹{c.outstandingBalance.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Limit: ₹{c.creditLimit.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                          {c.interactions.length} entries
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span>Manage CRM</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & Interaction Timeline Bottom Sheet / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-y-auto border border-slate-200 my-0 sm:my-8 animate-in slide-in-from-bottom duration-200">
            {/* Mobile & Tablet App Sheet Handle */}
            <div className="pt-3 pb-1">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />
            </div>

            <div className="px-5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{selectedCustomer.company}</h3>
                <p className="text-xs text-slate-400">
                  {selectedCustomer.name} · {selectedCustomer.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Outstanding</span>
                  <div className="text-base sm:text-xl font-black font-mono tabular-nums text-rose-600 truncate">
                    ₹{selectedCustomer.outstandingBalance.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Credit Limit</span>
                  <div className="text-base sm:text-xl font-black font-mono tabular-nums text-slate-900 truncate">
                    ₹{selectedCustomer.creditLimit.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">Total Sales</span>
                  <div className="text-base sm:text-xl font-black font-mono tabular-nums text-emerald-600 truncate">
                    ₹{selectedCustomer.totalPurchases.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedCustomer.outstandingBalance > 0 && (
                  <button
                    onClick={() => handleCopyWhatsAppReminder(selectedCustomer)}
                    className="min-h-[40px] px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl transition-all flex items-center gap-1.5"
                  >
                    {copiedReminder ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReminder ? 'Copied Reminder Text!' : 'Copy WhatsApp Reminder'}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onOpenCopilotWithQuery(
                      `Draft a strategic account follow-up message for ${selectedCustomer.company} (Contact: ${selectedCustomer.name}, Outstanding dues: ₹${selectedCustomer.outstandingBalance}).`
                    );
                  }}
                  className="min-h-[40px] px-3.5 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 active:scale-95 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze with Copilot</span>
                </button>
              </div>

              {/* Log New Interaction Form */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Log Interaction Touchpoint</h4>
                <form onSubmit={handleAddInteractionSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Interaction Type</label>
                      <select
                        value={interactionType}
                        onChange={(e) => setInteractionType(e.target.value as any)}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      >
                        <option value="call">Phone Call</option>
                        <option value="whatsapp">WhatsApp Message</option>
                        <option value="meeting">In-Person Meeting</option>
                        <option value="email">Email</option>
                        <option value="note">Internal Account Note</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Outcome</label>
                      <select
                        value={interactionOutcome}
                        onChange={(e) => setInteractionOutcome(e.target.value as any)}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white"
                      >
                        <option value="completed">Completed / Settled</option>
                        <option value="follow_up_needed">Follow-up Required</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Summary & Agreed Terms</label>
                    <textarea
                      rows={2}
                      value={interactionSummary}
                      onChange={(e) => setInteractionSummary(e.target.value)}
                      placeholder="e.g. Spoke with client regarding invoice payment. Agreed to wire transfer by Friday."
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="min-h-[40px] px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs"
                    >
                      Save Interaction Log
                    </button>
                  </div>
                </form>
              </div>

              {/* Interaction Timeline Feed */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Interaction History</h4>
                <div className="space-y-2.5">
                  {selectedCustomer.interactions.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3">No interaction logs recorded yet.</p>
                  ) : (
                    selectedCustomer.interactions.map((int) => (
                      <div key={int.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 capitalize">{int.type}</span>
                            <span>·</span>
                            <span>{new Date(int.date).toLocaleDateString('en-IN')}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              int.outcome === 'follow_up_needed'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {int.outcome.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed mt-1">{int.summary}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Client Bottom Sheet / Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-slate-200 animate-in slide-in-from-bottom duration-200">
            {/* Mobile & Tablet App Sheet Handle */}
            <div className="pt-3 pb-1">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />
            </div>

            <div className="px-5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="font-bold text-base">Add New CRM Client</h3>
              <button
                onClick={() => {
                  setIsAddCustomerOpen(false);
                  if (onCloseDirectModal) onCloseDirectModal();
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Store</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Supermart"
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@store.com"
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street / Market Address"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Wholesale, VIP"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCustomerOpen(false);
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
                  Save Client to CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
