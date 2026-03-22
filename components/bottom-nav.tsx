'use client'

import { cn } from '@/lib/utils'
import { BarChart2, Swords } from 'lucide-react'

export type TabId = 'leaderboard' | 'scores'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs = [
  {
    id: 'leaderboard' as TabId,
    label: 'ตาราง',
    icon: BarChart2,
  },
  {
    id: 'scores' as TabId,
    label: 'ผลบอล',
    icon: Swords,
  },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border"
      aria-label="Main navigation"
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
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={cn(isActive && 'text-primary')}
              />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-10 h-0.5 bg-primary rounded-full" />
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
