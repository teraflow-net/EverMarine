import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { useStore } from '@/store/useStore'
import { formatDate, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from 'lucide-react'

export function EmailCenter() {
  const navigate = useNavigate()
  const emailLogs = useStore((s) => s.emailLogs)
  const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound'>('all')

  const filtered = emailLogs.filter((e) => filter === 'all' || e.direction === filter)
  const sorted = [...filtered].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="이메일 센터" subtitle={`총 ${emailLogs.length}건`} />
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-2">
          {(['all', 'inbound', 'outbound'] as const).map((f) => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(f)}
              className={cn(
                filter === f ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:bg-slate-50',
              )}
            >
              {f === 'all' ? `전체 ${emailLogs.length}` : f === 'inbound' ? `수신 ${emailLogs.filter((e) => e.direction === 'inbound').length}` : `발신 ${emailLogs.filter((e) => e.direction === 'outbound').length}`}
            </Button>
          ))}
        </div>

        <div className="p-6 space-y-2.5">
          {sorted.map((email) => (
            <div key={email.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  email.direction === 'inbound' ? 'bg-blue-50' : 'bg-emerald-50',
                )}>
                  {email.direction === 'inbound'
                    ? <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                    : <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-slate-800">{email.subject}</span>
                      {email.rfqId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/rfq/${email.rfqId}`)}
                          icon={<ExternalLink className="w-3 h-3" />}
                        >
                          RFQ
                        </Button>
                      )}
                      {email.poId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/po/${email.poId}`)}
                          icon={<ExternalLink className="w-3 h-3" />}
                        >
                          PO
                        </Button>
                      )}
                    </div>
                    <span className="text-[12px] text-slate-400 shrink-0 ml-4">{formatDate(email.sentAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('text-[11.5px] font-medium', email.partyType === 'customer' ? 'text-blue-500' : 'text-orange-500')}>
                      {email.partyType === 'customer' ? '고객사' : '공급사'}
                    </span>
                    <span className="text-[11.5px] text-slate-500">{email.partyName}</span>
                  </div>
                  <div className="text-[12.5px] text-slate-400 line-clamp-2">{email.body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
