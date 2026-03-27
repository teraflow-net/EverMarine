import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',
  ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  success:   'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs rounded-[5px] gap-1.5',
  md: 'px-3.5 py-1 text-sm rounded-[5px] gap-2',
  lg: 'px-4.5 py-1.5 text-sm rounded-[5px] gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}
