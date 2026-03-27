import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { POStatusBadge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export function POList() {
  const navigate = useNavigate()
  const purchaseOrders = useStore((s) => s.purchaseOrders)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="발주 관리"
        subtitle={`총 ${purchaseOrders.length}건`}
        actions={
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            새 발주
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['발주번호', '연결견적', '고객사', '공급사', '발주금액', '발주일', '납기예정', '상태', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {purchaseOrders.map((po) => (
                <tr
                  key={po.id}
                  onClick={() => navigate(`/po/${po.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-medium text-sky-600">{po.poNo}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[12.5px] text-slate-400">{po.rfqNo}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-slate-700">{po.customerName}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600">{po.supplierName}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">{formatCurrency(po.totalAmount)}</td>
                  <td className="px-5 py-3.5 text-[12.5px] text-slate-400">{formatDate(po.issuedAt)}</td>
                  <td className="px-5 py-3.5 text-[12.5px] text-slate-500">
                    {po.expectedDelivery ? formatDate(po.expectedDelivery) : '—'}
                  </td>
                  <td className="px-5 py-3.5"><POStatusBadge status={po.status} /></td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] text-slate-300 group-hover:text-sky-500 transition-colors font-medium">보기 →</span>
                  </td>
                </tr>
              ))}
              {purchaseOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-[13px] text-slate-400">발주 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
