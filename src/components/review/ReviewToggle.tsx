import { MessageCircle, X } from 'lucide-react'

type Props = {
  active: boolean
  commentCount: number
  onToggle: () => void
}

export function ReviewToggle({ active, commentCount, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all text-sm font-medium ${
        active
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-sky-600 text-white hover:bg-sky-700'
      }`}
    >
      {active ? (
        <>
          <X size={16} />
          리뷰 모드 종료
        </>
      ) : (
        <>
          <MessageCircle size={16} />
          리뷰 모드
          {commentCount > 0 && (
            <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
              {commentCount}
            </span>
          )}
        </>
      )}
    </button>
  )
}
