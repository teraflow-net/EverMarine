import { Header } from '@/components/layout/Header'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export function Parts() {
  const vessels = useStore((s) => s.vessels)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="선박 관리"
        subtitle={`${vessels.length}척 등록`}
        actions={
          <Button variant="primary" icon={<Plus className="w-[16px] h-[16px]" strokeWidth={2} />}>
            선박 추가
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto px-10 py-8">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['코드', '선명', '매출처', '선박회사', 'IMO NO', 'HULL NO', '선박구분', '엔진타입', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12.5px] font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vessels.map((v, i) => (
                <tr key={v.id} className={`hover:bg-sky-50/30 cursor-pointer transition-colors group ${i !== vessels.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-sky-600">{v.code}</td>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-slate-800">{v.vessel_name}</td>
                  <td className="px-5 py-3.5 text-[14px] text-slate-600">{v.sales_customer}</td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{v.shipping_company}</td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-500 font-mono">{v.imo_no}</td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-500 font-mono">{v.hull_no}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[12px] font-semibold">{v.vessel_type}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[12.5px] text-slate-500 line-clamp-1">{v.engine_type1}</td>
                  <td className="px-5 py-3.5">
                    <Button variant="ghost" size="sm">편집</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
