import { useState } from 'react'
import type { RFQ } from '@/types'
import { suppliers } from '@/data/mock'
import { formatCurrency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { X, Package, CheckCircle } from 'lucide-react'

interface Props {
  rfq: RFQ
  onClose: () => void
  onConfirm: (supplierId: string) => void
}

export function POCreateModal({ rfq, onClose, onConfirm }: Props) {
  // 후보 공급사: 선택된 공급사가 있는 품목의 공급사들
  const candidateIds = [...new Set(rfq.items.flatMap((i) => i.supplierQuotes.map((q) => q.supplierId)))]
  const candidateSuppliers = suppliers.filter((s) => candidateIds.includes(s.id))

  // 기본값: 가장 많이 선택된 공급사
  const defaultSupplier = rfq.items
    .map((i) => i.selectedSupplierId)
    .filter(Boolean)
    .reduce<Record<string, number>>((acc, id) => {
      acc[id!] = (acc[id!] ?? 0) + 1
      return acc
    }, {})
  const defaultId = Object.entries(defaultSupplier).sort((a, b) => b[1] - a[1])[0]?.[0] ?? candidateIds[0] ?? ''

  const [selectedId, setSelectedId] = useState(defaultId)
  const selectedSupplier = suppliers.find((s) => s.id === selectedId)

  // 선택된 공급사에 해당하는 품목만
  const poItems = rfq.items.filter((i) => i.selectedSupplierId === selectedId || i.supplierQuotes.some((q) => q.supplierId === selectedId))
  const poTotal = poItems.reduce((sum, item) => {
    const quote = item.supplierQuotes.find((q) => q.supplierId === selectedId)
    return sum + (quote?.unitPrice ?? item.costPrice ?? 0) * item.quantity
  }, 0)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800">발주서 작성</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">{rfq.rfqNo} · {rfq.customerName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-7 h-7 !p-0">
            <X className="w-4 h-4 text-slate-400" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 공급사 선택 */}
          <div>
            <div className="text-[12px] font-semibold text-slate-600 mb-2 uppercase tracking-wide">발주 공급사 선택</div>
            <div className="flex gap-2 flex-wrap">
              {candidateSuppliers.length === 0 ? (
                <div className="text-[13px] text-slate-400 py-2">업체 견적이 등록된 공급사가 없습니다.</div>
              ) : (
                candidateSuppliers.map((s) => {
                  const itemCount = rfq.items.filter((i) => i.selectedSupplierId === s.id).length
                  return (
                    <Button
                      key={s.id}
                      variant="secondary"
                      onClick={() => setSelectedId(s.id)}
                      className={cn(
                        'flex flex-col items-start !px-4 !py-3 !rounded-xl border-2 text-left',
                        selectedId === s.id
                          ? 'border-sky-400 bg-sky-50'
                          : 'border-slate-200 hover:border-slate-300',
                      )}
                    >
                      <span className="text-[13px] font-semibold text-slate-800">{s.company}</span>
                      <span className="text-[11.5px] text-slate-400">{s.country}</span>
                      {itemCount > 0 && (
                        <span className="text-[11px] text-sky-600 font-medium mt-1">추천 {itemCount}품목</span>
                      )}
                    </Button>
                  )
                })
              )}
            </div>
          </div>

          {/* 발주 품목 테이블 */}
          {selectedId && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                <span className="text-[13px] font-semibold text-slate-700">
                  {selectedSupplier?.company} 발주 품목
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['품번', '설명', '수량', '단위', '단가', '소계'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {poItems.map((item) => {
                    const quote = item.supplierQuotes.find((q) => q.supplierId === selectedId)
                    const unitPrice = quote?.unitPrice ?? item.costPrice ?? 0
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-[12.5px] font-medium text-sky-600">{item.partNo}</td>
                        <td className="px-4 py-3 text-[12.5px] text-slate-700">{item.description}</td>
                        <td className="px-4 py-3 text-[13px] font-medium text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-500">{item.unit}</td>
                        <td className="px-4 py-3 text-[12.5px] text-slate-700">{formatCurrency(unitPrice)}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-slate-800">{formatCurrency(unitPrice * item.quantity)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-right text-[12.5px] font-semibold text-slate-600">발주 합계</td>
                    <td className="px-4 py-3 text-[14px] font-bold text-slate-900">{formatCurrency(poTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
            확인 시 PO 번호가 자동 생성되고 상태가 <span className="font-semibold text-teal-600">발주완료</span>로 변경됩니다
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>취소</Button>
            <Button
              variant="primary"
              onClick={() => selectedId && onConfirm(selectedId)}
              disabled={!selectedId}
              icon={<Package className="w-3.5 h-3.5" />}
            >
              발주서 생성 및 발송
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
