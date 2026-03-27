import { create } from 'zustand'
import type { Quote, Email, SentEmail, Customer, Supplier, Vessel, PriceSearch, SupplierItemPrice } from '@/types'
import {
  quotes as mockQuotes,
  emails as mockEmails,
  sentEmails as mockSentEmails,
  customers as mockCustomers,
  suppliers as mockSuppliers,
  vessels as mockVessels,
  priceSearches as mockPriceSearches,
  supplierItemPrices as mockSupplierItemPrices,
} from '@/data/mock'

interface TradeStore {
  quotes: Quote[]
  emails: Email[]
  sentEmails: SentEmail[]
  customers: Customer[]
  suppliers: Supplier[]
  vessels: Vessel[]
  priceSearches: PriceSearch[]
  supplierItemPrices: SupplierItemPrice[]

  // Quote
  addQuote: (quote: Quote) => void
  updateQuote: (id: number, updates: Partial<Quote>) => void
  toggleQuoteFlag: (id: number, flag: 'is_quote' | 'is_order' | 'is_specification' | 'is_tax' | 'is_payment') => void

  // PriceSearch
  addPriceSearch: (item: PriceSearch) => void
  updatePriceSearch: (id: number, updates: Partial<PriceSearch>) => void
  deletePriceSearch: (id: number) => void

  // SupplierItemPrice
  addSupplierItemPrice: (item: SupplierItemPrice) => void
  updateSupplierItemPrice: (id: number, updates: Partial<SupplierItemPrice>) => void
  deleteSupplierItemPrice: (id: number) => void
}

export const useStore = create<TradeStore>((set) => ({
  quotes: mockQuotes,
  emails: mockEmails,
  sentEmails: mockSentEmails,
  customers: mockCustomers,
  suppliers: mockSuppliers,
  vessels: mockVessels,
  priceSearches: mockPriceSearches,
  supplierItemPrices: mockSupplierItemPrices,

  addQuote: (quote) =>
    set((s) => ({ quotes: [quote, ...s.quotes] })),

  updateQuote: (id, updates) =>
    set((s) => ({
      quotes: s.quotes.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    })),

  toggleQuoteFlag: (id, flag) =>
    set((s) => ({
      quotes: s.quotes.map((q) =>
        q.id === id ? { ...q, [flag]: !q[flag] } : q
      ),
    })),

  // PriceSearch CRUD
  addPriceSearch: (item) =>
    set((s) => ({ priceSearches: [item, ...s.priceSearches] })),

  updatePriceSearch: (id, updates) =>
    set((s) => ({
      priceSearches: s.priceSearches.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  deletePriceSearch: (id) =>
    set((s) => ({
      priceSearches: s.priceSearches.filter((p) => p.id !== id),
    })),

  // SupplierItemPrice CRUD
  addSupplierItemPrice: (item) =>
    set((s) => ({ supplierItemPrices: [item, ...s.supplierItemPrices] })),

  updateSupplierItemPrice: (id, updates) =>
    set((s) => ({
      supplierItemPrices: s.supplierItemPrices.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  deleteSupplierItemPrice: (id) =>
    set((s) => ({
      supplierItemPrices: s.supplierItemPrices.filter((p) => p.id !== id),
    })),
}))
