import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { formatDate, formatForeign, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Send, FileDown, ShoppingCart } from 'lucide-react'
import type { QuoteItem, Supplier, ItemSupplierQuote, PurchaseOrder, POItem } from '@/types'

const flagConfig = [
  { key: 'is_quote' as const, label: '견적' },
  { key: 'is_order' as const, label: '수주' },
  { key: 'is_specification' as const, label: '명세' },
  { key: 'is_tax' as const, label: '세금' },
  { key: 'is_payment' as const, label: '입금' },
]

/** Build supplier quote candidates for an item from requester1/2/3 fields */
function buildSupplierQuotes(
  item: QuoteItem,
  allSuppliers: Supplier[],
): ItemSupplierQuote[] {
  const codes = [item.requester1, item.requester2, item.requester3].filter(Boolean)
  return codes.map((code) => {
    const sup = allSuppliers.find((s) => s.code === code)
    const isSelected = item.supplier_code === code
    // If this is the selected supplier, show actual prices
    if (isSelected && item.purchase_price_krw > 0) {
      return {
        supplierId: sup?.id ?? 0,
        supplierCode: code,
        supplierName: sup?.name ?? code,
        status: 'selected' as const,
        purchasePriceKrw: item.purchase_price_krw,
        purchasePriceForeign: item.sales_price_foreign > 0 ? +(item.purchase_price_krw / (item.sales_price_krw / item.sales_price_foreign)).toFixed(2) : null,
        deliveryDays: item.delivery_date ? Math.ceil((new Date(item.delivery_date).getTime() - new Date().getTime()) / 86400000) : null,
        repliedAt: item.delivery_date,
        remarks: '',
      }
    }

    // Simulate replied for other requesters that are not the selected one
    // For items with process_status != '미처리', show other suppliers as replied with slightly different prices
    if (item.process_status !== '미처리') {
      const basePrice = item.purchase_price_krw
      const variance = code === item.requester2 ? 1.06 : 1.12
      return {
        supplierId: sup?.id ?? 0,
        supplierCode: code,
        supplierName: sup?.name ?? code,
        status: 'replied' as const,
        purchasePriceKrw: Math.round(basePrice * variance),
        purchasePriceForeign: item.sales_price_foreign > 0 ? +(basePrice * variance / (item.sales_price_krw / item.sales_price_foreign)).toFixed(2) : null,
        deliveryDays: code === item.requester2 ? 5 : 7,
        repliedAt: '2026-03-25',
        remarks: '',
      }
    }

    // For unprocessed items, show as pending
    return {
      supplierId: sup?.id ?? 0,
      supplierCode: code,
      supplierName: sup?.name ?? code,
      status: 'pending' as const,
      purchasePriceKrw: null,
      purchasePriceForeign: null,
      deliveryDays: null,
      repliedAt: null,
      remarks: '',
    }
  })
}

const statusStyle: Record<ItemSupplierQuote['status'], { label: string; className: string }> = {
  pending: { label: '미요청', className: 'bg-gray-100 text-gray-500' },
  requested: { label: '요청완료', className: 'bg-blue-100 text-blue-700' },
  replied: { label: '회신완료', className: 'bg-emerald-100 text-emerald-700' },
  selected: { label: '선택됨', className: 'bg-sky-100 text-sky-700' },
}

