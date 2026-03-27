import { Header } from '@/components/layout/Header'
import { QuoteStatusBadge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatDate, formatForeign } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FileText, ShoppingCart, TrendingUp, Percent, ArrowUpRight } from 'lucide-react'

export function Dashboard() {
  const navigate = useNavigate()
  const quotes = useStore((s) => s.quotes)

  const thisMonthQuotes = quotes.filter((q) => q.is_quote)
  const thisMonthOrders = quotes.filter((q) => q.is_order)
  const totalSales = quotes.reduce((s, q) => s + q.total_amount_krw, 0)
  const avgMargin = quotes.filter((q) => q.margin_percent > 0).length > 0
    ? quotes.filter((q) => q.margin_percent > 0).reduce((s, q) => s + q.margin_percent, 0) / quotes.filter((q) => q.margin_percent > 0).length
    : 0

  const kpis = [
    {
      label: '이달 견적건수',
      value: thisMonthQuotes.length,
      unit: '건',
      icon: FileText,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      change: `총 ${quotes.length}건 등록`,
      changeColor: 'text-sky-600',
    },
    {
      label: '이달 수주건수',
      value: thisMonthOrders.length,
      unit: '건',
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      change: `수주율 ${quotes.length > 0 ? ((thisMonthOrders.length / quotes.length) * 100).toFixed(0) : 0}%`,
      changeColor: 'text-indigo-600',
    },
    {
      label: '총매출액(원화)',
      value: totalSales.toLocaleString('ko-KR'),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      change: '원',
      changeColor: 'text-slate-500',
    },
    {
      label: '평균마진율',
      value: `${avgMargin.toFixed(1)}%`,
      icon: Percent,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      change: '목표 30% 이상',
      changeColor: 'text-orange-500',
    },
  ]

  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
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

        {/* Recent Quotes */}
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
                {['문서번호', '매출처명', '선명', '총금액(F)', '통화', '상태', '작성일'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentQuotes.map((q, i) => (
                <tr
                  key={q.id}
                  onClick={() => navigate(`/rfq/${q.id}`)}
                  className={`hover:bg-sky-50/30 cursor-pointer transition-colors ${i !== recentQuotes.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-[14px] font-semibold text-sky-600">{q.doc_number}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[14px] text-slate-700 font-medium">{q.customer_name}</td>
                  <td className="px-5 py-3.5 text-[14px] text-slate-500">{q.vessel_name}</td>
                  <td className="px-5 py-3.5 text-[14px] text-slate-700 font-medium">
                    {q.total_amount_foreign > 0 ? formatForeign(q.total_amount_foreign) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-500">{q.currency}</td>
                  <td className="px-5 py-3.5"><QuoteStatusBadge quote={q} /></td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-400">{formatDate(q.created_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
