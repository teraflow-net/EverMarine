import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'

export function Settings() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="설정" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-4">
          {/* Margin defaults */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-slate-800 mb-4">기본 마진율 설정</h3>
            <div className="space-y-3">
              {[
                { label: 'Engine Parts', value: '35' },
                { label: 'Pumps & Valves', value: '38' },
                { label: 'Navigation & Electrical', value: '40' },
                { label: 'Safety Equipment', value: '32' },
                { label: 'Deck Equipment', value: '35' },
                { label: 'General', value: '30' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[13px] text-slate-600">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      defaultValue={item.value}
                      className="w-16 px-2 py-1 text-[13px] text-center border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-300"
                    />
                    <span className="text-[13px] text-slate-400">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary">
                저장
              </Button>
            </div>
          </div>

          {/* Email settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-slate-800 mb-4">이메일 연동</h3>
            <div className="space-y-3">
              {[
                { label: '발신 이메일', value: 'quotes@tradeflow.com' },
                { label: 'SMTP 서버', value: 'smtp.gmail.com' },
                { label: 'IMAP 서버', value: 'imap.gmail.com' },
              ].map(item => (
                <div key={item.label}>
                  <label className="text-[11.5px] font-medium text-slate-500 uppercase tracking-wide">{item.label}</label>
                  <input
                    defaultValue={item.value}
                    className="mt-1 w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
