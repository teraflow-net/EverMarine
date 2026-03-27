import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { QuoteStatusBadges } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatDate, formatForeign } from '@/lib/utils'
import type { Quote } from '@/types'
import type { ParsedItem } from '@/lib/pdfParser'
import { UploadModal } from '@/components/rfq/UploadModal'
import { Button } from '@/components/ui/Button'
import { Plus, Upload, Search, SlidersHorizontal } from 'lucide-react'

type FilterTab = 'all' | 'quote' | 'order' | 'spec' | 'tax' | 'payment'

const statusFilters: { label: string; value: FilterTab }[] = [
  { label: '전체', value: 'all' },
  { label: '견적', value: 'quote' },
  { label: '수주', value: 'order' },
  { label: '명세', value: 'spec' },
  { label: '세금', value: 'tax' },
  { label: '입금', value: 'payment' },
]

function matchFilter(q: Quote, filter: FilterTab): boolean {
  switch (filter) {
    case 'all': return true
    case 'quote': return q.is_quote
    case 'order': return q.is_order
    case 'spec': return q.is_specification
    case 'tax': return q.is_tax
    case 'payment': return q.is_payment
  }
}

export function RFQList() {
  const navigate = useNavigate()
  const quotes = useStore((s) => s.quotes)

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  const handleUploadConfirm = (_items: ParsedItem[], _fileName: string) => {
    setShowUpload(false)
  }

  const filtered = quotes.filter((q) => {
    const matchStatus = matchFilter(q, activeFilter)
    const matchSearch =
      !search ||
      q.doc_number.toLowerCase().includes(search.toLowerCase()) ||
      q.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      q.vessel_name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="견적 관리"
        subtitle={`총 ${quotes.length}건`}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowUpload(true)}
              icon={<Upload className="w-[16px] h-[16px]" strokeWidth={2} />}
            >
              견적파일 업로드
            </Button>
            <Button
              variant="primary"
              icon={<Plus className="w-[16px] h-[16px]" strokeWidth={2} />}
            >
              새 견적
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {/* Filters */}
        <div className="bg-white border-b border-slate-200/80 px-10 py-5 flex items-center gap-5">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {statusFilters.map((f) => (
              <Button
                key={f.value}
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter(f.value)}
                className={`whitespace-nowrap ${
                  activeFilter === f.value
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {f.label}
                {f.value === 'all' && (
                  <span className="ml-2 text-[12px] text-slate-400">{quotes.length}</span>
                )}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-slate-400" strokeWidth={2} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="문서번호, 매출처, 선명 검색..."
                className="pl-10 pr-4 py-2.5 text-[13.5px] border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300 w-64 transition-all"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<SlidersHorizontal className="w-[16px] h-[16px]" strokeWidth={2} />}
            >
              필터
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="px-10 py-8">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['문서번호', '매출처명', '선명', 'REF NO', '총금액(₩)', '총금액(F)', '통화', '상태', '작성일', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[12.5px] font-semibold text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => (
                  <tr
                    key={q.id}
                    onClick={() => navigate(`/rfq/${q.id}`)}
                    className={`hover:bg-sky-50/30 cursor-pointer transition-colors group ${i !== filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-[14px] font-semibold text-sky-600">{q.doc_number}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[14px] font-medium text-slate-800">{q.customer_name}</td>
                    <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{q.vessel_name}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-400">{q.ref_no}</td>
                    <td className="px-5 py-3.5 text-[14px] font-medium text-slate-700">
                      {q.total_amount_krw > 0 ? q.total_amount_krw.toLocaleString('ko-KR') : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-[14px] font-semibold text-slate-700">
                      {q.total_amount_foreign > 0 ? formatForeign(q.total_amount_foreign) : <span className="text-slate-300 font-normal">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-500">{q.currency}</td>
                    <td className="px-5 py-3.5"><QuoteStatusBadges quote={q} /></td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-400">{formatDate(q.created_date)}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] text-slate-300 group-hover:text-sky-500 transition-colors font-semibold">보기 →</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-7 py-20 text-center text-[14px] text-slate-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onConfirm={handleUploadConfirm}
        />
      )}
    </div>
  )
}
