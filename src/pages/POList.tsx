import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatDate, formatForeign } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useState } from 'react'
import type { ShippingStatus } from '@/types'

const shippingStatusConfig: Record<ShippingStatus, { label: string; variant: 'info' | 'indigo' | 'warning' | 'orange' | 'purple' | 'success' | 'emerald' }> = {
  po_sent:        { label: '발주발송', variant: 'info' },
  po_confirmed:   { label: '발주확인', variant: 'indigo' },
  in_production:  { label: '제작중', variant: 'warning' },
  shipped:        { label: '선적완료', variant: 'orange' },
  in_transit:     { label: '운송중', variant: 'purple' },
  arrived:        { label: '입고완료', variant: 'success' },
  delivered:      { label: '납품완료', variant: 'emerald' },
}

export function POList() {
  const navigate = useNavigate()
  const purchaseOrders = useStore((s) => s.purchaseOrders)
  const [search, setSearch] = useState('')

  const filtered = purchaseOrders.filter((po) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      po.poNo.toLowerCase().includes(q) ||
      po.docNumber.toLowerCase().includes(q) ||
      po.customerName.toLowerCase().includes(q) ||
      po.supplierName.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="발주 관리"
        subtitle={`총 ${purchaseOrders.length}건`}
        actions={
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-slate-400" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="발주번호, 문서번호, 매출처, 매입처 검색..."
              className="pl-10 pr-4 py-2.5 text-[13.5px] border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300 w-72 transition-all"
            />
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['발주번호', '연결견적', '매출처', '매입처', '발주금액(KRW)', '발주금액(F)', '통화', '발주일', 'Shipping Status', '납기예정', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((po) => {
                const sc = shippingStatusConfig[po.shippingStatus]
                return (
                  <tr
                    key={po.id}
                    onClick={() => navigate(`/po/${po.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-semibold text-sky-600">{po.poNo}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] text-slate-500">{po.docNumber}</td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-slate-700">{po.customerName}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600">{po.supplierName}</td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-slate-700">
                      {po.totalAmountKrw > 0 ? po.totalAmountKrw.toLocaleString('ko-KR') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">
                      {po.totalAmountForeign > 0 ? formatForeign(po.totalAmountForeign) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] text-slate-500">{po.currency}</td>
                    <td className="px-5 py-3.5 text-[12.5px] text-slate-400">{formatDate(po.issuedAt)}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] text-slate-400">
                      {po.expectedDelivery ? formatDate(po.expectedDelivery) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-slate-300 group-hover:text-sky-500 transition-colors font-medium">보기 &rarr;</span>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-5 py-12 text-center text-[13px] text-slate-400">발주 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
