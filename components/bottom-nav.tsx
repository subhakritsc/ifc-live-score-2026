'use client'

import { cn } from '@/lib/utils'
import { Flag, Table2 } from 'lucide-react'

export type TabId = 'scores' | 'leaderboard'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs = [
  {
    id: 'scores' as TabId,
    label: 'MATCHES',
    icon: Flag,
  },
  {
    id: 'leaderboard' as TabId,
    label: 'TABLE',
    icon: Table2,
  },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      aria-label="เมนูหลัก"
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold tracking-wide transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          )
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
