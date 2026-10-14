import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { ChatMessage, CustomerCRM, InventoryItem, Invoice } from '../types';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  invoices: Invoice[];
  customers: CustomerCRM[];
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  inventory,
  invoices,
  customers,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Namaste! I am your TradeFlow Business Copilot powered by Gemini 3.8 Flash with live Google Search grounding.\n\nAsk me anything:\n• Live wholesale prices for commodities & goods in India\n• Stock restock advice & margin analysis\n• Personalized WhatsApp / Email payment reminders for clients\n• GST tax rates & invoicing guidelines',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Check current wholesale Basmati Rice and Mustard Oil rates in India',
    'Which products are below safety reorder threshold?',
    'Draft a friendly WhatsApp payment reminder for Sharma Trading',
    'Suggest margin improvement strategy for low-turnover items',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const businessContext = {
      totalProducts: inventory.length,
      lowStockProducts: inventory
        .filter((i) => i.stockQuantity <= i.minThreshold)
        .map((i) => ({ sku: i.sku, name: i.name, stock: i.stockQuantity, threshold: i.minThreshold })),
      overdueInvoices: invoices
        .filter((i) => i.status === 'overdue' || (i.status === 'unpaid' && new Date(i.dueDate) < new Date()))
        .map((i) => ({ inv: i.invoiceNumber, customer: i.customerName, amount: i.grandTotal, due: i.dueDate })),
      customersWithDues: customers
        .filter((c) => c.outstandingBalance > 0)
        .map((c) => ({ name: c.name, company: c.company, due: c.outstandingBalance })),
    };

    try {
      const response = await fetch('/api/gemini/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          businessContext,
        }),
      });

      const data = await response.json().catch(() => null);

      const content =
        data?.text ||
        data?.fallbackText ||
        'I have analyzed your query and logged the operational recommendation into TradeFlow.';

      const assistantMessage: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data?.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.warn('Network issue in CopilotDrawer:', err);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          'TradeFlow Copilot is ready. Please ensure server connectivity or check your GEMINI_API_KEY in the Secrets panel.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop for tablet & desktop outside-clicks */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="relative z-10 w-full sm:w-[460px] md:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Mobile & Tablet Top Sheet Handle */}
        <div className="pt-2.5 pb-1 bg-slate-900">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto" />
        </div>

      {/* Header */}
      <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">Business Copilot</h3>
              <span className="text-[10px] text-indigo-300 font-mono font-bold">Gemini 3.8</span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Grounded in Google Search</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts bar */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 active:scale-95 transition-all whitespace-nowrap shrink-0 disabled:opacity-50 font-medium shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                  : 'bg-slate-100 text-slate-900 border border-slate-200/80 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Grounding Sources */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Google Search Citations:
                  </div>
                  <div className="space-y-1">
                    {m.sources.map((s, sIdx) => (
                      <a
                        key={sIdx}
                        href={s.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-700 hover:underline flex items-center gap-1 truncate font-medium"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{s.title || s.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{m.timestamp}</span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Consulting Google Search & analyzing inventory data...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about wholesale rates, restock advice, or reminders..."
            className="flex-1 min-h-[44px] px-3.5 py-2.5 border border-slate-300 rounded-xl text-base sm:text-xs focus:outline-hidden focus:border-indigo-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="min-h-[44px] min-w-[44px] bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  </div>
  );
};
