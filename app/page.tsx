'use client'

import { useState } from 'react'
import { useTournamentData } from '@/hooks/use-tournament-data'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { MatchList } from '@/components/match-list'
import { BottomNav, type TabId } from '@/components/bottom-nav'
import { RefreshCw } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('leaderboard')
  const { data, isLoading, isError } = useTournamentData()

  const groupMatches = data?.matches.filter((m) => m.round === 'group') ?? []
  const liveCount = groupMatches.filter((m) => m.status === 'live').length

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground tracking-tight">
              Football Cup
            </span>
            {liveCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[oklch(0.78_0.17_85/0.15)] border border-[oklch(0.78_0.17_85/0.3)] text-[oklch(0.78_0.17_85)] text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.17_85)] animate-pulse" />
                {liveCount} Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
            <RefreshCw size={10} className={isLoading ? 'animate-spin' : ''} />
            <span>30s</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-3 pt-4 pb-24">
        {isError && (
          <div className="mb-3 px-4 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive-foreground text-xs">
            ไม่สามารถโหลดข้อมูลได้ กำลังลองใหม่...
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <section aria-label="Leaderboard">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              ตารางคะแนน
            </h2>
            <LeaderboardTable
              rows={data?.sorted_table ?? []}
              isLoading={isLoading && !data}
            />
            <div className="mt-3 flex items-center gap-4 px-1">
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-3 h-3 rounded-full bg-[oklch(0.78_0.17_85)]" />
                อันดับ 1
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-3 h-3 rounded-full bg-[oklch(0.72_0_0)]" />
                อันดับ 2
              </span>
            </div>
          </section>
        )}

        {activeTab === 'scores' && (
          <section aria-label="Match scores">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              ผลการแข่งขัน · รอบแบ่งกลุ่ม
            </h2>
            <MatchList
              matches={groupMatches}
              isLoading={isLoading && !data}
            />
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
