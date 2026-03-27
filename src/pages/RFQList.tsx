import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { RFQStatusBadge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { RFQStatus, RFQ } from '@/types'
import type { ParsedItem } from '@/lib/pdfParser'
import { UploadModal } from '@/components/rfq/UploadModal'
import { Button } from '@/components/ui/Button'
import { Plus, Upload, Search, SlidersHorizontal } from 'lucide-react'

const statusFilters: { label: string; value: RFQStatus | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '처리 필요', value: 'received' },
  { label: '업체견적 대기', value: 'quoted_supplier' },
  { label: '업체회신완료', value: 'supplier_replied' },
  { label: '견적제출완료', value: 'quoted_customer' },
  { label: '발주수신', value: 'po_received' },
  { label: '발주완료', value: 'ordered' },
]

export function RFQList() {
  const navigate = useNavigate()
  const rfqs = useStore((s) => s.rfqs)
  const addRFQ = useStore((s) => s.addRFQ)

  const [activeStatus, setActiveStatus] = useState<RFQStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  const handleUploadConfirm = (items: ParsedItem[], fileName: string) => {
    const newRFQ: RFQ = {
      id: `rfq-${Date.now()}`,
      rfqNo: `RFQ-2026-${String(rfqs.length + 90).padStart(4, '0')}`,
      customerId: '',
      customerName: '(고객사 미지정)',
      status: 'received',
      receivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [fileName],
      items: items.map((item) => ({
        id: item.id,
        partNo: item.partNo,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        remarks: item.remarks,
        supplierQuotes: [],
      })),
    }
    addRFQ(newRFQ)
    setShowUpload(false)
    navigate(`/rfq/${newRFQ.id}`)
  }

  const filtered = rfqs.filter((r) => {
    const matchStatus = activeStatus === 'all' || r.status === activeStatus
    const matchSearch =
      !search ||
      r.rfqNo.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="견적 관리"
        subtitle={`총 ${rfqs.length}건`}
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
                onClick={() => setActiveStatus(f.value)}
                className={`whitespace-nowrap ${
                  activeStatus === f.value
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {f.label}
                {f.value === 'all' && (
                  <span className="ml-2 text-[12px] text-slate-400">{rfqs.length}</span>
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
                placeholder="견적번호, 고객사 검색..."
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
                  {['견적번호', '고객사', '수신일', '품목수', '견적금액', '상태', '최종업데이트', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[12.5px] font-semibold text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rfq, i) => (
                  <tr
                    key={rfq.id}
                    onClick={() => navigate(`/rfq/${rfq.id}`)}
                    className={`hover:bg-sky-50/30 cursor-pointer transition-colors group ${i !== filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-semibold text-sky-600">{rfq.rfqNo}</span>
                        {rfq.attachments.length > 0 && (
                          <span className="text-[11.5px] text-slate-400 bg-slate-50 px-3 py-1 rounded-md font-medium">{rfq.attachments.length}첨부</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[14px] font-medium text-slate-800">{rfq.customerName}</td>
                    <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{formatDate(rfq.receivedAt)}</td>
                    <td className="px-5 py-3.5 text-[14px] text-slate-600">{rfq.items.length}</td>
                    <td className="px-5 py-3.5 text-[14px] font-semibold text-slate-700">
                      {rfq.totalSaleAmount ? formatCurrency(rfq.totalSaleAmount) : <span className="text-slate-300 font-normal">—</span>}
                    </td>
                    <td className="px-5 py-3.5"><RFQStatusBadge status={rfq.status} /></td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-400">{formatDate(rfq.updatedAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] text-slate-300 group-hover:text-sky-500 transition-colors font-semibold">보기 →</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-7 py-20 text-center text-[14px] text-slate-400">
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
