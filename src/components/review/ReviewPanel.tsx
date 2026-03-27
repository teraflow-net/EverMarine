import { useState, useEffect, useCallback } from 'react'
import { X, MessageCircle, Check, Clock, Image, ExternalLink } from 'lucide-react'
import { supabase, PROJECT_ID, type ReviewComment } from '@/lib/supabase'

type Props = {
  open: boolean
  onClose: () => void
  onPinClick: (comment: ReviewComment) => void
}

type Tab = 'open' | 'resolved'

const PAGE_LABELS: Record<string, string> = {
  '/': '대시보드',
  '/rfq': '견적 관리',
  '/po': '발주 관리',
  '/email': '이메일 센터',
  '/customers': '고객사',
  '/suppliers': '공급사',
  '/parts': '품목 마스터',
  '/settings': '설정',
}

function getPageLabel(url: string): string {
  if (PAGE_LABELS[url]) return PAGE_LABELS[url]
  if (url.startsWith('/rfq/')) return `견적 상세 ${url.split('/').pop()}`
  if (url.startsWith('/po/')) return `발주 상세 ${url.split('/').pop()}`
  return url
}

const STATUS_ICON: Record<ReviewComment['status'], { icon: typeof MessageCircle; color: string }> = {
  open: { icon: MessageCircle, color: 'text-amber-500' },
  in_progress: { icon: Clock, color: 'text-blue-500' },
  resolved: { icon: Check, color: 'text-green-500' },
}

export function ReviewPanel({ open, onClose, onPinClick }: Props) {
  const [tab, setTab] = useState<Tab>('open')
  const [allComments, setAllComments] = useState<ReviewComment[]>([])

  const fetchAll = useCallback(async () => {
    const { data } = await supabase
      .from('review_comments')
      .select('*')
      .eq('project_id', PROJECT_ID)
      .order('created_at', { ascending: false })
    if (data) setAllComments(data)
  }, [])

  useEffect(() => {
    if (open) fetchAll()
  }, [open, fetchAll])

  // Realtime
  useEffect(() => {
    if (!open) return
    const channel = supabase
      .channel('review_panel_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'review_comments' }, () => fetchAll())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [open, fetchAll])

  const filtered = allComments.filter((c) =>
    tab === 'open' ? c.status !== 'resolved' : c.status === 'resolved'
  )

  // 페이지별 그룹핑
  const grouped = filtered.reduce<Record<string, ReviewComment[]>>((acc, c) => {
    if (!acc[c.page_url]) acc[c.page_url] = []
    acc[c.page_url].push(c)
    return acc
  }, {})

  const openCount = allComments.filter((c) => c.status !== 'resolved').length
  const resolvedCount = allComments.filter((c) => c.status === 'resolved').length

  if (!open) return null

  return (
    <div className="fixed top-0 right-0 h-full w-[360px] bg-white border-l border-slate-200 shadow-xl z-[9999] flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">피드백 목록</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab('open')}
          className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${
            tab === 'open'
              ? 'text-sky-600 border-b-2 border-sky-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          미처리 / 진행중 ({openCount})
        </button>
        <button
          onClick={() => setTab('resolved')}
          className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${
            tab === 'resolved'
              ? 'text-sky-600 border-b-2 border-sky-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          완료 ({resolvedCount})
        </button>
      </div>

      {/* 코멘트 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(grouped).length === 0 && (
          <div className="p-8 text-center text-sm text-slate-400">
            {tab === 'open' ? '처리할 피드백이 없습니다' : '완료된 피드백이 없습니다'}
          </div>
        )}
        {Object.entries(grouped).map(([pageUrl, comments]) => (
          <div key={pageUrl}>
            {/* 페이지 그룹 헤더 */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <ExternalLink size={12} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-600">{getPageLabel(pageUrl)}</span>
              <span className="text-xs text-slate-400">{pageUrl}</span>
              <span className="ml-auto text-xs text-slate-400">{comments.length}건</span>
            </div>
            {/* 코멘트 아이템 */}
            {comments.map((comment) => {
              const StatusIcon = STATUS_ICON[comment.status].icon
              return (
                <button
                  key={comment.id}
                  onClick={() => onPinClick(comment)}
                  className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <StatusIcon size={14} className={`mt-0.5 shrink-0 ${STATUS_ICON[comment.status].color}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-900">{comment.author_name}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{comment.content}</p>
                      {comment.image_url && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-sky-600">
                          <Image size={12} />
                          첨부 이미지
                        </div>
                      )}
                      {comment.github_issue_number && (
                        <a
                          href={`https://github.com/${import.meta.env.VITE_GITHUB_REPO || 'teraflow-net/EverMarine'}/issues/${comment.github_issue_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800"
                        >
                          <ExternalLink size={10} />
                          #{comment.github_issue_number}
                        </a>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* 하단 요약 */}
      <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50">
        <span className="text-xs text-slate-500">
          전체 {allComments.length}건 · 미처리 {openCount}건 · 완료 {resolvedCount}건
        </span>
      </div>
    </div>
  )
}
