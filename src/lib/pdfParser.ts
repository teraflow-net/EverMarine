import * as pdfjsLib from 'pdfjs-dist'

// Worker 경로 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export interface ParsedItem {
  id: string
  partNo: string
  description: string
  quantity: number
  unit: string
  remarks: string
  confidence: 'high' | 'medium' | 'low'
}

export interface PDFParseResult {
  rawText: string
  items: ParsedItem[]
  pageCount: number
}

/** PDF에서 텍스트 전체 추출 */
export async function extractTextFromPDF(file: File): Promise<{ text: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pageCount = pdf.numPages

  const pageTexts: string[] = []
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // 텍스트 아이템을 줄 단위로 그룹화 (y좌표 기준)
    const lines = groupTextByLines(content.items as TextItem[])
    pageTexts.push(lines.join('\n'))
  }

  return { text: pageTexts.join('\n--- PAGE BREAK ---\n'), pageCount }
}

interface TextItem {
  str: string
  transform: number[]
}

function groupTextByLines(items: TextItem[]): string[] {
  if (!items.length) return []

  // y좌표 기준으로 정렬 후 그룹화
  const sorted = [...items].sort((a, b) => {
    const yDiff = b.transform[5] - a.transform[5]
    if (Math.abs(yDiff) > 3) return yDiff
    return a.transform[4] - b.transform[4] // 같은 줄이면 x 순서
  })

  const lines: string[] = []
  let currentY = sorted[0]?.transform[5] ?? 0
  let currentLine: string[] = []

  for (const item of sorted) {
    const y = item.transform[5]
    if (Math.abs(y - currentY) > 3) {
      if (currentLine.length) lines.push(currentLine.join(' ').trim())
      currentLine = [item.str]
      currentY = y
    } else {
      currentLine.push(item.str)
    }
  }
  if (currentLine.length) lines.push(currentLine.join(' ').trim())

  return lines.filter(l => l.trim())
}

/** PDF 첫 페이지 캔버스 렌더링 */
export async function renderPDFPage(file: File, canvas: HTMLCanvasElement, pageNum = 1): Promise<void> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(pageNum)

  const viewport = page.getViewport({ scale: 1.2 })
  canvas.width = viewport.width
  canvas.height = viewport.height

  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport, canvas }).promise
}

/** 텍스트에서 견적 아이템 파싱 */
export function parseItemsFromText(text: string): ParsedItem[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)
  const items: ParsedItem[] = []

  // 패턴 1: "품번 설명 수량 단위" 형태의 테이블 행
  // 예: "ME-001-FLT Main Engine Lube Oil Filter 6 PCS"
  // 예: "1 ME-001 Filter Element 6 EA remarks"
  const tableRowPattern = /^(?:\d+[\s.)\-]+)?([A-Z0-9][-A-Z0-9/._]{2,})\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s*(PCS|EA|SET|MTR|KGS?|LTR|ROLLS?|BOX|PAIR|DRUM|PKG|NOS?|LOT|M|KG|L)\b(.*)$/i

  // 패턴 2: 번호로 시작하는 순번 포함 행
  // 예: "1. Filter Element ME-001-FLT 6 PCS"
  const numberedPattern = /^(\d+)[\s.)]+(.+?)\s+([A-Z0-9][-A-Z0-9/._]{2,})\s+(\d+(?:[.,]\d+)?)\s*(PCS|EA|SET|MTR|KGS?|LTR|ROLLS?|BOX|PAIR|DRUM|PKG|NOS?|LOT|M|KG|L)\b(.*)$/i

  // 패턴 3: 수량이 앞에 오는 경우
  // 예: "6 PCS ME-001-FLT Lube Oil Filter"
  const qtyFirstPattern = /^(\d+(?:[.,]\d+)?)\s*(PCS|EA|SET|MTR|KGS?|LTR|ROLLS?|BOX|PAIR|DRUM|PKG|NOS?|LOT|M|KG|L)\s+([A-Z0-9][-A-Z0-9/._]{2,})\s+(.+)$/i

  for (const line of lines) {
    // 헤더/제목 행 스킵
    if (/^(no|item|description|part|qty|unit|quantity|remarks|sl\.?\s*no)/i.test(line)) continue
    if (/^(page|date|to:|from:|vessel|ship|ref|rfq|quotation|purchase)/i.test(line)) continue
    if (line.length < 8) continue

    let match = line.match(tableRowPattern)
    if (match) {
      items.push({
        id: crypto.randomUUID(),
        partNo: match[1].toUpperCase(),
        description: match[2].trim(),
        quantity: parseFloat(match[3].replace(',', '')),
        unit: match[4].toUpperCase(),
        remarks: match[5]?.trim() ?? '',
        confidence: 'high',
      })
      continue
    }

    match = line.match(numberedPattern)
    if (match) {
      items.push({
        id: crypto.randomUUID(),
        partNo: match[3].toUpperCase(),
        description: match[2].trim(),
        quantity: parseFloat(match[4].replace(',', '')),
        unit: match[5].toUpperCase(),
        remarks: match[6]?.trim() ?? '',
        confidence: 'high',
      })
      continue
    }

    match = line.match(qtyFirstPattern)
    if (match) {
      items.push({
        id: crypto.randomUUID(),
        partNo: match[3].toUpperCase(),
        description: match[4].trim(),
        quantity: parseFloat(match[1].replace(',', '')),
        unit: match[2].toUpperCase(),
        remarks: '',
        confidence: 'medium',
      })
      continue
    }
  }

  // 중복 제거 (같은 품번)
  const seen = new Set<string>()
  return items.filter(item => {
    if (seen.has(item.partNo)) return false
    seen.add(item.partNo)
    return true
  })
}
