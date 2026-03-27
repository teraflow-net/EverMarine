import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { supabase, type ReviewComment } from '@/lib/supabase'
import { CommentPopover } from './CommentPopover'
import { ReviewToggle } from './ReviewToggle'
import { ReviewPanel } from './ReviewPanel'

export function PinLayer() {
  const [active, setActive] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [comments, setComments] = useState<ReviewComment[]>([])
  const [showResolved, setShowResolved] = useState(false)
  const [selectedComment, setSelectedComment] = useState<ReviewComment | null>(null)
  const [newPinPos, setNewPinPos] = useState<{ x: number; y: number; xPercent: number; yPercent: number } | null>(null)
  const [clickScreenPos, setClickScreenPos] = useState<{ x: number; y: number } | null>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const pageUrl = location.pathname

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('review_comments')
      .select('*')
      .eq('page_url', pageUrl)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
  }, [pageUrl])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  useEffect(() => {
    const channel = supabase
      .channel('review_comments_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'review_comments', filter: `page_url=eq.${pageUrl}` },
        () => { fetchComments() }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [pageUrl, fetchComments])

  useEffect(() => {
    setSelectedComment(null)
    setNewPinPos(null)
    setClickScreenPos(null)
  }, [pageUrl])

  const handleLayerClick = (e: React.MouseEvent) => {
    if (!active) return
    if ((e.target as HTMLElement).closest('[data-pin]') || (e.target as HTMLElement).closest('[data-popover]')) return

    const rect = layerRef.current!.getBoundingClientRect()
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100

    setSelectedComment(null)
    setNewPinPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, xPercent, yPercent })
    setClickScreenPos({ x: e.clientX, y: e.clientY })
  }

  const handleSubmit = async (content: string, authorName: string, imageUrl: string | null) => {
    if (!newPinPos) return
    await supabase.from('review_comments').insert({
      page_url: pageUrl,
      x_percent: newPinPos.xPercent,
      y_percent: newPinPos.yPercent,
      content,
      author_name: authorName,
      image_url: imageUrl,
    })
    setNewPinPos(null)
    setClickScreenPos(null)
  }

  const handleUpdateStatus = async (id: string, status: ReviewComment['status']) => {
    await supabase
      .from('review_comments')
      .update({
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', id)
    setSelectedComment(null)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('review_comments').delete().eq('id', id)
    setSelectedComment(null)
  }

  const handlePanelPinClick = (comment: ReviewComment) => {
    // 다른 페이지의 코멘트면 해당 페이지로 이동
    if (comment.page_url !== pageUrl) {
      navigate(comment.page_url)
    }
    setPanelOpen(false)
    // 약간의 딜레이 후 핀 선택 (페이지 이동 시간 확보)
    setTimeout(() => {
      setSelectedComment(comment)
    }, 100)
  }

  const visibleComments = showResolved
    ? comments
    : comments.filter((c) => c.status !== 'resolved')

  const openCount = comments.filter((c) => c.status !== 'resolved').length

  const PIN_COLORS: Record<ReviewComment['status'], string> = {
    open: 'bg-amber-500',
    in_progress: 'bg-blue-500',
    resolved: 'bg-green-500',
  }

  return (
    <>
      {/* 리뷰 모드 오버레이 */}
      {active && (
        <div
          ref={layerRef}
          className="absolute inset-0 z-[9990] cursor-crosshair"
          onClick={handleLayerClick}
        >
          {/* 상단 바 */}
          <div className="fixed top-0 left-0 right-0 z-[9998] bg-sky-600 text-white text-xs text-center py-1.5 font-medium flex items-center justify-center gap-4">
            <span>리뷰 모드 — 화면을 클릭하여 코멘트를 남기세요</span>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="accent-white"
              />
              완료 표시
            </label>
            <button
              onClick={(e) => { e.stopPropagation(); setPanelOpen(!panelOpen) }}
              className="px-2.5 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
            >
              피드백 목록
            </button>
          </div>

          {/* 기존 핀 렌더링 */}
          {visibleComments.map((comment, i) => (
            <button
              key={comment.id}
              data-pin
              onClick={(e) => {
                e.stopPropagation()
                setNewPinPos(null)
                setClickScreenPos(null)
                setSelectedComment(selectedComment?.id === comment.id ? null : comment)
              }}
              className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md hover:scale-110 transition-transform ${PIN_COLORS[comment.status]}`}
              style={{
                left: `${comment.x_percent}%`,
                top: `${comment.y_percent}%`,
              }}
            >
              {i + 1}
            </button>
          ))}

          {/* 새 핀 미리보기 */}
          {newPinPos && (
            <div
              className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-600 flex items-center justify-center text-white shadow-md animate-pulse"
              style={{ left: newPinPos.x, top: newPinPos.y }}
            >
              <MessageCircle size={14} />
            </div>
          )}
        </div>
      )}

      {/* 새 코멘트 팝오버 */}
      {active && newPinPos && clickScreenPos && (
        <CommentPopover
          position={clickScreenPos}
          onSubmit={handleSubmit}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
          onClose={() => { setNewPinPos(null); setClickScreenPos(null) }}
        />
      )}

      {/* 기존 코멘트 팝오버 */}
      {active && selectedComment && (
        <CommentPopover
          comment={selectedComment}
          position={{
            x: (selectedComment.x_percent / 100) * window.innerWidth,
            y: (selectedComment.y_percent / 100) * window.innerHeight,
          }}
          onSubmit={handleSubmit}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
          onClose={() => setSelectedComment(null)}
        />
      )}

      {/* 사이드 패널 */}
      <ReviewPanel
        open={active && panelOpen}
        onClose={() => setPanelOpen(false)}
        onPinClick={handlePanelPinClick}
      />

      {/* 토글 버튼 */}
      <ReviewToggle
        active={active}
        commentCount={openCount}
        onToggle={() => {
          setActive(!active)
          setPanelOpen(false)
          setSelectedComment(null)
          setNewPinPos(null)
          setClickScreenPos(null)
        }}
      />
    </>
  )
}
