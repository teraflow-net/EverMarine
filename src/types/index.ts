/**
 * TradeFlow TypeScript 타입 정의
 * ERP_Client Django 모델 기준 (teraflow-net/ERP_Client)
 */

// ═══════════════════════════════════════════
// 공통
// ═══════════════════════════════════════════

export type Currency = 'USD' | 'EUR' | 'JPY' | 'CNY' | 'KRW' | 'GBP' | 'SGD' | 'HKD' | 'AUD' | 'CAD'

// ═══════════════════════════════════════════
// 거래처 (cp_customer)
// ═══════════════════════════════════════════

export interface Customer {
  id: number
  code: string | null
  name: string
  business_number: string
  supplier_code: string
  phone: string
  fax: string
  contact_person: string
  email: string
  address: string
  remark: string
}

// ═══════════════════════════════════════════
// 매입처 (cp_supplier)
// ═══════════════════════════════════════════

export interface Supplier {
  id: number
  code: string | null
  name: string
  business_number: string
  supplier_code: string
  phone: string
  fax: string
  contact_person: string
  email: string
  address: string
  remark: string
  equipment_info: string
  group: string
  payment_method: string
}

// ═══════════════════════════════════════════
// 선박 (cp_vessel)
// ═══════════════════════════════════════════

export interface Vessel {
  id: number
  code: string | null
  vessel_name: string
  sales_customer: string
  shipping_company: string
  call_sign: string
  imo_no: string
  hull_no: string
  shipyard: string
  remark: string
  vessel_type: string
  engine_type1: string
  engine_type2: string
  engine_type3: string
  engine_type4: string
}

// ═══════════════════════════════════════════
// 매입처 품목단가 (cp_supplier_item_price)
// ═══════════════════════════════════════════

export interface SupplierItemPrice {
  id: number
  supplier_code: string
  supplier_name: string
  item_code: string
  item_name: string
  part_no: string
  purchase_price_krw: number
  purchase_price_foreign: number
  delivery_days: number
  last_modified_date: string
  last_modified_by: string
  classification: string
  doc_number: string
}

// ═══════════════════════════════════════════
// 견적서 (qt_quote)
// ═══════════════════════════════════════════

export interface Quote {
  id: number
  doc_number: string
  mail_uid: number | null
  created_date: string
  shipping_date: string | null
  customer_name: string
  ref_no: string
  total_amount_krw: number
  total_amount_foreign: number
  currency: Currency
  exchange_rate: number | null
  vessel_name: string
  shipping_company: string
  is_quote: boolean
  is_order: boolean
  is_specification: boolean
  is_tax: boolean
  is_payment: boolean
  purchase_amount_krw: number
  purchase_amount_foreign: number
  margin_percent: number
  discount: number
  vat: number
  pk_charge: number
  ot_charge: number
  ft_charge: number
  ci_margin_amount: number
  supplier_name: string
  product_brand: string
  product_type: string
  order_no: string
  work_type: string
  sum_amount_krw: number
  sum_amount_foreign: number
  remark: string
  items?: QuoteItem[]
}

// ═══════════════════════════════════════════
// 견적 품목 (qt_quote_item)
// ═══════════════════════════════════════════

export interface QuoteItem {
  id: number
  quote: number
  item: number
  pos: string
  part_no: string
  product_name: string
  quantity: number
  unit: string
  sales_price_krw: number
  sales_price_foreign: number
  sales_amount_krw: number
  sales_amount_foreign: number
  margin: number
  is_sales: boolean
  is_purchase: boolean
  supplier_code: string
  supplier_name: string
  requester1: string
  requester2: string
  requester3: string
  purchase_price_krw: number
  purchase_amount_krw: number
  delivery_date: string | null
  process_status: string
  is_stock: boolean
  remark: string
  print_option: string
}

// ═══════════════════════════════════════════
// 이메일 수신 (mail_parser)
// ═══════════════════════════════════════════

export interface Email {
  uid: number
  subject: string
  sender: string
  received_date: string
  body_text: string
  has_attachments: boolean
  created_at: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  id: number
  email: number
  filename: string
  file_type: string
  file_content: string
  parsed_json: Record<string, unknown> | null
  created_at: string
}

// ═══════════════════════════════════════════
// 보낸 메일 (sent_email)
// ═══════════════════════════════════════════

export interface SentEmail {
  mail_id: string
  doc_number: string
  subject: string
  receiver: string
  sent_date: string
  body_text: string
  has_attachments: boolean
  created_at: string
  attachments?: SentEmailAttachment[]
}

export interface SentEmailAttachment {
  id: number
  email: string
  filename: string
  file_type: string
  file_content: string
  parsed_json: Record<string, unknown> | null
  created_at: string
}

// ═══════════════════════════════════════════
// 단가 조회 (ps_price_search)
// ═══════════════════════════════════════════

export interface PriceSearch {
  id: number
  order_status: string
  customer_name: string
  customer_code: string
  supplier_name: string
  supplier_code: string
  purchase_price: number
  sales_price: number
  exchange_rate: number
  purchase_price_foreign: number
  sales_price_foreign: number
  margin_percent: number
  date: string
  our_no: string
  po_no: string
  quantity: number
  unit: string
  item_code: string
  item_name: string
  specification: string
  maker_type: string
  vessel_name: string
  part_no: string
  partner_code: string
  remark: string
}

// ═══════════════════════════════════════════
// 견적서 템플릿 (od_quote_template)
// ═══════════════════════════════════════════

export interface QuoteTemplate {
  id: number
  name: string
  template_type: 'PDF' | 'EXCEL'
  region: 'DOMESTIC' | 'OVERSEAS'
  file: string
  is_active: boolean
  priority: number
  customer_names: string
  field_mapping: Record<string, string>
  created_at: string
  updated_at: string
}

// ═══════════════════════════════════════════
// 견적서 발송 이력 (od_quote_send_log)
// ═══════════════════════════════════════════

export interface QuoteSendLog {
  id: number
  quote: number
  template: number | null
  recipient_email: string
  status: 'SUCCESS' | 'FAILED'
  generated_file: string | null
  sent_date: string
  error_message: string
}

// ═══════════════════════════════════════════
// 품목별 매입처 견적 추적 (ItemSupplierQuote)
// ═══════════════════════════════════════════

export interface ItemSupplierQuote {
  supplierId: number
  supplierCode: string
  supplierName: string
  status: 'pending' | 'requested' | 'replied' | 'selected'
  purchasePriceKrw: number | null
  purchasePriceForeign: number | null
  deliveryDays: number | null
  repliedAt: string | null
  remarks: string
}

// ═══════════════════════════════════════════
// 발주서 (PurchaseOrder)
// ═══════════════════════════════════════════

export interface PurchaseOrder {
  id: number
  poNo: string          // PO-2026-xxxx
  quoteId: number       // FK → Quote
  docNumber: string     // 연결 견적 문서번호
  customerName: string
  supplierId: number
  supplierCode: string
  supplierName: string
  items: POItem[]
  totalAmountKrw: number
  totalAmountForeign: number
  currency: Currency
  issuedAt: string
  confirmedAt: string | null
  shippingStatus: ShippingStatus
  expectedDelivery: string | null
  actualDelivery: string | null
  trackingNo: string
  remark: string
}

export interface POItem {
  quoteItemId: number
  partNo: string
  productName: string
  quantity: number
  unit: string
  purchasePriceKrw: number
  purchasePriceForeign: number
}

export type ShippingStatus = 'po_sent' | 'po_confirmed' | 'in_production' | 'shipped' | 'in_transit' | 'arrived' | 'delivered'
