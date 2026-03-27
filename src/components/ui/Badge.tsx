import { cn } from '@/lib/utils'
import type { Quote } from '@/types'

/* ───────────────────────────────────────────
 *  범용 Badge
 * ─────────────────────────────────────────── */

type BadgeVariant = 'default' | 'info' | 'warning' | 'success' | 'danger' | 'purple' | 'orange' | 'muted' | 'indigo' | 'emerald'

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-200 text-slate-700',
  info:    'bg-sky-100 text-sky-800',
  warning: 'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-800',
  danger:  'bg-red-100 text-red-800',
  purple:  'bg-violet-100 text-violet-800',
  orange:  'bg-orange-100 text-orange-800',
  muted:   'bg-gray-200 text-gray-600',
  indigo:  'bg-indigo-100 text-indigo-800',
  emerald: 'bg-emerald-100 text-emerald-800',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-5 py-1.5 rounded-[5px] text-xs font-semibold',
        badgeVariantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ───────────────────────────────────────────
 *  견적 상태 배지들
 * ─────────────────────────────────────────── */

interface QuoteStatusBadgesProps {
  quote: Quote
  className?: string
}

const statusFlags = [
  { key: 'is_quote' as const, label: '견적', variant: 'info' as BadgeVariant },
  { key: 'is_order' as const, label: '수주', variant: 'indigo' as BadgeVariant },
  { key: 'is_specification' as const, label: '명세', variant: 'purple' as BadgeVariant },
  { key: 'is_tax' as const, label: '세금', variant: 'orange' as BadgeVariant },
  { key: 'is_payment' as const, label: '입금', variant: 'emerald' as BadgeVariant },
] as const

export function QuoteStatusBadges({ quote, className }: QuoteStatusBadgesProps) {
  const activeBadges = statusFlags.filter((f) => quote[f.key])

  if (activeBadges.length === 0) {
    return <Badge variant="muted" className={className}>미처리</Badge>
  }

  return (
    <div className={cn('flex items-center gap-1 flex-wrap', className)}>
      {activeBadges.map((f) => (
        <Badge key={f.key} variant={f.variant}>{f.label}</Badge>
      ))}
    </div>
  )
}

/** 단일 가장 높은 상태만 표시 */
export function QuoteStatusBadge({ quote, className }: QuoteStatusBadgesProps) {
  for (let i = statusFlags.length - 1; i >= 0; i--) {
    if (quote[statusFlags[i].key]) {
      return <Badge variant={statusFlags[i].variant} className={className}>{statusFlags[i].label}</Badge>
    }
  }
  return <Badge variant="muted" className={className}>미처리</Badge>
}
