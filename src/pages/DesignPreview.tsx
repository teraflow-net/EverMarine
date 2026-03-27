import { Save, Send, Trash2, Plus, Download, Check, X, Filter, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge, QuoteStatusBadge } from '@/components/ui/Badge'
import type { Quote } from '@/types'

const sampleQuote: Quote = {
  id: 0, doc_number: 'MG-2026-0000', mail_uid: null,
  created_date: '2026-01-01', shipping_date: null,
  customer_name: 'Sample', ref_no: 'REF-001',
  total_amount_krw: 0, total_amount_foreign: 0,
  currency: 'USD', exchange_rate: null,
  vessel_name: 'TEST', shipping_company: 'TEST',
  is_quote: true, is_order: true, is_specification: true, is_tax: true, is_payment: true,
  purchase_amount_krw: 0, purchase_amount_foreign: 0,
  margin_percent: 0, discount: 0, vat: 0,
  pk_charge: 0, ot_charge: 0, ft_charge: 0,
  ci_margin_amount: 0, supplier_name: '', product_brand: '', product_type: '',
  order_no: '', work_type: '', sum_amount_krw: 0, sum_amount_foreign: 0, remark: '',
}

const statusVariations: Partial<Quote>[] = [
  { is_quote: false, is_order: false, is_specification: false, is_tax: false, is_payment: false },
  { is_quote: true, is_order: false, is_specification: false, is_tax: false, is_payment: false },
  { is_quote: true, is_order: true, is_specification: false, is_tax: false, is_payment: false },
  { is_quote: true, is_order: true, is_specification: true, is_tax: false, is_payment: false },
  { is_quote: true, is_order: true, is_specification: true, is_tax: true, is_payment: false },
  { is_quote: true, is_order: true, is_specification: true, is_tax: true, is_payment: true },
]

export function DesignPreview() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Design System Preview</h1>
      <p className="text-sm text-slate-500 mb-8">Button + Badge component style guide</p>

      {/* Buttons */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Buttons — Variant</h2>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button variant="primary" icon={<Save size={16} />}>저장</Button>
          <Button variant="secondary" icon={<X size={16} />}>취소</Button>
          <Button variant="ghost" icon={<Filter size={16} />}>필터</Button>
          <Button variant="danger" icon={<Trash2 size={16} />}>삭제</Button>
          <Button variant="success" icon={<Check size={16} />}>완료</Button>
        </div>

        <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Buttons — Size</h2>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>

        <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Buttons — State</h2>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button variant="primary">기본</Button>
          <Button variant="primary" loading>로딩중</Button>
          <Button variant="primary" disabled>비활성</Button>
        </div>

        <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Buttons — 실제 사용 예시</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" icon={<Plus size={16} />}>새 견적 등록</Button>
          <Button variant="primary" icon={<Send size={16} />}>업체 견적 요청</Button>
          <Button variant="secondary" icon={<Download size={16} />}>PDF 다운로드</Button>
          <Button variant="ghost" icon={<ChevronRight size={16} />}>전체보기</Button>
          <Button variant="danger" size="sm" icon={<Trash2 size={14} />}>삭제</Button>
          <Button variant="success" icon={<Check size={16} />}>발주 확인</Button>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Badge — Variant</h2>
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Badge variant="default">default</Badge>
          <Badge variant="info">info</Badge>
          <Badge variant="warning">warning</Badge>
          <Badge variant="success">success</Badge>
          <Badge variant="danger">danger</Badge>
          <Badge variant="purple">purple</Badge>
          <Badge variant="orange">orange</Badge>
          <Badge variant="muted">muted</Badge>
          <Badge variant="indigo">indigo</Badge>
          <Badge variant="emerald">emerald</Badge>
        </div>

        <h2 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">견적 상태 배지</h2>
        <div className="flex flex-wrap items-center gap-4">
          {statusVariations.map((overrides, i) => (
            <QuoteStatusBadge key={i} quote={{ ...sampleQuote, ...overrides }} />
          ))}
        </div>
      </section>
    </div>
  )
}
