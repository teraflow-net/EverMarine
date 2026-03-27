import { useState, useRef, useCallback, useEffect } from 'react'
import { extractTextFromPDF, renderPDFPage, parseItemsFromText } from '@/lib/pdfParser'
import type { ParsedItem } from '@/lib/pdfParser'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
  X, Upload, FileText, CheckCircle, AlertCircle,
  ChevronRight, Loader, Trash2, Plus,
} from 'lucide-react'

type Step = 'upload' | 'preview' | 'review'

interface UploadModalProps {
  onClose: () => void
  onConfirm: (items: ParsedItem[], fileName: string) => void
}

export function UploadModal({ onClose, onConfirm }: UploadModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [rawText, setRawText] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [items, setItems] = useState<ParsedItem[]>([])
  const [showRaw, setShowRaw] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (f: File) => {
    if (!f.type.includes('pdf') && !f.name.toLowerCase().endsWith('.pdf')) {
      alert('PDF 파일만 지원합니다.')
      return
    }
    setFile(f)
    setLoading(true)
    setStep('preview')

    try {
      const [{ text, pageCount: pc }] = await Promise.all([
        extractTextFromPDF(f),
      ])
      setRawText(text)
      setPageCount(pc)

      if (canvasRef.current) {
        await renderPDFPage(f, canvasRef.current, 1)
      }

      const parsed = parseItemsFromText(text)
      setItems(parsed)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }, [])

  // Canvas render after step transition
  useEffect(() => {
    if (step === 'preview' && file && canvasRef.current && !loading) {
      renderPDFPage(file, canvasRef.current, 1).catch(console.error)
    }
  }, [step, file, loading])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }, [processFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const updateItem = (id: string, field: keyof ParsedItem, value: string | number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const addEmptyItem = () => {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      partNo: '', description: '', quantity: 1, unit: 'PCS', remarks: '', confidence: 'low',
    }])
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-[15px] font-semibold text-slate-800">견적 파일 업로드</h2>
            {/* Steps */}
            <div className="flex items-center gap-1.5 ml-4">
              {(['upload', 'preview', 'review'] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={cn(
                    'flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold transition-colors',
                    step === s ? 'bg-sky-600 text-white' :
                    (['upload', 'preview', 'review'].indexOf(step) > i) ? 'bg-sky-100 text-sky-600' :
                    'bg-slate-100 text-slate-400'
                  )}>
                    {(['upload', 'preview', 'review'].indexOf(step) > i)
                      ? <CheckCircle className="w-3 h-3" />
                      : i + 1
                    }
                  </div>
                  <span className={cn('text-[12px]', step === s ? 'text-slate-700 font-medium' : 'text-slate-400')}>
                    {['파일 선택', '미리보기', '항목 확인'][i]}
                  </span>
                  {i < 2 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                </div>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-7 h-7 !p-0">
            <X className="w-4 h-4 text-slate-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="p-8 flex flex-col items-center justify-center min-h-64">
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'w-full max-w-lg border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all',
                  isDragging
                    ? 'border-sky-400 bg-sky-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center transition-colors', isDragging ? 'bg-sky-100' : 'bg-slate-100')}>
                  <Upload className={cn('w-7 h-7', isDragging ? 'text-sky-500' : 'text-slate-400')} />
                </div>
                <div className="text-center">
                  <div className="text-[14px] font-semibold text-slate-700 mb-1">
                    PDF 파일을 드래그하거나 클릭하여 선택
                  </div>
                  <div className="text-[12.5px] text-slate-400">
                    고객으로부터 받은 견적 요청서 (PDF)를 업로드하세요
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-slate-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF · 최대 10MB</span>
                </div>
              </div>
              <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />

              {/* Sample hint */}
              <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 max-w-lg w-full">
                <div className="text-[12px] font-semibold text-amber-700 mb-1">파싱 잘 되는 PDF 형태</div>
                <div className="text-[11.5px] text-amber-600 space-y-0.5">
                  <div>• 표(테이블) 형태로 품번 / 설명 / 수량 / 단위가 정리된 문서</div>
                  <div>• 예: <code className="bg-amber-100 px-1 rounded">ME-001-FLT  Lube Oil Filter  6  PCS</code></div>
                  <div>• 스캔 이미지 PDF는 텍스트 추출이 불가합니다</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Preview */}
          {step === 'preview' && (
            <div className="flex h-full">
              {/* Left: PDF canvas */}
              <div className="flex-1 bg-slate-100 flex flex-col items-center overflow-y-auto p-4 min-h-[400px]">
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader className="w-8 h-8 animate-spin text-sky-500" />
                    <span className="text-[13px]">PDF 분석 중...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-[11.5px] text-slate-400 mb-2">{file?.name} · {pageCount}페이지</div>
                    <canvas
                      ref={canvasRef}
                      className="rounded-lg shadow-md bg-white max-w-full"
                    />
                    <div className="text-[11px] text-slate-400 mt-2">1페이지 미리보기</div>
                  </>
                )}
              </div>

              {/* Right: Raw text + parse summary */}
              <div className="w-80 border-l border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12.5px] font-semibold text-slate-700">추출 결과</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRaw(!showRaw)}
                    >
                      {showRaw ? '요약 보기' : '원문 보기'}
                    </Button>
                  </div>
                  {!loading && (
                    <div className={cn(
                      'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium',
                      items.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700',
                    )}>
                      {items.length > 0
                        ? <><CheckCircle className="w-3.5 h-3.5" /> {items.length}개 품목 파싱 완료</>
                        : <><AlertCircle className="w-3.5 h-3.5" /> 자동 파싱 실패 - 수동 입력 필요</>
                      }
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {showRaw ? (
                    <pre className="text-[10.5px] text-slate-500 whitespace-pre-wrap leading-relaxed font-mono">
                      {rawText || '텍스트 없음'}
                    </pre>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="bg-slate-50 rounded-lg p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-sky-600">{item.partNo}</span>
                            <span className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                              item.confidence === 'high' ? 'bg-emerald-100 text-emerald-600' :
                              item.confidence === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-500',
                            )}>
                              {item.confidence === 'high' ? '높음' : item.confidence === 'medium' ? '보통' : '낮음'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{item.description}</div>
                          <div className="text-[11px] text-slate-400">{item.quantity} {item.unit}</div>
                        </div>
                      ))}
                      {items.length === 0 && !loading && (
                        <div className="text-[12px] text-slate-400 text-center py-4">
                          파싱된 항목이 없습니다.<br />다음 단계에서 직접 입력하세요.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Edit */}
          {step === 'review' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-slate-800">견적 항목 확인 및 수정</div>
                  <div className="text-[12px] text-slate-400 mt-0.5">
                    파싱 결과를 검토하고 수정 후 확인하세요. 신뢰도가 낮은 항목은 직접 확인이 필요합니다.
                  </div>
                </div>
                <div className="text-[12px] text-slate-500">
                  파일: <span className="font-medium text-slate-700">{file?.name}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['#', '품번', '품목 설명', '수량', '단위', '비고', '신뢰도', ''].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item, idx) => (
                      <tr key={item.id} className={cn('group', item.confidence === 'low' && 'bg-red-50/30')}>
                        <td className="px-4 py-2.5 text-[12px] text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-2.5">
                          <input
                            value={item.partNo}
                            onChange={e => updateItem(item.id, 'partNo', e.target.value)}
                            className="w-32 px-2 py-1 text-[12.5px] font-medium text-sky-700 border border-transparent hover:border-slate-200 focus:border-sky-300 rounded-md focus:outline-none bg-transparent focus:bg-white transition-colors"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            value={item.description}
                            onChange={e => updateItem(item.id, 'description', e.target.value)}
                            className="w-56 px-2 py-1 text-[12.5px] text-slate-700 border border-transparent hover:border-slate-200 focus:border-sky-300 rounded-md focus:outline-none bg-transparent focus:bg-white transition-colors"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-[12.5px] font-medium text-slate-700 border border-transparent hover:border-slate-200 focus:border-sky-300 rounded-md focus:outline-none bg-transparent focus:bg-white text-center transition-colors"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <select
                            value={item.unit}
                            onChange={e => updateItem(item.id, 'unit', e.target.value)}
                            className="px-2 py-1 text-[12.5px] text-slate-600 border border-transparent hover:border-slate-200 focus:border-sky-300 rounded-md focus:outline-none bg-transparent focus:bg-white cursor-pointer transition-colors"
                          >
                            {['PCS', 'EA', 'SET', 'MTR', 'KGS', 'LTR', 'ROLLS', 'BOX', 'PAIR', 'DRUM', 'PKG', 'LOT'].map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            value={item.remarks}
                            onChange={e => updateItem(item.id, 'remarks', e.target.value)}
                            placeholder="비고"
                            className="w-28 px-2 py-1 text-[12px] text-slate-500 border border-transparent hover:border-slate-200 focus:border-sky-300 rounded-md focus:outline-none bg-transparent focus:bg-white transition-colors"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={cn(
                            'text-[11px] px-1.5 py-0.5 rounded-full font-medium',
                            item.confidence === 'high' ? 'bg-emerald-100 text-emerald-600' :
                            item.confidence === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-500',
                          )}>
                            {item.confidence === 'high' ? '높음' : item.confidence === 'medium' ? '보통' : '직접입력'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="w-6 h-6 !p-0 opacity-0 group-hover:opacity-100 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addEmptyItem}
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    항목 추가
                  </Button>
                </div>
              </div>

              {items.some(i => i.confidence === 'low' || !i.partNo) && (
                <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <span className="text-[12px] text-yellow-700">
                    빨간 배경 행은 파싱 신뢰도가 낮습니다. 품번과 설명을 직접 확인해주세요.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 'upload') onClose()
              else if (step === 'preview') setStep('upload')
              else if (step === 'review') setStep('preview')
            }}
          >
            {step === 'upload' ? '취소' : '이전'}
          </Button>

          <div className="flex items-center gap-2">
            {step === 'preview' && !loading && (
              <Button
                variant="primary"
                onClick={() => setStep('review')}
              >
                항목 확인하기 <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {step === 'review' && (
              <Button
                variant="success"
                onClick={() => onConfirm(items.filter(i => i.partNo), file?.name ?? '')}
                disabled={items.filter(i => i.partNo).length === 0}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                견적 요청서로 등록 ({items.filter(i => i.partNo).length}개 품목)
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
