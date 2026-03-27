import { create } from 'zustand'
import type { RFQ, PurchaseOrder, EmailLog, RFQStatus, POStatus } from '@/types'
import { rfqs as mockRFQs, purchaseOrders as mockPOs, emailLogs as mockEmails } from '@/data/mock'

interface TradeStore {
  rfqs: RFQ[]
  purchaseOrders: PurchaseOrder[]
  emailLogs: EmailLog[]

  // RFQ
  addRFQ: (rfq: RFQ) => void
  updateRFQ: (id: string, updates: Partial<RFQ>) => void
  updateRFQStatus: (id: string, status: RFQStatus) => void

  // PO
  addPO: (po: PurchaseOrder) => void
  updatePOStatus: (id: string, status: POStatus) => void

  // Email
  addEmailLog: (log: EmailLog) => void
}

export const useStore = create<TradeStore>((set) => ({
  rfqs: mockRFQs,
  purchaseOrders: mockPOs,
  emailLogs: mockEmails,

  addRFQ: (rfq) =>
    set((s) => ({ rfqs: [rfq, ...s.rfqs] })),

  updateRFQ: (id, updates) =>
    set((s) => ({
      rfqs: s.rfqs.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    })),

  updateRFQStatus: (id, status) =>
    set((s) => ({
      rfqs: s.rfqs.map((r) =>
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
      ),
    })),

  addPO: (po) =>
    set((s) => ({ purchaseOrders: [po, ...s.purchaseOrders] })),

  updatePOStatus: (id, status) =>
    set((s) => ({
      purchaseOrders: s.purchaseOrders.map((p) =>
        p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
      ),
    })),

  addEmailLog: (log) =>
    set((s) => ({ emailLogs: [log, ...s.emailLogs] })),
}))
