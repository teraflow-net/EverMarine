import type { Customer, Supplier, Part, RFQ, PurchaseOrder, EmailLog } from '@/types'

export const customers: Customer[] = [
  { id: 'c1', name: 'John Smith', company: 'Pacific Shipping Ltd.', email: 'jsmith@pacific-ship.com', phone: '+65-6123-4567', country: 'Singapore', createdAt: '2024-01-15' },
  { id: 'c2', name: 'Maria Santos', company: 'Atlantic Marine Corp.', email: 'msantos@atlantic-marine.com', phone: '+1-305-555-0192', country: 'USA', createdAt: '2024-02-20' },
  { id: 'c3', name: 'Kenji Tanaka', company: 'Nippon Vessel Works', email: 'ktanaka@nippon-vessel.co.jp', phone: '+81-3-5555-1234', country: 'Japan', createdAt: '2024-03-10' },
  { id: 'c4', name: 'Lars Eriksson', company: 'Nordic Bulk Carriers', email: 'leriksson@nordicbulk.no', phone: '+47-22-555-678', country: 'Norway', createdAt: '2024-04-05' },
]

export const suppliers: Supplier[] = [
  { id: 's1', name: 'David Lee', company: 'Korean Parts Co., Ltd.', email: 'dlee@kparts.kr', phone: '+82-2-555-1234', country: 'South Korea', specialties: ['Engine Parts', 'Filters', 'Pumps'], createdAt: '2023-06-01' },
  { id: 's2', name: 'Wei Zhang', company: 'Shanghai Marine Supply', email: 'wzhang@shmarine.cn', phone: '+86-21-5555-6789', country: 'China', specialties: ['Deck Equipment', 'Safety Equipment', 'Navigation'], createdAt: '2023-07-15' },
  { id: 's3', name: 'Raj Patel', company: 'India Ship Stores Pvt.', email: 'rpatel@indiass.in', phone: '+91-22-555-8901', country: 'India', specialties: ['General Stores', 'Cabin Supplies', 'Electrical'], createdAt: '2023-08-20' },
  { id: 's4', name: 'Hans Mueller', company: 'Hamburger Schiffsteile GmbH', email: 'hmueller@hbgteile.de', phone: '+49-40-555-2345', country: 'Germany', specialties: ['Engine Parts', 'Hydraulic', 'Automation'], createdAt: '2023-09-10' },
]

export const parts: Part[] = [
  { id: 'p1', partNo: 'ME-001-FLT', description: 'Main Engine Lube Oil Filter Element', category: 'Engine Parts', unit: 'PCS', avgCost: 85.0, lastSalePrice: 125.0 },
  { id: 'p2', partNo: 'ME-002-INJ', description: 'Fuel Injector Nozzle Set (6 pcs)', category: 'Engine Parts', unit: 'SET', avgCost: 1200.0, lastSalePrice: 1750.0 },
  { id: 'p3', partNo: 'PMP-003-IMP', description: 'Sea Water Pump Impeller', category: 'Pumps', unit: 'PCS', avgCost: 320.0, lastSalePrice: 480.0 },
  { id: 'p4', partNo: 'NAV-004-GPS', description: 'GPS Antenna Unit', category: 'Navigation', unit: 'PCS', avgCost: 450.0, lastSalePrice: 650.0 },
  { id: 'p5', partNo: 'SAF-005-LSA', description: 'Life Jacket Adult (SOLAS)', category: 'Safety Equipment', unit: 'PCS', avgCost: 95.0, lastSalePrice: 145.0 },
  { id: 'p6', partNo: 'HYD-006-HSL', description: 'Hydraulic Hose Assembly 1/2" x 1m', category: 'Hydraulic', unit: 'PCS', avgCost: 55.0, lastSalePrice: 85.0 },
  { id: 'p7', partNo: 'ELC-007-TRF', description: '24V DC Transformer 10A', category: 'Electrical', unit: 'PCS', avgCost: 180.0, lastSalePrice: 265.0 },
  { id: 'p8', partNo: 'DK-008-CHN', description: 'Anchor Chain Shackle 60mm', category: 'Deck Equipment', unit: 'PCS', avgCost: 75.0, lastSalePrice: 110.0 },
]

