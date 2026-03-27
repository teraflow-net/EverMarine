import { Button } from '@/components/ui/Button'
import { Bell, Search } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="h-[64px] bg-white border-b border-slate-200/80 flex items-center justify-between px-10 shrink-0">
      <div className="py-2">
        <h1 className="text-[17px] font-semibold text-slate-900 tracking-[-0.01em] leading-snug">{title}</h1>
        {subtitle && <p className="text-[13px] text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Button variant="ghost" size="sm" className="w-10 h-10 !p-0 ml-3" icon={<Search className="w-[18px] h-[18px]" strokeWidth={1.8} />}>
          <span className="sr-only">검색</span>
        </Button>
        <Button variant="ghost" size="sm" className="w-10 h-10 !p-0 relative">
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white" />
        </Button>
      </div>
    </header>
  )
}
