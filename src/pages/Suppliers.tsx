import { Header } from '@/components/layout/Header'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export function Suppliers() {
  const suppliers = useStore((s) => s.suppliers)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="매입처 관리"
        subtitle={`${suppliers.length}개 매입처`}
        actions={
          <Button variant="primary" icon={<Plus className="w-[16px] h-[16px]" strokeWidth={2} />}>
            매입처 추가
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto px-10 py-8">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['코드', '상호', '사업자번호', '담당자', '이메일', '전화', '장비정보', '지불방법', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12.5px] font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, i) => (
                <tr key={s.id} className={`hover:bg-sky-50/30 cursor-pointer transition-colors group ${i !== suppliers.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-sky-600">{s.code}</td>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-slate-800">{s.name}</td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-500 font-mono">{s.business_number || '—'}</td>
                  <td className="px-5 py-3.5 text-[14px] text-slate-600">{s.contact_person}</td>
                  <td className="px-5 py-3.5 text-[14px] text-sky-600 font-medium">{s.email}</td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{s.phone}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12.5px] text-slate-500 line-clamp-1">{s.equipment_info || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[12px] font-semibold">{s.payment_method || '—'}</span>
                  </td>
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
