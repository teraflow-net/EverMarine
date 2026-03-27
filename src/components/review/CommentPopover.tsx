import { useState, useRef } from 'react'
import { Send, Check, Loader2, Trash2, ImagePlus, X } from 'lucide-react'
import { supabase, type ReviewComment } from '@/lib/supabase'

type Props = {
  comment?: ReviewComment
  position: { x: number; y: number }
  onSubmit: (content: string, authorName: string, imageUrl: string | null) => void
  onUpdateStatus: (id: string, status: ReviewComment['status']) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const STATUS_LABELS: Record<ReviewComment['status'], { label: string; color: string }> = {
  open: { label: '미처리', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: '진행중', color: 'bg-blue-100 text-blue-700' },
  resolved: { label: '완료', color: 'bg-green-100 text-green-700' },
}

export function CommentPopover({ comment, position, onSubmit, onUpdateStatus, onDelete, onClose }: Props) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('review_author') || '')
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isNew = !comment

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('review-images').upload(fileName, file)
    if (error) return null
    const { data } = supabase.storage.from('review-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async () => {
    if (!content.trim() || !authorName.trim()) return
    setSubmitting(true)
    localStorage.setItem('review_author', authorName)

    let imageUrl: string | null = null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
    }

    await onSubmit(content, authorName, imageUrl)
    setSubmitting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x + 12, window.innerWidth - 320),
    top: Math.min(position.y - 10, window.innerHeight - 400),
    zIndex: 10001,
  }

  return (
    <>
      <div className="fixed inset-0 z-[10000]" onClick={onClose} />
      <div style={style} className="w-[300px] bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
        {isNew ? (
          <div className="p-3" onKeyDown={handleKeyDown}>
            <input
              type="text"
              placeholder="이름"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full text-sm px-2.5 py-1.5 border border-slate-200 rounded mb-2 outline-none focus:border-sky-400"
              autoFocus={!authorName}
            />
            <textarea
              placeholder="코멘트를 입력하세요... (Ctrl+Enter로 전송)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm px-2.5 py-1.5 border border-slate-200 rounded resize-none outline-none focus:border-sky-400"
              rows={3}
              autoFocus={!!authorName}
            />

            {/* 이미지 미리보기 */}
            {imagePreview && (
              <div className="relative mt-2 rounded border border-slate-200 overflow-hidden">
                <img src={imagePreview} alt="첨부" className="w-full max-h-32 object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              {/* 이미지 업로드 버튼 */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs px-2 py-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <ImagePlus size={14} />
                이미지
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <button
                onClick={handleSubmit}
                disabled={!content.trim() || !authorName.trim() || submitting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-sm rounded hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                등록
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{comment.author_name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_LABELS[comment.status].color}`}>
                  {STATUS_LABELS[comment.status].label}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(comment.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{comment.content}</p>

            {/* 첨부 이미지 표시 */}
            {comment.image_url && (
              <a href={comment.image_url} target="_blank" rel="noopener noreferrer" className="block mb-3">
                <img
                  src={comment.image_url}
                  alt="첨부 이미지"
                  className="w-full max-h-40 object-cover rounded border border-slate-200 hover:opacity-90 transition-opacity"
                />
              </a>
            )}

            <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2">
              {comment.status === 'open' && (
                <button
                  onClick={() => onUpdateStatus(comment.id, 'in_progress')}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  진행중
                </button>
              )}
              {(comment.status === 'open' || comment.status === 'in_progress') && (
                <button
                  onClick={() => onUpdateStatus(comment.id, 'resolved')}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100"
                >
                  <Check size={12} /> 완료
                </button>
              )}
              {comment.status === 'resolved' && (
                <button
                  onClick={() => onUpdateStatus(comment.id, 'open')}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100"
                >
                  다시 열기
                </button>
              )}
              <button
                onClick={() => onDelete(comment.id)}
                className="ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
