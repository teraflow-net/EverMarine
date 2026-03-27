import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { QuoteStatusBadges, Badge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatDate, formatKRW, formatForeign, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

const flagConfig = [
  { key: 'is_quote' as const, label: '견적' },
  { key: 'is_order' as const, label: '수주' },
  { key: 'is_specification' as const, label: '명세' },
  { key: 'is_tax' as const, label: '세금' },
  { key: 'is_payment' as const, label: '입금' },
]

export function RFQDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const quotes = useStore((s) => s.quotes)
  const toggleQuoteFlag = useStore((s) => s.toggleQuoteFlag)

  const quote = quotes.find((q) => q.id === Number(id))
  if (!quote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
        <p className="text-[14px]">견적을 찾을 수 없습니다.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/rfq')}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const items = quote.items ?? []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={quote.doc_number}
        subtitle={`${quote.customer_name} · ${quote.ref_no}`}
        actions={
          <div className="flex items-center gap-2">
            <QuoteStatusBadges quote={quote} />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-5 pb-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/rfq')}
            className="mb-4"
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            목록으로
          </Button>

          {/* Info section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
            <div className="grid grid-cols-4 gap-x-8 gap-y-4">
              {[
                { label: '작성일', value: formatDate(quote.created_date) },
                { label: '선적일', value: quote.shipping_date ? formatDate(quote.shipping_date) : '—' },
                { label: '선명', value: quote.vessel_name },
                { label: '선사', value: quote.shipping_company },
                { label: 'MAKER', value: quote.product_brand || '—' },
                { label: 'TYPE', value: quote.product_type || '—' },
                { label: '통화', value: quote.currency },
                { label: '환율', value: quote.exchange_rate ? quote.exchange_rate.toLocaleString('ko-KR') : '—' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">{item.label}</div>
                  <div className="text-[13px] text-slate-700 font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Amounts section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
            <h3 className="text-[13px] font-semibold text-slate-700 mb-4">금액 정보</h3>
            <div className="grid grid-cols-4 gap-x-8 gap-y-4">
              {[
                { label: '총금액(₩)', value: quote.total_amount_krw > 0 ? formatKRW(quote.total_amount_krw) : '—' },
                { label: '총금액(F)', value: quote.total_amount_foreign > 0 ? `${quote.currency} ${formatForeign(quote.total_amount_foreign)}` : '—' },
                { label: '매입액(₩)', value: quote.purchase_amount_krw > 0 ? formatKRW(quote.purchase_amount_krw) : '—' },
                { label: '마진율', value: quote.margin_percent > 0 ? `${quote.margin_percent.toFixed(1)}%` : '—', highlight: true },
                { label: '할인', value: quote.discount > 0 ? formatKRW(quote.discount) : '—' },
                { label: '부가세', value: quote.vat > 0 ? formatKRW(quote.vat) : '—' },
                { label: 'PK CHARGE', value: quote.pk_charge > 0 ? formatKRW(quote.pk_charge) : '—' },
                { label: 'OT CHARGE', value: quote.ot_charge > 0 ? formatKRW(quote.ot_charge) : '—' },
                { label: 'FT CHARGE', value: quote.ft_charge > 0 ? formatKRW(quote.ft_charge) : '—' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">{item.label}</div>
                  <div className={cn(
                    'text-[13px] font-medium',
                    'highlight' in item && item.highlight ? 'text-emerald-600 font-semibold' : 'text-slate-700',
                  )}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status toggle buttons */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
            <h3 className="text-[13px] font-semibold text-slate-700 mb-4">상태 관리</h3>
            <div className="flex items-center gap-3">
              {flagConfig.map((f) => {
                const isActive = quote[f.key]
                return (
                  <Button
                    key={f.key}
                    variant={isActive ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => toggleQuoteFlag(quote.id, f.key)}
                  >
                    {isActive ? '✓ ' : ''}{f.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Remark */}
          {quote.remark && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-4">
              <span className="text-[12.5px] text-orange-700 font-medium">{quote.remark}</span>
            </div>
          )}
        </div>

        {/* Items table */}
        <div className="px-6 pb-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-[13px] font-semibold text-slate-700">견적 품목 ({items.length}건)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['No', 'POS', 'PART NO', '품명', '수량', '단위', '매출단가(₩)', '매출단가(F)', '매입단가(₩)', '매입처', ''].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 text-[12.5px] text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-600">{item.pos}</td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-sky-600">{item.part_no}</td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-700">{item.product_name}</td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-700 font-medium">{item.quantity}</td>
                      <td className="px-5 py-3.5 text-[12.5px] text-slate-500">{item.unit}</td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-700">
                        {item.sales_price_krw > 0 ? item.sales_price_krw.toLocaleString('ko-KR') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-700">
                        {item.sales_price_foreign > 0 ? formatForeign(item.sales_price_foreign) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-500">
                        {item.purchase_price_krw > 0 ? item.purchase_price_krw.toLocaleString('ko-KR') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-slate-500">{item.supplier_name || '—'}</td>
                      <td className="px-5 py-3.5">
                        {item.margin > 0 && (
                          <Badge variant="success" className="text-[11px]">{item.margin.toFixed(1)}%</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={11} className="px-5 py-10 text-center text-[13px] text-slate-400">
                        등록된 품목이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
                {items.length > 0 && (
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={6} className="px-5 py-3 text-right text-[13px] font-semibold text-slate-600">합계</td>
                      <td className="px-5 py-3 text-[13px] font-bold text-slate-900">
                        {items.reduce((s, i) => s + i.sales_amount_krw, 0).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-5 py-3 text-[13px] font-bold text-slate-900">
                        {formatForeign(items.reduce((s, i) => s + i.sales_amount_foreign, 0))}
                      </td>
                      <td className="px-5 py-3 text-[13px] font-semibold text-slate-600">
                        {items.reduce((s, i) => s + i.purchase_amount_krw, 0).toLocaleString('ko-KR')}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
