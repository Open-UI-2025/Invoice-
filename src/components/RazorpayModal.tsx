import React, { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, QrCode, ShieldCheck, Smartphone, Building2, X } from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentResult: {
    paymentId: string;
    orderId: string;
    signature: string;
    receiptNumber: string;
    method: string;
    amount: number;
  }) => void;
  amount: number;
  purpose: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  purpose,
  customerName = 'TradeFlow Client',
  customerPhone = '+91 98765 43210',
  customerEmail = 'billing@tradeflow.local',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiOption, setUpiOption] = useState<'qr' | 'vpa'>('qr');
  const [upiVpa, setUpiVpa] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8920 1823 9012');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('782');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setProcessingStep('Connecting to banking rails...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep('Authorizing payment with issuer network...');

      await new Promise((r) => setTimeout(r, 700));
      setProcessingStep('Verifying cryptographic signature on server...');

      const orderId = `order_${Math.random().toString(36).substring(2, 10)}`;
      const paymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;

      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          orderId,
          method:
            selectedMethod === 'upi'
              ? `UPI (${upiOption.toUpperCase()})`
              : selectedMethod === 'card'
              ? 'Visa / Mastercard'
              : selectedBank,
          amount,
          description: purpose,
          clientName: customerName,
        }),
      });

      const data = await res.json();
      setIsProcessing(false);
      setIsSuccess(true);
      setSuccessData(data);

      setTimeout(() => {
        onSuccess(data);
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert('Payment processing simulated error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-2xs">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden border border-slate-200 animate-in slide-in-from-bottom duration-200">
        {/* Mobile & Tablet App Sheet Handle */}
        <div className="pt-2.5 pb-1 bg-slate-900">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto" />
        </div>

        {/* Razorpay Gateway Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide">Razorpay Checkout</span>
                <span className="text-[10px] text-emerald-400 font-mono">Verified</span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{purpose}</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-2">
            <div>
              <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-400">
                ₹{amount.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-400">INC. GST</div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Payment Authorized!</h3>
            <p className="text-xs text-slate-600">
              Transaction ID:{' '}
              <span className="font-mono font-bold text-slate-900">{successData?.paymentId}</span>
            </p>
            <p className="text-xs text-slate-500">
              Receipt <span className="font-mono font-bold">{successData?.receiptNumber}</span> generated and synced to ledger.
            </p>
          </div>
        ) : isProcessing ? (
          <div className="p-10 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">Processing Payment</h4>
              <p className="text-xs text-slate-500">{processingStep}</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden max-w-xs mx-auto">
              <div className="bg-indigo-600 h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Responsive Method Switcher (Top segmented on mobile) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`min-h-[42px] px-2 py-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'upi'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>UPI</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`min-h-[42px] px-2 py-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'card'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`min-h-[42px] px-2 py-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'netbanking'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Banking</span>
              </button>
            </div>

            {/* Method Inputs */}
            {selectedMethod === 'upi' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg max-w-fit mx-auto">
                  <button
                    type="button"
                    onClick={() => setUpiOption('qr')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      upiOption === 'qr' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    UPI QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiOption('vpa')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      upiOption === 'vpa' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    UPI ID / VPA
                  </button>
                </div>

                {upiOption === 'qr' ? (
                  <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                    <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-xs">
                      <QrCode className="w-32 h-32 sm:w-36 sm:h-36 text-slate-900" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">
                        Scan with GPay, PhonePe, Paytm, or BHIM
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Instant verification upon approval
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Virtual Payment Address (UPI ID)</label>
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-base sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                    />
                    <p className="text-[11px] text-slate-500">
                      A payment collect prompt will be pushed to your UPI app.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-base sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-base sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-base sm:text-sm font-mono focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Select Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                        selectedBank === bank
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>PCI-DSS Level 1 & RBI End-to-End Encrypted</span>
            </div>

            {/* Sticky Action Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePay}
                className="min-h-[46px] flex-1 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Authorize & Pay ₹{amount.toLocaleString('en-IN')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
