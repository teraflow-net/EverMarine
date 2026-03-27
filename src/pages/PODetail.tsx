import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { POStatusBadge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { suppliers } from '@/data/mock'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Send, Package } from 'lucide-react'

export function PODetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const purchaseOrders = useStore((s) => s.purchaseOrders)
  const rfqs = useStore((s) => s.rfqs)
  const emailLogs = useStore((s) => s.emailLogs)
  const updatePOStatus = useStore((s) => s.updatePOStatus)

  const po = purchaseOrders.find((p) => p.id === id)
  if (!po) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
        <p className="text-[14px]">발주를 찾을 수 없습니다.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/po')}>목록으로</Button>
      </div>
    )
  }

  const rfq = rfqs.find((r) => r.id === po.rfqId)
  const supplier = suppliers.find((s) => s.id === po.supplierId)
  const relatedEmails = emailLogs.filter((e) => e.poId === po.id)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={po.poNo}
        subtitle={`${po.customerName} → ${po.supplierName}`}
        actions={
          <div className="flex items-center gap-2">
            <POStatusBadge status={po.status} />
            {po.status === 'pending' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => updatePOStatus(po.id, 'sent')}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                공급사에 발주 발송
              </Button>
            )}
            {po.status === 'sent' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => updatePOStatus(po.id, 'confirmed')}
              >
                확인 처리
              </Button>
            )}
            {po.status === 'confirmed' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => updatePOStatus(po.id, 'delivered')}
              >
                납품 완료 처리
              </Button>
            )}
          </div>
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

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-slate-700 mb-4">발주 정보</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '발주번호', value: po.poNo },
                { label: '연결 견적', value: po.rfqNo },
                { label: '고객사', value: po.customerName },
                { label: '공급사', value: po.supplierName },
                { label: '발주금액', value: formatCurrency(po.totalAmount) },
                { label: '발주일', value: formatDate(po.issuedAt) },
                { label: '납기예정', value: po.expectedDelivery ? formatDate(po.expectedDelivery) : '—' },
                { label: '상태', value: <POStatusBadge status={po.status} /> },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-0.5">{item.label}</div>
                  <div className="text-[13px] text-slate-700 font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-slate-700 mb-4">공급사 정보</h3>
            {supplier && (
              <div className="space-y-2.5">
                {[
                  { label: '회사명', value: supplier.company },
                  { label: '담당자', value: supplier.name },
                  { label: '이메일', value: supplier.email },
                  { label: '전화', value: supplier.phone },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">{item.label}</div>
                    <div className={`text-[13px] font-medium ${item.label === '이메일' ? 'text-sky-600' : 'text-slate-700'}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 발주 품목 */}
        {rfq && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              <h3 className="text-[13px] font-semibold text-slate-700">발주 품목</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['품번', '품목 설명', '수량', '단위', '단가', '소계'].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rfq.items.map((item) => {
                  const quote = item.supplierQuotes.find((q) => q.supplierId === po.supplierId)
                  const unitPrice = quote?.unitPrice ?? item.costPrice ?? 0
                  return (
                    <tr key={item.id}>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-sky-600">{item.partNo}</td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-700">{item.description}</td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-700">{item.quantity}</td>
                      <td className="px-5 py-3.5 text-[12.5px] text-slate-500">{item.unit}</td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-700">{formatCurrency(unitPrice)}</td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">{formatCurrency(unitPrice * item.quantity)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={5} className="px-5 py-3 text-right text-[13px] font-semibold text-slate-600">발주 합계</td>
                  <td className="px-5 py-3 text-[14px] font-bold text-slate-900">{formatCurrency(po.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {relatedEmails.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-slate-700">이메일 이력</h3>
            {relatedEmails.map((email) => (
              <div key={email.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-semibold text-slate-800">{email.subject}</span>
                  <span className="text-[12px] text-slate-400">{formatDate(email.sentAt)}</span>
                </div>
                <div className="text-[12.5px] text-slate-500">{email.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
