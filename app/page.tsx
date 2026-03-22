'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useTournamentData } from '@/hooks/use-tournament-data'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { MatchList } from '@/components/match-list'
import { BottomNav, type TabId } from '@/components/bottom-nav'
import { RefreshCw } from 'lucide-react'

export default function Home() {
  // Main tournament dashboard component
  const [activeTab, setActiveTab] = useState<TabId>('scores')
  const { data, isLoading, isError, refresh } = useTournamentData()
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const prevIsLoadingRef = useRef<boolean>(true)

  useEffect(() => {
    const wasLoading = prevIsLoadingRef.current
    prevIsLoadingRef.current = isLoading
    // Only update timestamp when loading transitions from true → false
    if (wasLoading && !isLoading) {
      setLastUpdated(new Date())
    }
  }, [isLoading])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Run refresh and a minimum 800ms delay in parallel
    const refreshPromise = refresh()
    const delayPromise = new Promise((resolve) => setTimeout(resolve, 800))
    await Promise.all([refreshPromise, delayPromise])
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  const matches = data?.matches ?? []
  const liveMatches = matches.filter((m) => {
    const s = m.status?.toLowerCase().trim() || ''
    return s === 'live' || s === 'playing'
  })
  const finishedMatches = matches.filter((m) => {
    const s = m.status?.toLowerCase().trim() || ''
    return s === 'ended' || s === 'finished'
  })
  const upcomingMatches = matches.filter((m) => {
    const s = m.status?.toLowerCase().trim() || ''
    return s !== 'live' && s !== 'playing' && s !== 'ended' && s !== 'finished'
  })

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="IFC Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-lg font-bold text-foreground">
              บอลชั้นปี 2026
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
            aria-label="รีเฟรชข้อมูล"
          >
            <RefreshCw size={14} className={isRefreshing || isLoading ? 'animate-spin' : ''} />
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <main suppressHydrationWarning className="flex-1 px-4 pt-4 pb-24">
        {isError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm">
            ไม่สามารถโหลดข้อมูลได้ กำลังลองใหม่...
          </div>
        )}

        {activeTab === 'scores' && (
          <section aria-label="รายการแข่งขัน">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-10 bg-primary rounded-full" />
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">การแข่งขัน</p>
                <h2 className="text-xl font-bold text-foreground">รายการแข่งขัน</h2>
              </div>
            </div>
            <MatchList
              matches={matches}
              liveMatches={liveMatches}
              upcomingMatches={upcomingMatches}
              isLoading={isLoading && !data}
              upcomingTitle="ที่กำลังจะมาถึง"
            />
          </section>
        )}

        {activeTab === 'finished' && (
          <section aria-label="รายการแข่งขันที่ผ่านไปแล้ว">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-10 bg-primary rounded-full" />
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">ผลการแข่งขัน</p>
                <h2 className="text-xl font-bold text-foreground">รายการแข่งขันที่ผ่านไปแล้ว</h2>
              </div>
            </div>
            <MatchList
              matches={matches}
              liveMatches={[]}
              upcomingMatches={finishedMatches}
              isLoading={isLoading && !data}
            />
          </section>
        )}

        {activeTab === 'leaderboard' && (
          <section aria-label="ตารางคะแนน">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-10 bg-primary rounded-full" />
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">รอบแบ่งกลุ่ม</p>
                <h2 className="text-xl font-bold text-foreground">ตารางคะแนน</h2>
              </div>
            </div>
            <LeaderboardTable
              rows={data?.sorted_table ?? []}
              isLoading={isLoading && !data}
            />
          </section>
        )}

        {/* Footer Credit */}
        <div className="mt-14 pb-4 flex justify-center opacity-30">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground">
            Created by SubhakritSC
          </span>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
