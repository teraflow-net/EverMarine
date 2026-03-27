import type { RFQ } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { X, Send, CheckCircle } from 'lucide-react'

interface Props {
  rfq: RFQ
  onClose: () => void
  onConfirm: () => void
}

export function CustomerQuoteModal({ rfq, onClose, onConfirm }: Props) {
  const total = rfq.items.reduce((sum, item) => sum + (item.salePrice ?? 0) * item.quantity, 0)

  const emailBody = `Dear Customer,

Thank you for your inquiry. Please find our best quotation for your reference.

Quotation No.: QT-${rfq.rfqNo.replace('RFQ-', '')}
Reference RFQ: ${rfq.rfqNo}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Valid Until: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${rfq.items.map((item, i) =>
  `  ${i + 1}. ${item.partNo} — ${item.description}
     Qty: ${item.quantity} ${item.unit}  |  Unit Price: ${item.salePrice ? formatCurrency(item.salePrice) : 'TBD'}  |  Amount: ${item.salePrice ? formatCurrency(item.salePrice * item.quantity) : 'TBD'}`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Amount:  ${formatCurrency(total)} USD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Terms & Conditions:
- Payment: T/T 30 days after invoice
- Delivery: As per individual item lead times
- Validity: 14 days from the date of this quotation

Please do not hesitate to contact us if you need any further information.

Best regards,
TradeFlow Sales Team`

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800">고객 견적 발송</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">{rfq.rfqNo} · {rfq.customerName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-7 h-7 !p-0">
            <X className="w-4 h-4 text-slate-400" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* 금액 요약 */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">총 견적금액</div>
              <div className="text-[16px] font-bold text-slate-900">{formatCurrency(total)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">품목수</div>
              <div className="text-[16px] font-bold text-slate-900">{rfq.items.length}개</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200">
              <div className="text-[11px] text-emerald-600 uppercase tracking-wide font-medium mb-1">평균 마진율</div>
              <div className="text-[16px] font-bold text-emerald-700">
                {rfq.items.filter((i) => i.margin).length > 0
                  ? (rfq.items.reduce((s, i) => s + (i.margin ?? 0), 0) / rfq.items.filter((i) => i.margin).length).toFixed(1)
                  : '—'}%
              </div>
            </div>
          </div>

          {/* 이메일 미리보기 */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[12px] text-slate-400 font-medium">이메일 미리보기</div>
              <div className="text-[12px] text-slate-500">
                수신: <span className="font-medium text-sky-600">{rfq.customerName}</span>
              </div>
            </div>
            <div className="text-[13px] font-semibold text-slate-800 mb-3">
              제목: [Quotation] {rfq.rfqNo} — Spare Parts Quotation
            </div>
            <pre className="text-[12px] text-slate-600 whitespace-pre-wrap leading-relaxed font-sans">
              {emailBody}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            발송 후 상태가 <span className="font-semibold text-purple-600">견적제출완료</span>로 변경됩니다
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>취소</Button>
            <Button
              variant="success"
              onClick={onConfirm}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              견적 발송
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