export const rfqs: RFQ[] = [
  {
    id: 'rfq1',
    rfqNo: 'RFQ-2026-0089',
    customerId: 'c1',
    customerName: 'Pacific Shipping Ltd.',
    status: 'supplier_replied',
    receivedAt: '2026-03-24T09:15:00Z',
    updatedAt: '2026-03-25T14:30:00Z',
    attachments: ['RFQ_PSL_MV_Pacific_Star.pdf'],
    notes: 'Urgent - vessel in Singapore for drydock',
    totalSaleAmount: 4285.0,
    items: [
      {
        id: 'ri1', partNo: 'ME-001-FLT', description: 'Main Engine Lube Oil Filter Element', quantity: 6, unit: 'PCS',
        supplierQuotes: [
          { supplierId: 's1', supplierName: 'Korean Parts Co.', unitPrice: 82.0, leadTimeDays: 3, currency: 'USD' },
          { supplierId: 's2', supplierName: 'Shanghai Marine Supply', unitPrice: 74.0, leadTimeDays: 5, currency: 'USD' },
        ],
        selectedSupplierId: 's1', costPrice: 82.0, salePrice: 125.0, margin: 34.4,
      },
      {
        id: 'ri2', partNo: 'PMP-003-IMP', description: 'Sea Water Pump Impeller', quantity: 2, unit: 'PCS',
        supplierQuotes: [
          { supplierId: 's1', supplierName: 'Korean Parts Co.', unitPrice: 310.0, leadTimeDays: 3, currency: 'USD' },
          { supplierId: 's4', supplierName: 'Hamburger Schiffsteile', unitPrice: 345.0, leadTimeDays: 7, currency: 'USD' },
        ],
        selectedSupplierId: 's1', costPrice: 310.0, salePrice: 480.0, margin: 35.4,
      },
      {
        id: 'ri3', partNo: 'HYD-006-HSL', description: 'Hydraulic Hose Assembly 1/2" x 1m', quantity: 10, unit: 'PCS',
        supplierQuotes: [
          { supplierId: 's3', supplierName: 'India Ship Stores', unitPrice: 52.0, leadTimeDays: 4, currency: 'USD' },
        ],
        selectedSupplierId: 's3', costPrice: 52.0, salePrice: 85.0, margin: 38.8,
      },
    ],
  },
  {
    id: 'rfq2',
    rfqNo: 'RFQ-2026-0088',
    customerId: 'c2',
    customerName: 'Atlantic Marine Corp.',
    status: 'quoted_customer',
    receivedAt: '2026-03-22T11:00:00Z',
    updatedAt: '2026-03-24T16:20:00Z',
    attachments: ['Requisition_AMC_2026_03.xlsx'],
    totalSaleAmount: 2450.0,
    items: [
      {
        id: 'ri4', partNo: 'ME-002-INJ', description: 'Fuel Injector Nozzle Set (6 pcs)', quantity: 1, unit: 'SET',
        supplierQuotes: [
          { supplierId: 's1', supplierName: 'Korean Parts Co.', unitPrice: 1180.0, leadTimeDays: 5, currency: 'USD' },
          { supplierId: 's4', supplierName: 'Hamburger Schiffsteile', unitPrice: 1250.0, leadTimeDays: 10, currency: 'USD' },
        ],
        selectedSupplierId: 's1', costPrice: 1180.0, salePrice: 1750.0, margin: 32.6,
      },
      {
        id: 'ri5', partNo: 'SAF-005-LSA', description: 'Life Jacket Adult (SOLAS)', quantity: 10, unit: 'PCS',
        supplierQuotes: [
          { supplierId: 's2', supplierName: 'Shanghai Marine Supply', unitPrice: 90.0, leadTimeDays: 4, currency: 'USD' },
          { supplierId: 's3', supplierName: 'India Ship Stores', unitPrice: 88.0, leadTimeDays: 6, currency: 'USD' },
        ],
        selectedSupplierId: 's2', costPrice: 90.0, salePrice: 145.0, margin: 37.9,
      },
    ],
  },
  {
    id: 'rfq3',
    rfqNo: 'RFQ-2026-0087',
    customerId: 'c3',
    customerName: 'Nippon Vessel Works',
    status: 'po_received',
    receivedAt: '2026-03-20T08:30:00Z',
    updatedAt: '2026-03-25T10:00:00Z',
    attachments: ['NVW_RFQ_20260320.pdf'],
    totalSaleAmount: 1570.0,
    items: [
      {
        id: 'ri6', partNo: 'NAV-004-GPS', description: 'GPS Antenna Unit', quantity: 2, unit: 'PCS',
        supplierQuotes: [
          { supplierId: 's2', supplierName: 'Shanghai Marine Supply', unitPrice: 430.0, leadTimeDays: 7, currency: 'USD' },
        ],
        selectedSupplierId: 's2', costPrice: 430.0, salePrice: 650.0, margin: 33.8,
      },
      {
        id: 'ri7', partNo: 'ELC-007-TRF', description: '24V DC Transformer 10A', quantity: 1, unit: 'PCS',
        supplierQuotes: [
          { supplierId: 's3', supplierName: 'India Ship Stores', unitPrice: 170.0, leadTimeDays: 5, currency: 'USD' },
          { supplierId: 's4', supplierName: 'Hamburger Schiffsteile', unitPrice: 195.0, leadTimeDays: 8, currency: 'USD' },
        ],
        selectedSupplierId: 's3', costPrice: 170.0, salePrice: 265.0, margin: 35.8,
      },
    ],
  },
  {
    id: 'rfq4',
    rfqNo: 'RFQ-2026-0086',
    customerId: 'c4',
    customerName: 'Nordic Bulk Carriers',
    status: 'ordered',
    receivedAt: '2026-03-18T07:45:00Z',
    updatedAt: '2026-03-23T09:15:00Z',
    attachments: ['NBC_Spares_Order_Mar26.xlsx'],
    totalSaleAmount: 660.0,
    items: [
      {
        id: 'ri8', partNo: 'DK-008-CHN', description: 'Anchor Chain Shackle 60mm', quantity: 6, unit: 'PCS',
        supplierQuotes: [
          { supplierId: 's2', supplierName: 'Shanghai Marine Supply', unitPrice: 70.0, leadTimeDays: 6, currency: 'USD' },
        ],
        selectedSupplierId: 's2', costPrice: 70.0, salePrice: 110.0, margin: 36.4,
      },
    ],
  },
  {
    id: 'rfq5',
    rfqNo: 'RFQ-2026-0085',
    customerId: 'c1',
    customerName: 'Pacific Shipping Ltd.',
    status: 'received',
    receivedAt: '2026-03-26T06:00:00Z',
    updatedAt: '2026-03-26T06:00:00Z',
    attachments: ['Requisition_PSL_MV_Pacific_Dawn.pdf'],
    items: [
      {
        id: 'ri9', partNo: 'ME-001-FLT', description: 'Main Engine Lube Oil Filter Element', quantity: 12, unit: 'PCS',
        supplierQuotes: [], costPrice: undefined, salePrice: undefined,
      },
      {
        id: 'ri10', partNo: 'PMP-003-IMP', description: 'Sea Water Pump Impeller', quantity: 1, unit: 'PCS',
        supplierQuotes: [], costPrice: undefined, salePrice: undefined,
      },
    ],
  },
  {
    id: 'rfq6',
    rfqNo: 'RFQ-2026-0084',
    customerId: 'c2',
    customerName: 'Atlantic Marine Corp.',
    status: 'closed',
    receivedAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-22T14:00:00Z',
    attachments: [],
    totalSaleAmount: 3200.0,
    items: [],
  },
]

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po1', poNo: 'PO-2026-0041', rfqId: 'rfq4', rfqNo: 'RFQ-2026-0086',
    customerId: 'c4', customerName: 'Nordic Bulk Carriers',
    supplierId: 's2', supplierName: 'Shanghai Marine Supply',
    status: 'confirmed', issuedAt: '2026-03-23T09:00:00Z', updatedAt: '2026-03-24T11:00:00Z',
    expectedDelivery: '2026-03-30', totalAmount: 420.0, currency: 'USD',
  },
  {
    id: 'po2', poNo: 'PO-2026-0040', rfqId: 'rfq6', rfqNo: 'RFQ-2026-0084',
    customerId: 'c2', customerName: 'Atlantic Marine Corp.',
    supplierId: 's1', supplierName: 'Korean Parts Co.',
    status: 'delivered', issuedAt: '2026-03-14T08:00:00Z', updatedAt: '2026-03-21T16:00:00Z',
    expectedDelivery: '2026-03-21', totalAmount: 2100.0, currency: 'USD',
  },
  {
    id: 'po3', poNo: 'PO-2026-0042', rfqId: 'rfq3', rfqNo: 'RFQ-2026-0087',
    customerId: 'c3', customerName: 'Nippon Vessel Works',
    supplierId: 's2', supplierName: 'Shanghai Marine Supply',
    status: 'sent', issuedAt: '2026-03-25T10:00:00Z', updatedAt: '2026-03-25T10:00:00Z',
    expectedDelivery: '2026-04-01', totalAmount: 1030.0, currency: 'USD',
  },
]

