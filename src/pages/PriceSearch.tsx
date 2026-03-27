import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search } from 'lucide-react'


export function PriceSearch() {
  const priceSearches = useStore((s) => s.priceSearches)
  const [search, setSearch] = useState('')

  const filtered = priceSearches.filter((p) =>
    !search ||
    p.part_no.toLowerCase().includes(search.toLowerCase()) ||
    p.item_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="단가 조회"
        subtitle={`${filtered.length}건 조회`}
        actions={
          <Button variant="primary" icon={<Plus className="w-[16px] h-[16px]" strokeWidth={2} />}>
            신규 등록
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto px-10 py-8">
        {/* Search */}
        <div className="mb-5 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Part No 또는 품명으로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[14px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['날짜', 'PART NO', '품명', '매출처', '매입처', '매입단가', '매출단가', '마진(%)', '수량', '선명', 'OUR NO.', 'P.O NO'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[12.5px] font-semibold text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-sky-50/30 cursor-pointer transition-colors group ${i !== filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <td className="px-5 py-3.5 text-[13px] text-slate-500 whitespace-nowrap">{p.date}</td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-sky-600 font-mono whitespace-nowrap">{p.part_no}</td>
                    <td className="px-5 py-3.5 text-[14px] font-semibold text-slate-800 whitespace-nowrap">{p.item_name}</td>
                    <td className="px-5 py-3.5 text-[14px] text-slate-600 whitespace-nowrap">{p.customer_name}</td>
                    <td className="px-5 py-3.5 text-[14px] text-slate-600 whitespace-nowrap">{p.supplier_name}</td>
                    <td className="px-5 py-3.5 text-[13.5px] text-slate-700 font-mono text-right whitespace-nowrap">
                      {p.purchase_price.toLocaleString('ko-KR')}
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] text-slate-700 font-mono text-right whitespace-nowrap">
                      {p.sales_price.toLocaleString('ko-KR')}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <Badge variant={p.margin_percent >= 35 ? 'success' : p.margin_percent >= 30 ? 'info' : 'warning'}>
                        {p.margin_percent.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[14px] text-slate-600 text-center whitespace-nowrap">{p.quantity}</td>
                    <td className="px-5 py-3.5 text-[13.5px] text-slate-600 whitespace-nowrap">{p.vessel_name}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-500 font-mono whitespace-nowrap">{p.our_no}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-500 font-mono whitespace-nowrap">{p.po_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
