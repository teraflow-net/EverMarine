import { Header } from '@/components/layout/Header'
import { parts } from '@/data/mock'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export function Parts() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="품목 마스터"
        subtitle={`${parts.length}개 품목`}
        actions={
          <Button variant="primary" icon={<Plus className="w-[16px] h-[16px]" strokeWidth={2} />}>
            품목 추가
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto px-10 py-8">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['품번', '품목 설명', '카테고리', '단위', '평균 매입가', '최근 판매가', '마진율', ''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[12.5px] font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parts.map((p, i) => {
                const margin = ((p.lastSalePrice - p.avgCost) / p.lastSalePrice * 100).toFixed(1)
                return (
                  <tr key={p.id} className={`hover:bg-sky-50/30 cursor-pointer transition-colors group ${i !== parts.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <td className="px-5 py-3.5 text-[14px] font-semibold text-sky-600">{p.partNo}</td>
                    <td className="px-5 py-3.5 text-[14px] text-slate-700">{p.description}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[12px] font-semibold">{p.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{p.unit}</td>
                    <td className="px-5 py-3.5 text-[14px] text-slate-600">{formatCurrency(p.avgCost)}</td>
                    <td className="px-5 py-3.5 text-[14px] font-semibold text-slate-800">{formatCurrency(p.lastSalePrice)}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13.5px] font-semibold text-emerald-600">{margin}%</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="sm">편집</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