export const emailLogs: EmailLog[] = [
  {
    id: 'e1', direction: 'inbound', partyType: 'customer', partyName: 'Pacific Shipping Ltd.',
    subject: '[RFQ] Spare Parts Requisition - MV Pacific Star', body: 'Dear Team,\n\nPlease find attached our spare parts requisition for MV Pacific Star currently in drydock at Singapore.\n\nUrgent items required within 3 days.\n\nBest regards,\nJohn Smith',
    sentAt: '2026-03-24T09:15:00Z', rfqId: 'rfq1',
  },
  {
    id: 'e2', direction: 'outbound', partyType: 'supplier', partyName: 'Korean Parts Co.',
    subject: '[RFQ Request] ME-001-FLT x6, PMP-003-IMP x2 - RFQ-2026-0089', body: 'Dear David,\n\nKindly provide your best quotation for the following items...',
    sentAt: '2026-03-24T10:00:00Z', rfqId: 'rfq1',
  },
  {
    id: 'e3', direction: 'inbound', partyType: 'supplier', partyName: 'Korean Parts Co.',
    subject: 'RE: [RFQ Request] ME-001-FLT x6, PMP-003-IMP x2', body: 'Dear Team,\n\nPlease find our quotation attached. We can deliver within 3 business days.',
    sentAt: '2026-03-24T14:30:00Z', rfqId: 'rfq1',
  },
  {
    id: 'e4', direction: 'outbound', partyType: 'customer', partyName: 'Pacific Shipping Ltd.',
    subject: '[Quotation] RFQ-2026-0089 - Spare Parts for MV Pacific Star', body: 'Dear John,\n\nThank you for your inquiry. Please find our best quotation attached.',
    sentAt: '2026-03-25T09:00:00Z', rfqId: 'rfq1',
  },
  {
    id: 'e5', direction: 'outbound', partyType: 'supplier', partyName: 'Shanghai Marine Supply',
    subject: '[Purchase Order] PO-2026-0041 - Anchor Chain Shackles', body: 'Dear Wei,\n\nPlease find our purchase order PO-2026-0041 attached. Please confirm receipt and delivery schedule.',
    sentAt: '2026-03-23T09:00:00Z', poId: 'po1',
  },
]
