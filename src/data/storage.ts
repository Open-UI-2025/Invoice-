import { CustomerCRM, InventoryItem, Invoice, SubscriptionState } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_INVENTORY, INITIAL_INVOICES, INITIAL_SUBSCRIPTION } from './mockData';

const STORAGE_KEYS = {
  INVENTORY: 'tradeflow_inventory_v1',
  INVOICES: 'tradeflow_invoices_v1',
  CUSTOMERS: 'tradeflow_customers_v1',
  SUBSCRIPTION: 'tradeflow_subscription_v1',
};

export const getStoredInventory = (): InventoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
      return INITIAL_INVENTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load inventory from storage', e);
    return INITIAL_INVENTORY;
  }
};

export const saveStoredInventory = (items: InventoryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save inventory to storage', e);
  }
};

export const getStoredInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load invoices from storage', e);
    return INITIAL_INVOICES;
  }
};

export const saveStoredInvoices = (invoices: Invoice[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoices to storage', e);
  }
};

export const getStoredCustomers = (): CustomerCRM[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load customers from storage', e);
    return INITIAL_CUSTOMERS;
  }
};

export const saveStoredCustomers = (customers: CustomerCRM[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers to storage', e);
  }
};

export const getStoredSubscription = (): SubscriptionState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(INITIAL_SUBSCRIPTION));
      return INITIAL_SUBSCRIPTION;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load subscription from storage', e);
    return INITIAL_SUBSCRIPTION;
  }
};

export const saveStoredSubscription = (sub: SubscriptionState): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
  } catch (e) {
    console.error('Failed to save subscription to storage', e);
  }
};

export const resetAllDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(INITIAL_SUBSCRIPTION));
};
