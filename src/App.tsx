/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CustomerCRM, CustomerInteraction, InventoryItem, Invoice, SubscriptionState } from './types';
import {
  getStoredCustomers,
  getStoredInventory,
  getStoredInvoices,
  getStoredSubscription,
  resetAllDemoData,
  saveStoredCustomers,
  saveStoredInventory,
  saveStoredInvoices,
  saveStoredSubscription,
} from './data/storage';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { BillingView } from './components/BillingView';
import { CrmView } from './components/CrmView';
import { SubscriptionView } from './components/SubscriptionView';
import { RazorpayModal } from './components/RazorpayModal';
import { CopilotDrawer } from './components/CopilotDrawer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'inventory' | 'billing' | 'crm' | 'subscription'>('dashboard');

  // Application Data States
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<CustomerCRM[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);

  // Copilot Drawer state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Razorpay Gateway state
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [razorpayConfig, setRazorpayConfig] = useState<{
    amount: number;
    purpose: string;
    invoiceId?: string;
    isSubscription?: boolean;
    customerName?: string;
  }>({
    amount: 299,
    purpose: 'TradeFlow Pro Subscription - 1 Month',
    isSubscription: true,
  });

  // Cross-view quick modals
  const [directInvoiceModal, setDirectInvoiceModal] = useState(false);
  const [directCustomerModal, setDirectCustomerModal] = useState(false);

  // Load from persistent local storage
  useEffect(() => {
    setInventory(getStoredInventory());
    setInvoices(getStoredInvoices());
    setCustomers(getStoredCustomers());
    setSubscription(getStoredSubscription());
  }, []);

  // --- Handlers for Inventory ---
  const handleAddOrUpdateItem = (item: InventoryItem) => {
    const exists = inventory.some((i) => i.id === item.id);
    const updated = exists ? inventory.map((i) => (i.id === item.id ? item : i)) : [item, ...inventory];
    setInventory(updated);
    saveStoredInventory(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = inventory.filter((i) => i.id !== id);
    setInventory(updated);
    saveStoredInventory(updated);
  };

  const handleQuickRestock = (id: string, qty: number) => {
    const updated = inventory.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          stockQuantity: item.stockQuantity + qty,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    setInventory(updated);
    saveStoredInventory(updated);
  };

  // --- Handlers for Invoices & Automated Stock Depletion ---
  const handleCreateInvoice = (newInvoice: Invoice) => {
    // 1. Auto-decrement stock for all invoiced items
    const updatedInventory = inventory.map((invItem) => {
      const lineItem = newInvoice.items.find((li) => li.itemId === invItem.id);
      if (lineItem) {
        const newStock = Math.max(0, invItem.stockQuantity - lineItem.qty);
        return {
          ...invItem,
          stockQuantity: newStock,
          updatedAt: new Date().toISOString(),
        };
      }
      return invItem;
    });

    // 2. Update customer purchases & outstanding dues in CRM
    const updatedCustomers = customers.map((c) => {
      if (c.id === newInvoice.customerId) {
        return {
          ...c,
          totalPurchases: c.totalPurchases + newInvoice.grandTotal,
          outstandingBalance: c.outstandingBalance + newInvoice.grandTotal,
        };
      }
      return c;
    });

    // 3. Save new invoice
    const updatedInvoices = [newInvoice, ...invoices];

    setInventory(updatedInventory);
    setCustomers(updatedCustomers);
    setInvoices(updatedInvoices);

    saveStoredInventory(updatedInventory);
    saveStoredCustomers(updatedCustomers);
    saveStoredInvoices(updatedInvoices);
  };

  // --- Handlers for CRM ---
  const handleAddOrUpdateCustomer = (customer: CustomerCRM) => {
    const exists = customers.some((c) => c.id === customer.id);
    const updated = exists ? customers.map((c) => (c.id === customer.id ? customer : c)) : [customer, ...customers];
    setCustomers(updated);
    saveStoredCustomers(updated);
  };

  const handleAddInteraction = (customerId: string, interaction: CustomerInteraction) => {
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        return {
          ...c,
          interactions: [interaction, ...c.interactions],
        };
      }
      return c;
    });
    setCustomers(updated);
    saveStoredCustomers(updated);
  };

  // --- Handlers for Razorpay Payments ---
  const handleOpenPaymentForInvoice = (invoice: Invoice) => {
    setRazorpayConfig({
      amount: invoice.grandTotal,
      purpose: `Tax Invoice ${invoice.invoiceNumber} Settlement`,
      invoiceId: invoice.id,
      isSubscription: false,
      customerName: invoice.customerName,
    });
    setIsRazorpayOpen(true);
  };

  const handleRenewSubscription = () => {
    setRazorpayConfig({
      amount: 299,
      purpose: 'TradeFlow Pro Subscription - 1 Month Renewal',
      isSubscription: true,
      customerName: 'Authorized Store Merchant',
    });
    setIsRazorpayOpen(true);
  };

  const handlePaymentSuccess = (paymentResult: any) => {
    if (razorpayConfig.isSubscription) {
      if (!subscription) return;
      const nextEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const newTransaction = {
        id: `sub_pay_${Date.now()}`,
        paymentId: paymentResult.paymentId,
        receiptNumber: paymentResult.receiptNumber,
        date: new Date().toISOString(),
        amount: razorpayConfig.amount,
        method: paymentResult.method || 'Razorpay UPI',
        status: 'success' as const,
      };

      const updatedSub: SubscriptionState = {
        ...subscription,
        status: 'active',
        currentPeriodEnd: nextEndDate,
        paymentHistory: [newTransaction, ...subscription.paymentHistory],
      };

      setSubscription(updatedSub);
      saveStoredSubscription(updatedSub);
    } else if (razorpayConfig.invoiceId) {
      // Mark invoice as paid
      const targetInvoice = invoices.find((i) => i.id === razorpayConfig.invoiceId);
      if (!targetInvoice) return;

      const updatedInvoices = invoices.map((inv) => {
        if (inv.id === razorpayConfig.invoiceId) {
          return {
            ...inv,
            status: 'paid' as const,
            paymentMethod: (paymentResult.method?.includes('UPI') ? 'UPI' : 'Card') as any,
            paymentId: paymentResult.paymentId,
          };
        }
        return inv;
      });

      // Reduce outstanding balance for customer
      const updatedCustomers = customers.map((c) => {
        if (c.id === targetInvoice.customerId) {
          return {
            ...c,
            outstandingBalance: Math.max(0, c.outstandingBalance - targetInvoice.grandTotal),
          };
        }
        return c;
      });

      setInvoices(updatedInvoices);
      setCustomers(updatedCustomers);
      saveStoredInvoices(updatedInvoices);
      saveStoredCustomers(updatedCustomers);
    }
  };

  const handleResetData = () => {
    if (confirm('Reset demo data to default catalog, customers, and invoices?')) {
      resetAllDemoData();
      setInventory(getStoredInventory());
      setInvoices(getStoredInvoices());
      setCustomers(getStoredCustomers());
      setSubscription(getStoredSubscription());
    }
  };

  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-xs font-mono">
        Loading TradeFlow Commercial Systems...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        subscription={subscription}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 pt-3.5 sm:pt-6 pb-24 md:pb-24 xl:pb-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            inventory={inventory}
            invoices={invoices}
            customers={customers}
            subscription={subscription}
            onNavigate={setCurrentTab}
            onOpenCreateInvoice={() => {
              setCurrentTab('billing');
              setDirectInvoiceModal(true);
            }}
            onOpenAddProduct={() => {
              setCurrentTab('inventory');
            }}
            onOpenAddCustomer={() => {
              setCurrentTab('crm');
              setDirectCustomerModal(true);
            }}
            onOpenCopilot={() => setIsCopilotOpen(true)}
            onSelectInvoiceForPayment={handleOpenPaymentForInvoice}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView
            inventory={inventory}
            onAddOrUpdateItem={handleAddOrUpdateItem}
            onDeleteItem={handleDeleteItem}
            onQuickRestock={handleQuickRestock}
            onOpenCopilotWithQuery={(q) => {
              setIsCopilotOpen(true);
            }}
          />
        )}

        {currentTab === 'billing' && (
          <BillingView
            invoices={invoices}
            inventory={inventory}
            customers={customers}
            onCreateInvoice={handleCreateInvoice}
            onOpenPaymentGateway={handleOpenPaymentForInvoice}
            isCreateModalOpenDirectly={directInvoiceModal}
            onCloseDirectModal={() => setDirectInvoiceModal(false)}
          />
        )}

        {currentTab === 'crm' && (
          <CrmView
            customers={customers}
            invoices={invoices}
            onAddOrUpdateCustomer={handleAddOrUpdateCustomer}
            onAddInteraction={handleAddInteraction}
            onOpenCopilotWithQuery={(q) => {
              setIsCopilotOpen(true);
            }}
            isAddModalOpenDirectly={directCustomerModal}
            onCloseDirectModal={() => setDirectCustomerModal(false)}
          />
        )}

        {currentTab === 'subscription' && (
          <SubscriptionView
            subscription={subscription}
            onRenewSubscription={handleRenewSubscription}
            onToggleAutoRenew={() => {
              const updated = { ...subscription, autoRenew: !subscription.autoRenew };
              setSubscription(updated);
              saveStoredSubscription(updated);
            }}
          />
        )}
      </main>

      {/* Razorpay Gateway Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={razorpayConfig.amount}
        purpose={razorpayConfig.purpose}
        customerName={razorpayConfig.customerName}
      />

      {/* Gemini 3.8 Flash Copilot Drawer (Google Grounded) */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        inventory={inventory}
        invoices={invoices}
        customers={customers}
      />

      {/* Footer (Desktop only, mobile uses persistent bottom navigation bar) */}
      <footer className="no-print hidden md:block mt-auto py-6 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TradeFlow Systems</span>
            <span>·</span>
            <span>GST-Compliant Commercial Operations Suite</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>₹299 / Month Pro Subscription</span>
            <span>·</span>
            <span>Secured via Razorpay Rails</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
