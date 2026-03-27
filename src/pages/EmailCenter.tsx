import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useStore } from '@/store/useStore'
import { formatDateTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ArrowDownLeft, ArrowUpRight, Paperclip } from 'lucide-react'

export function EmailCenter() {
  const emails = useStore((s) => s.emails)
  const sentEmails = useStore((s) => s.sentEmails)
  const [tab, setTab] = useState<'received' | 'sent'>('received')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="이메일 센터" subtitle={`수신 ${emails.length}건 · 발신 ${sentEmails.length}건`} />
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTab('received')}
            className={cn(tab === 'received' ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:bg-slate-50')}
          >
            수신 메일 {emails.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTab('sent')}
            className={cn(tab === 'sent' ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:bg-slate-50')}
          >
            발신 메일 {sentEmails.length}
          </Button>
        </div>

        <div className="px-10 py-8">
          {tab === 'received' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['UID', '제목', '보낸이', '수신일시', '첨부'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[12.5px] font-semibold text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...emails]
                    .sort((a, b) => new Date(b.received_date).getTime() - new Date(a.received_date).getTime())
                    .map((email, i) => (
                    <tr key={email.uid} className={`hover:bg-sky-50/30 transition-colors ${i !== emails.length - 1 ? 'border-b border-slate-50' : ''}`}>
                      <td className="px-5 py-3.5 text-[13px] text-slate-400 font-mono">{email.uid}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-[14px] font-semibold text-slate-800">{email.subject}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px] text-slate-600">{email.sender}</td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-400">{formatDateTime(email.received_date)}</td>
                      <td className="px-5 py-3.5">
                        {email.has_attachments ? (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span className="text-[12px]">{email.attachments?.length ?? 0}</span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'sent' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['문서번호', '제목', '받는이', '발송일시', '첨부'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[12.5px] font-semibold text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...sentEmails]
                    .sort((a, b) => new Date(b.sent_date).getTime() - new Date(a.sent_date).getTime())
                    .map((email, i) => (
                    <tr key={email.mail_id} className={`hover:bg-sky-50/30 transition-colors ${i !== sentEmails.length - 1 ? 'border-b border-slate-50' : ''}`}>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] font-semibold text-sky-600">{email.doc_number}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-[14px] font-medium text-slate-800">{email.subject}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px] text-slate-600">{email.receiver}</td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-400">{formatDateTime(email.sent_date)}</td>
                      <td className="px-5 py-3.5">
                        {email.has_attachments ? (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span className="text-[12px]">{email.attachments?.length ?? 0}</span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
