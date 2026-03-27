import { cn } from '@/lib/utils'
import type { RFQStatus, POStatus } from '@/types'

/* ───────────────────────────────────────────
 *  범용 Badge
 * ─────────────────────────────────────────── */

type BadgeVariant = 'default' | 'info' | 'warning' | 'success' | 'danger' | 'purple' | 'orange' | 'muted'

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-200 text-slate-700',
  info:    'bg-sky-100 text-sky-800',
  warning: 'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-800',
  danger:  'bg-red-100 text-red-800',
  purple:  'bg-violet-100 text-violet-800',
  orange:  'bg-orange-100 text-orange-800',
  muted:   'bg-gray-200 text-gray-600',
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
 *  RFQ 상태 배지
 * ─────────────────────────────────────────── */

const rfqStatusConfig: Record<RFQStatus, { label: string; variant: BadgeVariant }> = {
  received:         { label: '수신됨',       variant: 'default' },
  parsing:          { label: '파싱중',       variant: 'warning' },
  quoted_supplier:  { label: '업체견적요청', variant: 'info' },
  supplier_replied: { label: '업체회신완료', variant: 'purple' },
  quoted_customer:  { label: '견적제출완료', variant: 'purple' },
  po_received:      { label: '발주수신',     variant: 'orange' },
  ordered:          { label: '발주완료',     variant: 'success' },
  delivered:        { label: '납품완료',     variant: 'success' },
  closed:           { label: '종료',         variant: 'muted' },
}

export function RFQStatusBadge({ status }: { status: RFQStatus }) {
  const { label, variant } = rfqStatusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}

/* ───────────────────────────────────────────
 *  PO 상태 배지
 * ─────────────────────────────────────────── */

const poStatusConfig: Record<POStatus, { label: string; variant: BadgeVariant }> = {
  pending:   { label: '대기중',   variant: 'default' },
  sent:      { label: '발송완료', variant: 'info' },
  confirmed: { label: '확인완료', variant: 'purple' },
  shipped:   { label: '선적완료', variant: 'orange' },
  delivered: { label: '납품완료', variant: 'success' },
  closed:    { label: '종료',     variant: 'muted' },
}

export function POStatusBadge({ status }: { status: POStatus }) {
  const { label, variant } = poStatusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}
