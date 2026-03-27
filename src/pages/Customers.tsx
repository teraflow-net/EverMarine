import { Header } from '@/components/layout/Header'
import { customers } from '@/data/mock'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Plus, Globe } from 'lucide-react'

export function Customers() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="고객사 관리"
        subtitle={`${customers.length}개 고객사`}
        actions={
          <Button variant="primary" icon={<Plus className="w-[16px] h-[16px]" strokeWidth={2} />}>
            고객사 추가
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto px-10 py-8">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['회사명', '담당자', '이메일', '전화', '국가', '등록일', ''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[12.5px] font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.id} className={`hover:bg-sky-50/30 cursor-pointer transition-colors group ${i !== customers.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-slate-800">{c.company}</td>
                  <td className="px-5 py-3.5 text-[14px] text-slate-600">{c.name}</td>
                  <td className="px-5 py-3.5 text-[14px] text-sky-600 font-medium">{c.email}</td>
                  <td className="px-5 py-3.5 text-[13.5px] text-slate-500">{c.phone}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-300" strokeWidth={1.8} />
                      <span className="text-[13.5px] text-slate-600">{c.country}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-400">{formatDate(c.createdAt)}</td>
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