export function RFQDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const quotes = useStore((s) => s.quotes)
  const suppliers = useStore((s) => s.suppliers)
  const toggleQuoteFlag = useStore((s) => s.toggleQuoteFlag)
  const addPO = useStore((s) => s.addPO)
  const purchaseOrders = useStore((s) => s.purchaseOrders)

  const quote = quotes.find((q) => q.id === Number(id))

  // Per-item selected supplier + sale price overrides
  const [selectedSuppliers, setSelectedSuppliers] = useState<Record<number, string>>({})
  const [salePrices, setSalePrices] = useState<Record<number, number>>({})
  // Track requested suppliers per item
  const [requestedSuppliers, setRequestedSuppliers] = useState<Record<string, boolean>>({})

  if (!quote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
        <p className="text-[14px]">견적을 찾을 수 없습니다.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/rfq')}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const items = quote.items ?? []

  // Build supplier quotes for each item
  const itemSupplierQuotes = useMemo(() => {
    const map: Record<number, ItemSupplierQuote[]> = {}
    items.forEach((item) => {
      const quotes = buildSupplierQuotes(item, suppliers)
      // Apply local requested state
      map[item.id] = quotes.map((sq) => {
        const key = `${item.id}-${sq.supplierCode}`
        if (requestedSuppliers[key] && sq.status === 'pending') {
          return { ...sq, status: 'requested' as const }
        }
        // Apply local selection
        if (selectedSuppliers[item.id] === sq.supplierCode && sq.status !== 'selected') {
          return { ...sq, status: 'selected' as const }
        }
        return sq
      })
    })
    return map
  }, [items, suppliers, requestedSuppliers, selectedSuppliers])

  // Compute totals
  const totals = useMemo(() => {
    let totalPurchaseKrw = 0
    let totalSalesKrw = 0
    let totalPurchaseForeign = 0
    let totalSalesForeign = 0
    let marginSum = 0
    let marginCount = 0

    items.forEach((item) => {
      const selectedCode = selectedSuppliers[item.id] || item.supplier_code
      const sq = itemSupplierQuotes[item.id]?.find((s) => s.supplierCode === selectedCode)
      const purchaseKrw = sq?.purchasePriceKrw ?? item.purchase_price_krw
      const saleKrw = salePrices[item.id] ?? item.sales_price_krw

      if (purchaseKrw > 0) {
        totalPurchaseKrw += purchaseKrw * item.quantity
        totalPurchaseForeign += (sq?.purchasePriceForeign ?? 0) * item.quantity
      }
      if (saleKrw > 0) {
        totalSalesKrw += saleKrw * item.quantity
        totalSalesForeign += item.sales_price_foreign * item.quantity
      }
      if (purchaseKrw > 0 && saleKrw > 0) {
        marginSum += ((saleKrw - purchaseKrw) / saleKrw) * 100
        marginCount++
      }
    })

    return {
      totalPurchaseKrw,
      totalSalesKrw,
      totalPurchaseForeign,
      totalSalesForeign,
      avgMargin: marginCount > 0 ? marginSum / marginCount : 0,
    }
  }, [items, selectedSuppliers, salePrices, itemSupplierQuotes])

  function handleRequestQuote(itemId: number, supplierCode: string) {
    const key = `${itemId}-${supplierCode}`
    setRequestedSuppliers((prev) => ({ ...prev, [key]: true }))
    alert('견적 요청 이메일이 발송되었습니다.')
  }

  function handleSelectSupplier(itemId: number, supplierCode: string) {
    setSelectedSuppliers((prev) => ({ ...prev, [itemId]: supplierCode }))
  }

  function handleSendCustomerQuote() {
    if (!quote!.is_quote) {
      toggleQuoteFlag(quote!.id, 'is_quote')
    }
    alert('고객 견적서 이메일 발송 완료')
  }

  function handleCreatePO() {
    // Group items by selected supplier
    const supplierItems: Record<string, { supplier: Supplier | undefined; items: QuoteItem[] }> = {}

    items.forEach((item) => {
      const selectedCode = selectedSuppliers[item.id] || item.supplier_code
      if (!selectedCode) return
      if (!supplierItems[selectedCode]) {
        supplierItems[selectedCode] = {
          supplier: suppliers.find((s) => s.code === selectedCode),
          items: [],
        }
      }
      supplierItems[selectedCode].items.push(item)
    })

    const nextId = Math.max(...purchaseOrders.map((po) => po.id), 0) + 1
    let idx = 0

    Object.entries(supplierItems).forEach(([code, { supplier, items: poItems }]) => {
      const poItemList: POItem[] = poItems.map((item) => {
        const sq = itemSupplierQuotes[item.id]?.find((s) => s.supplierCode === code)
        return {
          quoteItemId: item.id,
          partNo: item.part_no,
          productName: item.product_name,
          quantity: item.quantity,
          unit: item.unit,
          purchasePriceKrw: sq?.purchasePriceKrw ?? item.purchase_price_krw,
          purchasePriceForeign: sq?.purchasePriceForeign ?? 0,
        }
      })

      const totalKrw = poItemList.reduce((s, i) => s + i.purchasePriceKrw * i.quantity, 0)
      const totalForeign = poItemList.reduce((s, i) => s + i.purchasePriceForeign * i.quantity, 0)

      const po: PurchaseOrder = {
        id: nextId + idx,
        poNo: `PO-2026-${String(nextId + idx).padStart(4, '0')}`,
        quoteId: quote!.id,
        docNumber: quote!.doc_number,
        customerName: quote!.customer_name,
        supplierId: supplier?.id ?? 0,
        supplierCode: code,
        supplierName: supplier?.name ?? code,
        items: poItemList,
        totalAmountKrw: totalKrw,
        totalAmountForeign: totalForeign,
        currency: quote!.currency,
        issuedAt: new Date().toISOString().split('T')[0],
        confirmedAt: null,
        shippingStatus: 'po_sent',
        expectedDelivery: null,
        actualDelivery: null,
        trackingNo: '',
        remark: '',
      }

      addPO(po)
      idx++
    })

    if (!quote!.is_order) {
      toggleQuoteFlag(quote!.id, 'is_order')
    }

    alert('공식 발주 이메일 발송 완료')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={quote.doc_number}
        subtitle={`${quote.customer_name} · ${quote.vessel_name}`}
        actions={
          <div className="flex items-center gap-2">
            {flagConfig.map((f) => {
              const isActive = quote[f.key]
              return (
                <Button
                  key={f.key}
                  variant={isActive ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => toggleQuoteFlag(quote.id, f.key)}
                >
                  {isActive ? '+ ' : ''}{f.label}
                </Button>
              )
            })}
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

          {/* Basic Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
            <div className="grid grid-cols-4 gap-x-8 gap-y-4">
              {[
                { label: '작성일', value: formatDate(quote.created_date) },
                { label: '선적일', value: quote.shipping_date ? formatDate(quote.shipping_date) : '—' },
                { label: '선명', value: quote.vessel_name },
                { label: '선사', value: quote.shipping_company },
                { label: 'MAKER', value: quote.product_brand || '—' },
                { label: 'TYPE', value: quote.product_type || '—' },
                { label: '통화', value: quote.currency },
                { label: '환율', value: quote.exchange_rate ? quote.exchange_rate.toLocaleString('ko-KR') : '—' },
                { label: 'REF NO', value: quote.ref_no || '—' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">{item.label}</div>
                  <div className="text-[13px] text-slate-700 font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Remark */}
          {quote.remark && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-4">
              <span className="text-[12.5px] text-orange-700 font-medium">{quote.remark}</span>
            </div>
          )}
        </div>

        {/* Per-item detail cards */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[14px] font-semibold text-slate-800">품목별 상세</h3>
            <span className="text-[12px] text-slate-400">({items.length}건)</span>
          </div>

          {items.map((item, idx) => {
            const supplierQuotes = itemSupplierQuotes[item.id] ?? []
            const selectedCode = selectedSuppliers[item.id] || item.supplier_code
            const selectedSq = supplierQuotes.find((sq) => sq.supplierCode === selectedCode)
            const purchaseKrw = selectedSq?.purchasePriceKrw ?? item.purchase_price_krw
            const saleKrw = salePrices[item.id] ?? item.sales_price_krw
            const margin = purchaseKrw > 0 && saleKrw > 0 ? ((saleKrw - purchaseKrw) / saleKrw) * 100 : 0
            const saleAmount = saleKrw * item.quantity

            return (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl mb-3 overflow-hidden">
                {/* Item header */}
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] font-bold text-slate-400">#{idx + 1}</span>
                    <span className="text-[13px] font-semibold text-sky-600">{item.part_no}</span>
                    <span className="text-[13px] text-slate-700">{item.product_name}</span>
                    <span className="text-[12.5px] text-slate-500">{item.quantity} {item.unit}</span>
                  </div>
                </div>

                {/* Supplier candidates table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide w-10">선택</th>
                        <th className="px-5 py-3 text-left text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">매입처명</th>
                        <th className="px-5 py-3 text-right text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">매입단가(KRW)</th>
                        <th className="px-5 py-3 text-right text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">매입단가(F)</th>
                        <th className="px-5 py-3 text-center text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">납기</th>
                        <th className="px-5 py-3 text-center text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {supplierQuotes.map((sq) => {
                        const isSelected = selectedCode === sq.supplierCode
                        return (
                          <tr
                            key={sq.supplierCode}
                            className={cn(
                              'transition-colors',
                              isSelected ? 'bg-sky-50/60' : 'hover:bg-slate-50',
                            )}
                          >
                            <td className="px-5 py-3.5">
                              {(sq.status === 'replied' || sq.status === 'selected') && (
                                <input
                                  type="radio"
                                  name={`supplier-${item.id}`}
                                  checked={isSelected}
                                  onChange={() => handleSelectSupplier(item.id, sq.supplierCode)}
                                  className="w-4 h-4 text-sky-600 cursor-pointer"
                                />
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-[13px] font-medium text-slate-700">{sq.supplierName}</td>
                            <td className="px-5 py-3.5 text-right text-[13px] text-slate-700">
                              {sq.purchasePriceKrw !== null ? sq.purchasePriceKrw.toLocaleString('ko-KR') : '—'}
                            </td>
                            <td className="px-5 py-3.5 text-right text-[13px] text-slate-700">
                              {sq.purchasePriceForeign !== null ? formatForeign(sq.purchasePriceForeign) : '—'}
                            </td>
                            <td className="px-5 py-3.5 text-center text-[13px] text-slate-600">
                              {sq.deliveryDays !== null ? `${sq.deliveryDays}일` : '—'}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              {sq.status === 'pending' ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleRequestQuote(item.id, sq.supplierCode)}
                                >
                                  견적요청
                                </Button>
                              ) : (
                                <span className={cn('inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold', statusStyle[sq.status].className)}>
                                  {statusStyle[sq.status].label}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      {supplierQuotes.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-6 text-center text-[13px] text-slate-400">
                            매입처 후보가 없습니다. requester 필드를 설정하세요.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Selection summary */}
                {purchaseKrw > 0 && (
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-6 flex-wrap">
                      <span className="text-[12.5px] text-slate-500">
                        선택: <span className="font-semibold text-slate-700">{selectedSq?.supplierName ?? item.supplier_name}</span>
                      </span>
                      <span className="text-[12.5px] text-slate-500">
                        매입 <span className="font-medium text-slate-700">{purchaseKrw.toLocaleString('ko-KR')}원</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12.5px] text-slate-500">판매</span>
                        <input
                          type="number"
                          value={saleKrw || ''}
                          onChange={(e) => setSalePrices((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                          className="w-28 px-2 py-1 text-[13px] border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300 text-right"
                          placeholder="판매단가"
                        />
                        <span className="text-[12.5px] text-slate-500">원</span>
                      </div>
                      {margin > 0 && (
                        <Badge variant="success" className="text-[11px]">마진 {margin.toFixed(1)}%</Badge>
                      )}
                      {saleAmount > 0 && (
                        <span className="text-[12.5px] text-slate-500">
                          매출금액 <span className="font-semibold text-slate-700">{saleAmount.toLocaleString('ko-KR')}원</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {items.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <p className="text-[13px] text-slate-400">등록된 품목이 없습니다.</p>
            </div>
          )}
        </div>

        {/* Totals summary */}
        {items.length > 0 && (
          <div className="px-6 pb-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-[13px] font-semibold text-slate-700 mb-3">합계 요약</h3>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">총매입(KRW)</div>
                  <div className="text-[14px] font-bold text-slate-800">{totals.totalPurchaseKrw.toLocaleString('ko-KR')}원</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">총매출(KRW)</div>
                  <div className="text-[14px] font-bold text-slate-800">{totals.totalSalesKrw.toLocaleString('ko-KR')}원</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">총매입(F)</div>
                  <div className="text-[14px] font-bold text-slate-800">{quote.currency} {formatForeign(totals.totalPurchaseForeign)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">총매출(F)</div>
                  <div className="text-[14px] font-bold text-slate-800">{quote.currency} {formatForeign(totals.totalSalesForeign)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">평균마진</div>
                  <div className={cn(
                    'text-[14px] font-bold',
                    totals.avgMargin > 30 ? 'text-emerald-600' : totals.avgMargin > 20 ? 'text-amber-600' : 'text-red-600',
                  )}>
                    {totals.avgMargin > 0 ? `${totals.avgMargin.toFixed(1)}%` : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-6 pb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={<Send className="w-4 h-4" />}
              onClick={handleSendCustomerQuote}
            >
              고객 견적서 발송
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<FileDown className="w-4 h-4" />}
              onClick={() => alert('PDF 다운로드 기능은 준비 중입니다.')}
            >
              PDF 다운로드
            </Button>
            <Button
              variant="success"
              size="lg"
              icon={<ShoppingCart className="w-4 h-4" />}
              onClick={handleCreatePO}
            >
              공식 발주 요청
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
