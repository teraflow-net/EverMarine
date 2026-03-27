import { useState } from 'react'
import { suppliers } from '@/data/mock'
import type { RFQ } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { X, Send, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  rfq: RFQ
  onClose: () => void
  onConfirm: (selectedSupplierIds: string[]) => void
}

export function SupplierRequestModal({ rfq, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<string[]>(suppliers.map((s) => s.id))
  const [previewId, setPreviewId] = useState<string | null>(suppliers[0]?.id ?? null)

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])

  const previewSupplier = suppliers.find((s) => s.id === previewId)

  const emailBody = (supplierName: string) =>
`Dear ${supplierName},

We would like to request your best quotation for the following items.

RFQ No.: ${rfq.rfqNo}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Items Required:
${rfq.items.map((item, i) =>
  `  ${i + 1}. Part No: ${item.partNo}
     Description: ${item.description}
     Quantity: ${item.quantity} ${item.unit}${item.remarks ? `\n     Remarks: ${item.remarks}` : ''}`
).join('\n')}

Please include:
- Unit price (USD)
- Lead time (days)
- Validity of quotation

We look forward to your prompt response.

Best regards,
TradeFlow Purchasing Team`

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800">업체 견적 요청</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">{rfq.rfqNo} · {rfq.items.length}개 품목</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-7 h-7 !p-0">
            <X className="w-4 h-4 text-slate-400" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: supplier list */}
          <div className="w-64 border-r border-slate-100 flex flex-col overflow-hidden shrink-0">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-[11.5px] font-semibold text-slate-500 uppercase tracking-wide">공급사 선택</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{selected.length}개 선택됨</div>
            </div>
            <div className="overflow-y-auto flex-1">
              {suppliers.map((s) => {
                const isSelected = selected.includes(s.id)
                const isPreview = previewId === s.id
                return (
                  <div
                    key={s.id}
                    onClick={() => setPreviewId(s.id)}
                    className={cn(
                      'px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors',
                      isPreview ? 'bg-sky-50' : 'hover:bg-slate-50',
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); toggle(s.id) }}
                        className="mt-0.5 !p-0 shrink-0"
                      >
                        {isSelected
                          ? <CheckSquare className="w-4 h-4 text-sky-600" />
                          : <Square className="w-4 h-4 text-slate-300" />
                        }
                      </Button>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-slate-800 truncate">{s.company}</div>
                        <div className="text-[11.5px] text-slate-400">{s.country}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.specialties.slice(0, 2).map((sp) => (
                            <span key={sp} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">{sp}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: email preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <div className="text-[11.5px] font-semibold text-slate-500 uppercase tracking-wide mb-2">이메일 미리보기</div>
              {previewSupplier && (
                <div className="flex items-center gap-4 text-[12.5px]">
                  <span className="text-slate-500">수신: <span className="font-medium text-slate-700">{previewSupplier.email}</span></span>
                  <span className="text-slate-500">담당: <span className="font-medium text-slate-700">{previewSupplier.name}</span></span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewId(previewId === null ? suppliers[0]?.id ?? null : null)}
                    className="ml-auto"
                  >
                    {previewId ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {previewSupplier ? (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="text-[12px] text-slate-400 mb-1">제목</div>
                  <div className="text-[13px] font-semibold text-slate-800 mb-4">
                    [RFQ Request] {rfq.items.map((i) => i.partNo).join(', ')} — {rfq.rfqNo}
                  </div>
                  <div className="text-[12px] text-slate-400 mb-1">본문</div>
                  <pre className="text-[12.5px] text-slate-600 whitespace-pre-wrap leading-relaxed font-sans">
                    {emailBody(previewSupplier.name)}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-[13px] text-slate-400 py-8">공급사를 선택하면 이메일 미리보기가 표시됩니다</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <span className="text-[12.5px] text-slate-500">
            {selected.length}개 공급사에게 견적 요청 발송
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>취소</Button>
            <Button
              variant="primary"
              onClick={() => onConfirm(selected)}
              disabled={selected.length === 0}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              {selected.length}개 업체에 발송
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
