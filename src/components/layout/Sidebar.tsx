import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FileText, ShoppingCart, Package,
  Users, Truck, Mail, Settings, ChevronRight,
  DollarSign, Tags,
} from 'lucide-react'

const navSections = [
  {
    label: '업무',
    items: [
      { to: '/',       icon: LayoutDashboard, label: '대시보드' },
      { to: '/rfq',    icon: FileText,        label: '견적 관리',    badge: '2' },
      { to: '/po',     icon: ShoppingCart,     label: '발주 관리' },
      { to: '/email',  icon: Mail,            label: '이메일 센터' },
    ],
  },
  {
    label: '마스터',
    items: [
      { to: '/customers', icon: Users,   label: '매출처' },
      { to: '/suppliers',  icon: Truck,   label: '매입처' },
      { to: '/vessels',   icon: Package, label: '선박 관리' },
      { to: '/prices',    icon: DollarSign, label: '단가 조회' },
      { to: '/supplier-prices', icon: Tags, label: '품목단가' },
    ],
  },
  {
    label: '시스템',
    items: [
      { to: '/settings', icon: Settings, label: '설정' },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="w-[232px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col h-full">
      {/* Logo */}
      <div className="h-[64px] flex items-center px-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-[16px] text-slate-900 tracking-[-0.01em]">TradeFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-5 pb-4 px-4">
        {navSections.map((section, si) => (
          <div key={section.label} className={cn(si > 0 && 'mt-6')}>
            <div className="px-3 mb-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{section.label}</span>
            </div>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-[10px] rounded-lg text-[14px] font-medium transition-all cursor-pointer',
                        isActive
                          ? 'bg-sky-50 text-sky-700'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cn('w-[18px] h-[18px] shrink-0', isActive ? 'text-sky-600' : 'text-slate-400')} strokeWidth={1.8} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="bg-sky-100 text-sky-700 text-[11px] font-bold min-w-[22px] text-center py-[2px] px-2 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-[12px] font-bold">TF</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-800 truncate leading-snug">TradeFlow Admin</div>
            <div className="text-[12px] text-slate-400 truncate mt-0.5">admin@tradeflow.com</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
