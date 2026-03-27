import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatDate, formatForeign, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import type { ShippingStatus } from '@/types'

const shippingSteps: { key: ShippingStatus; label: string }[] = [
  { key: 'po_sent', label: '발주발송' },
  { key: 'po_confirmed', label: '발주확인' },
  { key: 'in_production', label: '제작중' },
  { key: 'shipped', label: '선적완료' },
  { key: 'in_transit', label: '운송중' },
  { key: 'arrived', label: '입고완료' },
  { key: 'delivered', label: '납품완료' },
]

const shippingStatusConfig: Record<ShippingStatus, { label: string; variant: 'info' | 'indigo' | 'warning' | 'orange' | 'purple' | 'success' | 'emerald' }> = {
  po_sent:        { label: '발주발송', variant: 'info' },
  po_confirmed:   { label: '발주확인', variant: 'indigo' },
  in_production:  { label: '제작중', variant: 'warning' },
  shipped:        { label: '선적완료', variant: 'orange' },
  in_transit:     { label: '운송중', variant: 'purple' },
  arrived:        { label: '입고완료', variant: 'success' },
  delivered:      { label: '납품완료', variant: 'emerald' },
}

export function PODetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const purchaseOrders = useStore((s) => s.purchaseOrders)
  const updatePOShippingStatus = useStore((s) => s.updatePOShippingStatus)

  const po = purchaseOrders.find((p) => p.id === Number(id))

  if (!po) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
        <p className="text-[14px]">발주 건을 찾을 수 없습니다.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/po')}>목록으로</Button>
      </div>
    )
  }

  const currentStepIdx = shippingSteps.findIndex((s) => s.key === po.shippingStatus)
  const sc = shippingStatusConfig[po.shippingStatus]

  function handleAdvanceStatus() {
    const nextIdx = currentStepIdx + 1
    if (nextIdx < shippingSteps.length) {
      updatePOShippingStatus(po!.id, shippingSteps[nextIdx].key)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={po.poNo}
        subtitle={po.supplierName}
        actions={
          <Badge variant={sc.variant}>{sc.label}</Badge>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/po')}
          className="mb-4"
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          목록으로
        </Button>

        {/* PO Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
          <h3 className="text-[13px] font-semibold text-slate-700 mb-4">발주 정보</h3>
          <div className="grid grid-cols-4 gap-x-8 gap-y-4">
            {[
              { label: '연결견적', value: po.docNumber },
              { label: '매출처', value: po.customerName },
              { label: '매입처', value: po.supplierName },
              { label: '발주일', value: formatDate(po.issuedAt) },
              { label: '확인일', value: po.confirmedAt ? formatDate(po.confirmedAt) : '—' },
              { label: '납기예정', value: po.expectedDelivery ? formatDate(po.expectedDelivery) : '—' },
              { label: '실제납품', value: po.actualDelivery ? formatDate(po.actualDelivery) : '—' },
              { label: 'Tracking No', value: po.trackingNo || '—' },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">{item.label}</div>
                <div className="text-[13px] text-slate-700 font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-semibold text-slate-700">Shipping Timeline</h3>
            {currentStepIdx < shippingSteps.length - 1 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAdvanceStatus}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                다음 단계로
              </Button>
            )}
          </div>

          <div className="flex items-center gap-0">
            {shippingSteps.map((step, idx) => {
              const isPast = idx < currentStepIdx
              const isCurrent = idx === currentStepIdx
              const isFuture = idx > currentStepIdx

              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors',
                        isPast && 'bg-emerald-500 text-white',
                        isCurrent && 'bg-sky-500 text-white ring-4 ring-sky-100',
                        isFuture && 'bg-slate-200 text-slate-400',
                      )}
                    >
                      {isPast ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    {/* Label */}
                    <span
                      className={cn(
                        'text-[11px] mt-1.5 font-medium whitespace-nowrap',
                        isPast && 'text-emerald-600',
                        isCurrent && 'text-sky-600 font-semibold',
                        isFuture && 'text-slate-400',
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {idx < shippingSteps.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-[2px] mx-1.5 mt-[-18px]',
                        idx < currentStepIdx ? 'bg-emerald-400' : 'bg-slate-200',
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* PO Items Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
            <h3 className="text-[13px] font-semibold text-slate-700">발주 품목 ({po.items.length}건)</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['PART NO', '품명', '수량', '단위', '매입단가(KRW)', '매입단가(F)', '금액(KRW)'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {po.items.map((item) => (
                <tr key={item.quoteItemId}>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-sky-600">{item.partNo}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-700">{item.productName}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-700 font-medium">{item.quantity}</td>
                  <td className="px-5 py-3.5 text-[12.5px] text-slate-500">{item.unit}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-700">{item.purchasePriceKrw.toLocaleString('ko-KR')}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-700">{formatForeign(item.purchasePriceForeign)}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">
                    {(item.purchasePriceKrw * item.quantity).toLocaleString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={4} className="px-5 py-3 text-right text-[13px] font-semibold text-slate-600">합계</td>
                <td className="px-5 py-3 text-[13px] font-bold text-slate-900">
                  {po.items.reduce((s, i) => s + i.purchasePriceKrw, 0).toLocaleString('ko-KR')}
                </td>
                <td className="px-5 py-3 text-[13px] font-bold text-slate-900">
                  {formatForeign(po.items.reduce((s, i) => s + i.purchasePriceForeign, 0))}
                </td>
                <td className="px-5 py-3 text-[13px] font-bold text-slate-900">
                  {po.totalAmountKrw.toLocaleString('ko-KR')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Remark */}
        {po.remark && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-4">
            <div className="text-[11px] text-orange-500 uppercase tracking-wide font-medium mb-1">비고</div>
            <span className="text-[12.5px] text-orange-700 font-medium">{po.remark}</span>
          </div>
        )}
      </div>
    </div>
  )
}
