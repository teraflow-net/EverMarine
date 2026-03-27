import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { RFQStatusBadge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { suppliers } from '@/data/mock'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { SupplierRequestModal } from '@/components/rfq/SupplierRequestModal'
import { CustomerQuoteModal } from '@/components/rfq/CustomerQuoteModal'
import { POCreateModal } from '@/components/rfq/POCreateModal'
import type { PurchaseOrder } from '@/types'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft, Paperclip, Send, CheckCircle,
  Mail, Star,
} from 'lucide-react'

const tabs = ['고객 요청', '업체 견적', '견적 제출', '이메일 로그']

type ModalType = 'supplier' | 'customer' | 'po' | null

export function RFQDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const rfqs = useStore((s) => s.rfqs)
  const emailLogs = useStore((s) => s.emailLogs)
  const purchaseOrders = useStore((s) => s.purchaseOrders)
  const updateRFQStatus = useStore((s) => s.updateRFQStatus)
  const updateRFQ = useStore((s) => s.updateRFQ)
  const addEmailLog = useStore((s) => s.addEmailLog)
  const addPO = useStore((s) => s.addPO)

  const [activeTab, setActiveTab] = useState(0)
  const [modal, setModal] = useState<ModalType>(null)

  const rfq = rfqs.find((r) => r.id === id)
  if (!rfq) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
        <p className="text-[14px]">견적을 찾을 수 없습니다.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/rfq')}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const relatedEmails = emailLogs.filter((e) => e.rfqId === rfq.id)
  const relatedPO = purchaseOrders.find((p) => p.rfqId === rfq.id)

  // 액션 가능 상태
  const canRequestSupplier = rfq.status === 'received'
  const canSubmitCustomer = rfq.status === 'supplier_replied'
  const canCreatePO = rfq.status === 'po_received'

  // 업체 견적 요청 확인
  const handleSupplierRequest = (selectedIds: string[]) => {
    selectedIds.forEach((sid) => {
      const supplier = suppliers.find((s) => s.id === sid)
      if (!supplier) return
      addEmailLog({
        id: `email-${Date.now()}-${sid}`,
        direction: 'outbound',
        partyType: 'supplier',
        partyName: supplier.company,
        subject: `[RFQ Request] ${rfq.items.map((i) => i.partNo).join(', ')} — ${rfq.rfqNo}`,
        body: `${supplier.name}님께 ${rfq.items.length}개 품목 견적 요청이 발송되었습니다.`,
        sentAt: new Date().toISOString(),
        rfqId: rfq.id,
      })
    })
    updateRFQStatus(rfq.id, 'quoted_supplier')
    setModal(null)
    setActiveTab(3)
  }

  // 고객 견적 발송 확인
  const handleCustomerQuote = () => {
    const total = rfq.items.reduce((sum, item) => sum + (item.salePrice ?? 0) * item.quantity, 0)
    addEmailLog({
      id: `email-${Date.now()}`,
      direction: 'outbound',
      partyType: 'customer',
      partyName: rfq.customerName,
      subject: `[Quotation] ${rfq.rfqNo} — Spare Parts Quotation`,
      body: `${rfq.customerName}에게 ${rfq.items.length}개 품목, 총 ${formatCurrency(total)} 견적서가 발송되었습니다.`,
      sentAt: new Date().toISOString(),
      rfqId: rfq.id,
    })
    updateRFQ(rfq.id, { status: 'quoted_customer', totalSaleAmount: total })
    setModal(null)
    setActiveTab(3)
  }

  // 발주서 생성
  const handlePOCreate = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId)
    if (!supplier) return

    const poItems = rfq.items.filter((i) =>
      i.selectedSupplierId === supplierId || i.supplierQuotes.some((q) => q.supplierId === supplierId)
    )
    const total = poItems.reduce((sum, item) => {
      const quote = item.supplierQuotes.find((q) => q.supplierId === supplierId)
      return sum + (quote?.unitPrice ?? item.costPrice ?? 0) * item.quantity
    }, 0)

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNo: `PO-2026-${String(purchaseOrders.length + 43).padStart(4, '0')}`,
      rfqId: rfq.id,
      rfqNo: rfq.rfqNo,
      customerId: rfq.customerId,
      customerName: rfq.customerName,
      supplierId,
      supplierName: supplier.company,
      status: 'sent',
      issuedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: total,
      currency: 'USD',
    }

    addPO(newPO)
    addEmailLog({
      id: `email-${Date.now()}`,
      direction: 'outbound',
      partyType: 'supplier',
      partyName: supplier.company,
      subject: `[Purchase Order] ${newPO.poNo} — ${rfq.rfqNo}`,
      body: `${supplier.company}에 발주서 ${newPO.poNo}가 발송되었습니다. 총액: ${formatCurrency(total)}`,
      sentAt: new Date().toISOString(),
      rfqId: rfq.id,
      poId: newPO.id,
    })
    updateRFQStatus(rfq.id, 'ordered')
    setModal(null)
    setActiveTab(3)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={rfq.rfqNo}
        subtitle={rfq.customerName}
        actions={
          <div className="flex items-center gap-2">
            <RFQStatusBadge status={rfq.status} />
            {canRequestSupplier && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setModal('supplier')}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                업체 견적 요청
              </Button>
            )}
            {canSubmitCustomer && (
              <Button
                variant="success"
                size="sm"
                onClick={() => setModal('customer')}
                icon={<CheckCircle className="w-3.5 h-3.5" />}
              >
                견적 제출
              </Button>
            )}
            {canCreatePO && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setModal('po')}
                icon={<CheckCircle className="w-3.5 h-3.5" />}
              >
                발주서 작성
              </Button>
            )}
            {relatedPO && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/po/${relatedPO.id}`)}
              >
                PO 보기 →
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-5 pb-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/rfq')}
            className="mb-4"
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            목록으로
          </Button>

          {/* Info bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex items-center gap-6 flex-wrap">
            {[
              { label: '수신일', value: formatDate(rfq.receivedAt) },
              { label: '최종업데이트', value: formatDate(rfq.updatedAt) },
              { label: '총 품목', value: `${rfq.items.length}개` },
              { label: '견적금액', value: rfq.totalSaleAmount ? formatCurrency(rfq.totalSaleAmount) : '—' },
              { label: '첨부파일', value: rfq.attachments.length > 0 ? rfq.attachments[0] : '없음' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{item.label}</span>
                <span className="text-[13px] text-slate-700 font-medium flex items-center gap-1">
                  {item.label === '첨부파일' && rfq.attachments.length > 0 && <Paperclip className="w-3 h-3 text-slate-400" />}
                  {item.value}
                </span>
              </div>
            ))}
            {rfq.notes && (
              <div className="flex flex-col gap-0.5 ml-auto">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">비고</span>
                <span className="text-[12.5px] text-orange-600 font-medium">{rfq.notes}</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 gap-0">
            {tabs.map((tab, i) => (
              <Button
                key={tab}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(i)}
                className={cn(
                  'rounded-none border-b-2',
                  activeTab === i
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700',
                )}
              >
                {tab}
                {tab === '이메일 로그' && relatedEmails.length > 0 && (
                  <span className="ml-1.5 text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                    {relatedEmails.length}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* TAB 0: 고객 요청 */}
          {activeTab === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                <h3 className="text-[13px] font-semibold text-slate-700">고객 요청 품목</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['#', '품번', '품목 설명', '수량', '단위', '비고'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rfq.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-[12.5px] text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-3 text-[13px] font-medium text-sky-600">{item.partNo}</td>
                      <td className="px-5 py-3 text-[13px] text-slate-700">{item.description}</td>
                      <td className="px-5 py-3 text-[13px] text-slate-700 font-medium">{item.quantity}</td>
                      <td className="px-5 py-3 text-[12.5px] text-slate-500">{item.unit}</td>
                      <td className="px-5 py-3 text-[12.5px] text-slate-400">{item.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {canRequestSupplier && (
                <div className="px-5 py-4 border-t border-slate-100 bg-sky-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] text-sky-700">업체에 견적을 요청할 준비가 되었습니다.</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setModal('supplier')}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      업체 견적 요청
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: 업체 견적 비교 */}
          {activeTab === 1 && (
            <div className="space-y-4">
              {rfq.items.map((item, idx) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 mr-2">#{idx + 1}</span>
                      <span className="text-[13px] font-semibold text-slate-800">{item.description}</span>
                      <span className="ml-2 text-[12px] text-sky-600 font-medium">{item.partNo}</span>
                    </div>
                    <span className="text-[12.5px] text-slate-500">
                      요청수량: <span className="font-semibold text-slate-700">{item.quantity} {item.unit}</span>
                    </span>
                  </div>
                  {item.supplierQuotes.length === 0 ? (
                    <div className="px-5 py-6 text-center text-[13px] text-slate-400">
                      아직 업체 견적이 없습니다.
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['', '공급사', '단가 (USD)', '납기(일)', '소계', '선택'].map((h) => (
                            <th key={h} className="px-5 py-2.5 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {item.supplierQuotes.map((q, qi) => {
                          const isLowest = item.supplierQuotes.every((other) => q.unitPrice <= other.unitPrice)
                          const isSelected = item.selectedSupplierId === q.supplierId
                          return (
                            <tr key={qi} className={cn('hover:bg-slate-50', isSelected && 'bg-sky-50/40')}>
                              <td className="px-5 py-3">
                                {isLowest && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                              </td>
                              <td className="px-5 py-3 text-[13px] font-medium text-slate-700">{q.supplierName}</td>
                              <td className="px-5 py-3 text-[13px] font-semibold text-slate-800">{formatCurrency(q.unitPrice)}</td>
                              <td className="px-5 py-3 text-[13px] text-slate-500">{q.leadTimeDays}일</td>
                              <td className="px-5 py-3 text-[13px] font-medium text-slate-700">{formatCurrency(q.unitPrice * item.quantity)}</td>
                              <td className="px-5 py-3">
                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="w-3 h-3" /> 선택됨
                                  </span>
                                ) : (
                                  <Button variant="ghost" size="sm">선택</Button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
              {canSubmitCustomer && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center justify-between">
                  <span className="text-[12.5px] text-emerald-700">업체 견적이 모두 확인되었습니다. 고객에게 견적을 제출하세요.</span>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => { setActiveTab(2); }}
                  >
                    견적 제출 탭으로 →
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 견적 제출 */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['품번', '품목 설명', '수량', '매입단가', '판매단가', '마진율', '소계'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rfq.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-3.5 text-[13px] font-medium text-sky-600">{item.partNo}</td>
                        <td className="px-5 py-3.5 text-[13px] text-slate-700">{item.description}</td>
                        <td className="px-5 py-3.5 text-[13px] text-slate-600">{item.quantity}</td>
                        <td className="px-5 py-3.5 text-[13px] text-slate-500">
                          {item.costPrice ? formatCurrency(item.costPrice) : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          {item.salePrice != null ? (
                            <input
                              defaultValue={item.salePrice.toFixed(2)}
                              className="w-24 px-2 py-1 text-[13px] font-medium text-slate-800 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-300"
                            />
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          {item.margin != null
                            ? <span className="text-[12.5px] font-medium text-emerald-600">{item.margin.toFixed(1)}%</span>
                            : <span className="text-slate-300">—</span>
                          }
                        </td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">
                          {item.salePrice != null ? formatCurrency(item.salePrice * item.quantity) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={6} className="px-5 py-3 text-right text-[13px] font-semibold text-slate-600">합계</td>
                      <td className="px-5 py-3 text-[14px] font-bold text-slate-900">
                        {rfq.totalSaleAmount ? formatCurrency(rfq.totalSaleAmount) : '—'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {canSubmitCustomer && (
                <div className="flex justify-end">
                  <Button
                    variant="success"
                    onClick={() => setModal('customer')}
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    고객에게 견적 발송
                  </Button>
                </div>
              )}
              {rfq.status === 'quoted_customer' && (
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span className="text-[12.5px] text-purple-700 font-medium">견적이 고객에게 발송되었습니다.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 이메일 로그 */}
          {activeTab === 3 && (
            <div className="space-y-3">
              {relatedEmails.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-center text-[13px] text-slate-400">
                  이메일 이력이 없습니다.
                </div>
              ) : (
                [...relatedEmails]
                  .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                  .map((email) => (
                    <div key={email.id} className="bg-white border border-slate-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center',
                            email.direction === 'inbound' ? 'bg-blue-100' : 'bg-emerald-100',
                          )}>
                            <Mail className={cn('w-3.5 h-3.5', email.direction === 'inbound' ? 'text-blue-600' : 'text-emerald-600')} />
                          </div>
                          <span className={cn(
                            'text-[11.5px] font-semibold uppercase tracking-wide',
                            email.direction === 'inbound' ? 'text-blue-600' : 'text-emerald-600',
                          )}>
                            {email.direction === 'inbound' ? '수신' : '발신'} · {email.partyType === 'customer' ? '고객사' : '공급사'}
                          </span>
                          <span className="text-[12.5px] font-medium text-slate-600">{email.partyName}</span>
                        </div>
                        <span className="text-[12px] text-slate-400">{formatDate(email.sentAt)}</span>
                      </div>
                      <div className="text-[13px] font-semibold text-slate-800 mb-2">{email.subject}</div>
                      <div className="text-[12.5px] text-slate-500 whitespace-pre-line leading-relaxed">{email.body}</div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === 'supplier' && (
        <SupplierRequestModal rfq={rfq} onClose={() => setModal(null)} onConfirm={handleSupplierRequest} />
      )}
      {modal === 'customer' && (
        <CustomerQuoteModal rfq={rfq} onClose={() => setModal(null)} onConfirm={handleCustomerQuote} />
      )}
      {modal === 'po' && (
        <POCreateModal rfq={rfq} onClose={() => setModal(null)} onConfirm={handlePOCreate} />
      )}
    </div>
  )
}
