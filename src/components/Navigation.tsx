import React from 'react';
import { LayoutDashboard, Package, FileText, Users, CreditCard, Sparkles, RefreshCw } from 'lucide-react';
import { SubscriptionState } from '../types';

interface NavigationProps {
  currentTab: 'dashboard' | 'inventory' | 'billing' | 'crm' | 'subscription';
  onSelectTab: (tab: 'dashboard' | 'inventory' | 'billing' | 'crm' | 'subscription') => void;
  subscription: SubscriptionState;
  onOpenCopilot: () => void;
  onResetData: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  subscription,
  onOpenCopilot,
  onResetData,
}) => {
  const tabs = [
    { id: 'dashboard' as const, label: 'Home', icon: LayoutDashboard },
    { id: 'inventory' as const, label: 'Inventory', icon: Package },
    { id: 'billing' as const, label: 'Billing', icon: FileText },
    { id: 'crm' as const, label: 'CRM', icon: Users },
    { id: 'subscription' as const, label: 'Pro (₹299)', icon: CreditCard },
  ];

  return (
    <>
      {/* Top Header Bar (Desktop, Tablet & Mobile) */}
      <header className="no-print bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
          {/* Brand Zone */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 sm:gap-2.5 text-left active:scale-95 transition-transform"
          >
            <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
              TF
            </span>
            <div className="flex flex-col">
              <span className="leading-tight font-black">TradeFlow</span>
              <span className="text-[10px] text-slate-500 hidden lg:inline-block font-normal">
                Inventory & Billing OS
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links (Only on large desktop screens >= xl) */}
          <nav className="hidden xl:flex items-center gap-1.5 lg:gap-4 text-xs lg:text-sm font-medium">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 py-1.5 px-2 md:px-2.5 lg:px-3 rounded-xl min-h-[38px] ${
                    isActive
                      ? 'text-indigo-700 font-bold bg-indigo-50 border border-indigo-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            <button
              onClick={onResetData}
              title="Reset to default demo data"
              className="min-h-[38px] min-w-[38px] p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors hidden sm:flex items-center justify-center"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* AI Copilot Touch Button */}
            <button
              onClick={onOpenCopilot}
              className="min-h-[38px] sm:min-h-[40px] px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="hidden sm:inline">AI Copilot</span>
              <span className="sm:hidden">Copilot</span>
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Tab Bar for Mobile & Tablets (App-Native Ergonomics) */}
      <nav
        aria-label="Mobile & Tablet Navigation"
        className="no-print xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg px-2 sm:px-6 md:px-8 pb-[env(safe-area-inset-bottom,8px)] pt-1.5"
      >
        <div className="grid grid-cols-5 items-center max-w-lg md:max-w-2xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[52px] md:min-h-[58px] py-1 px-1 rounded-xl transition-all active:scale-90 ${
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`relative p-1 md:p-1.5 rounded-xl transition-colors ${
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5 md:w-5.5 md:h-5.5 stroke-[2.2]" />
                  {tab.id === 'subscription' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <span
                  className={`text-[10px] md:text-xs mt-0.5 tracking-tight truncate max-w-[68px] md:max-w-[88px] ${
                    isActive ? 'font-bold text-indigo-700' : 'font-medium text-slate-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
