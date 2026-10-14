import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, CreditCard, Calendar, Receipt } from 'lucide-react';
import { SubscriptionState } from '../types';

interface SubscriptionViewProps {
  subscription: SubscriptionState;
  onRenewSubscription: () => void;
  onToggleAutoRenew: () => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  subscription,
  onRenewSubscription,
  onToggleAutoRenew,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const features = [
    { title: 'Unlimited Invoices & Point of Sale', desc: 'Instant GST calculation, thermal & A4 print formats' },
    { title: 'Real-time Multi-Category Inventory', desc: 'Automatic stock depletion, barcode generation, reorder thresholds' },
    { title: 'Comprehensive Client CRM & Ledger', desc: 'Detailed interaction timeline, credit limits, WhatsApp payment reminders' },
    { title: 'Razorpay Payment Gateway Integration', desc: 'Instant UPI QR, Debit/Credit cards, and Netbanking verification' },
    { title: 'Gemini 3.8 Flash Business Copilot', desc: 'Google Search grounding for live Indian market commodity prices' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Subscription & Gateway Billing</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your ₹299 / Month commercial platform subscription and download official tax receipts.
          </p>
        </div>

        <button
          onClick={onRenewSubscription}
          className="min-h-[44px] px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <CreditCard className="w-4 h-4" />
          <span>Renew Subscription (₹299)</span>
        </button>
      </div>

      {/* Main Subscription Hero Card (Mobile-First Layout) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-lg text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-bold">
                Monthly Subscription
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Plan</span>
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">TradeFlow Pro Enterprise</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Full-featured commercial operations suite covering inventory tracking, automated invoicing, CRM timeline, and Google-grounded AI copilot.
              </p>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-mono">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Renews: 31 Oct 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Secured by Razorpay</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 text-center min-w-[220px] space-y-3 backdrop-blur-xs">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Subscription Cost
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-white">
              ₹299
              <span className="text-xs sm:text-sm font-normal text-slate-400"> / mo</span>
            </div>
            <p className="text-[10px] text-slate-400">Taxes included (CGST + SGST)</p>
            <button
              onClick={onRenewSubscription}
              className="min-h-[44px] w-full py-2.5 px-4 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 active:scale-95 rounded-xl transition-all shadow-sm flex items-center justify-center"
            >
              Pay via UPI / Card
            </button>
          </div>
        </div>
      </div>

      {/* Plan Features Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xs">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
          Included in TradeFlow Pro Subscription (₹299/mo)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900">{f.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment & Invoicing History */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4 p-4 sm:p-5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Subscription Invoices & Receipts</h3>
          <p className="text-xs text-slate-500">Official tax receipts for business expense and input tax credit (ITC).</p>
        </div>

        {/* Mobile & Tablet Receipt Cards (App-Native) */}
        <div className="xl:hidden space-y-2.5">
          {subscription.paymentHistory.map((pay) => (
            <div
              key={pay.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900">{pay.receiptNumber}</span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{pay.paymentId}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black font-mono tabular-nums text-slate-900">
                    ₹{pay.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                    Captured
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">{pay.method}</span>
                <button
                  onClick={() => setSelectedReceipt(pay)}
                  className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Tax Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Large Desktop Table */}
        <div className="hidden xl:block overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse min-w-[640px] lg:min-w-full">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Receipt No</th>
                <th className="p-3">Date</th>
                <th className="p-3">Payment ID</th>
                <th className="p-3">Method</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscription.paymentHistory.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-semibold text-slate-900">{pay.receiptNumber}</td>
                  <td className="p-3 font-mono text-slate-600">
                    {new Date(pay.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">{pay.paymentId}</td>
                  <td className="p-3 text-slate-700">{pay.method}</td>
                  <td className="p-3 text-right font-mono tabular-nums font-bold text-slate-900">
                    ₹{pay.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Captured
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedReceipt(pay)}
                      className="px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors inline-flex items-center gap-1"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>Tax Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Tax Receipt Bottom Sheet / Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="sm:hidden pt-1 pb-1">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />
            </div>

            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-sm text-slate-900">Subscription Tax Receipt</h4>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Receipt Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono text-slate-900">{selectedReceipt.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Rail:</span>
                <span className="text-slate-900 font-medium">{selectedReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="text-slate-900 font-medium">TradeFlow Pro 1-Month Plan</span>
              </div>
              <div className="flex justify-between">
                <span>Base Charge:</span>
                <span className="font-mono">₹253.39</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span className="font-mono">₹45.61</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-indigo-600 text-base">₹{selectedReceipt.amount}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => window.print()}
                className="min-h-[44px] w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs"
              >
                Print Tax Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
