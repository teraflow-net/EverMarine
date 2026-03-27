import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { QuoteStatusBadges } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatDate, formatForeign } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useState } from 'react'

export function POList() {
  const navigate = useNavigate()
  const quotes = useStore((s) => s.quotes)
  const [search, setSearch] = useState('')

  const orders = quotes.filter((q) => q.is_order)

  const filtered = orders.filter((q) => {
    if (!search) return true
    return (
      q.doc_number.toLowerCase().includes(search.toLowerCase()) ||
      q.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      q.vessel_name.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="수주 관리"
        subtitle={`총 ${orders.length}건`}
        actions={
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-slate-400" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="문서번호, 매출처, 선명 검색..."
              className="pl-10 pr-4 py-2.5 text-[13.5px] border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300 w-64 transition-all"
            />
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['문서번호', '매출처명', '선명', 'REF NO', '총금액(₩)', '총금액(F)', '통화', '상태', '작성일', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => navigate(`/rfq/${q.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-semibold text-sky-600">{q.doc_number}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-slate-700">{q.customer_name}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-500">{q.vessel_name}</td>
                  <td className="px-5 py-3.5 text-[12.5px] text-slate-400">{q.ref_no}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-slate-700">
                    {q.total_amount_krw > 0 ? q.total_amount_krw.toLocaleString('ko-KR') : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">
                    {q.total_amount_foreign > 0 ? formatForeign(q.total_amount_foreign) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-[12.5px] text-slate-500">{q.currency}</td>
                  <td className="px-5 py-3.5"><QuoteStatusBadges quote={q} /></td>
                  <td className="px-5 py-3.5 text-[12.5px] text-slate-400">{formatDate(q.created_date)}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] text-slate-300 group-hover:text-sky-500 transition-colors font-medium">보기 →</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-[13px] text-slate-400">수주 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
