import { Header } from '@/components/layout/Header'
import { RFQStatusBadge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FileText, ShoppingCart, TrendingUp, Clock, ArrowUpRight } from 'lucide-react'

export function Dashboard() {
  const navigate = useNavigate()
  const rfqs = useStore((s) => s.rfqs)
  const purchaseOrders = useStore((s) => s.purchaseOrders)

  const kpis = [
    {
      label: '진행중 견적',
      value: rfqs.filter((r) => !['closed', 'delivered'].includes(r.status)).length,
      unit: '건',
      icon: FileText,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      change: `+${rfqs.filter((r) => r.status === 'received').length} 신규`,
      changeColor: 'text-sky-600',
    },
    {
      label: '처리 대기',
      value: rfqs.filter((r) => ['received', 'supplier_replied', 'po_received'].includes(r.status)).length,
      unit: '건',
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      change: '즉시 처리 필요',
      changeColor: 'text-orange-500',
    },
    {
      label: '이달 발주',
      value: purchaseOrders.length,
      unit: '건',
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      change: formatCurrency(purchaseOrders.reduce((s, p) => s + p.totalAmount, 0)),
      changeColor: 'text-slate-500',
    },
    {
      label: '이달 매출 (견적)',
      value: formatCurrency(rfqs.filter((r) => r.totalSaleAmount).reduce((s, r) => s + (r.totalSaleAmount ?? 0), 0)),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      change: '평균 마진 35.2%',
      changeColor: 'text-emerald-600',
    },
  ]

  const recentRFQs = [...rfqs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="대시보드" subtitle="TradeFlow 업무 현황" />
      <div className="flex-1 overflow-y-auto px-10 py-9">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-7 mb-10">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl px-8 py-9">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} strokeWidth={1.8} />
                  </div>
                </div>
                <div className="text-[30px] font-bold text-slate-900 tracking-[-0.02em] leading-none mb-3">
                  {kpi.value}
                  {kpi.unit && <span className="text-[16px] font-medium text-slate-400 ml-1.5">{kpi.unit}</span>}
                </div>
                <div className="text-[14px] text-slate-500 font-medium mb-3">{kpi.label}</div>
                <div className={`text-[13px] font-semibold ${kpi.changeColor}`}>{kpi.change}</div>
              </div>
            )
          })}
        </div>

        {/* Recent RFQs */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
            <h2 className="text-[15px] font-semibold text-slate-800 tracking-[-0.01em]">최근 견적 현황</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/rfq')}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              전체보기
            </Button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['견적번호', '고객사', '아이템수', '견적금액', '상태', '최종업데이트'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentRFQs.map((rfq, i) => (
                <tr
                  key={rfq.id}
                  onClick={() => navigate(`/rfq/${rfq.id}`)}
                  className={`hover:bg-sky-50/30 cursor-pointer transition-colors ${i !== recentRFQs.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-[14px] font-semibold text-sky-600">{rfq.rfqNo}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[14px] text-slate-700 font-medium">{rfq.customerName}</td>
                  <td className="px-5 py-3.5 text-[14px] text-slate-500">{rfq.items.length} 품목</td>
                  <td className="px-5 py-3.5 text-[14px] text-slate-700 font-medium">
                    {rfq.totalSaleAmount ? formatCurrency(rfq.totalSaleAmount) : '—'}
                  </td>
                  <td className="px-5 py-3.5"><RFQStatusBadge status={rfq.status} /></td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-400">{formatDate(rfq.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
