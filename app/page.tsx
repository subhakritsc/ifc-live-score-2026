'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useTournamentData } from '@/hooks/use-tournament-data'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { MatchList } from '@/components/match-list'
import { BottomNav, type TabId } from '@/components/bottom-nav'
import { RefreshCw } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('scores')
  const { data, isLoading, isError, refresh } = useTournamentData()
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const wasLoadingRef = useRef(false)
  const hasSetInitialRef = useRef(false)

  useEffect(() => {
    // Set lastUpdated only when isLoading flips from true → false (fetch completed)
    // or on the very first successful load
    if (!isLoading && data) {
      if (wasLoadingRef.current || !hasSetInitialRef.current) {
        setLastUpdated(new Date())
        hasSetInitialRef.current = true
      }
    }
    wasLoadingRef.current = isLoading
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  const matches = data?.matches ?? []
  const liveMatches = matches.filter((m) => {
    const s = m.status?.toLowerCase().trim() || ''
    return s === 'live' || s === 'playing'
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
      <main className="flex-1 px-4 pt-4 pb-24">
        {isError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm">
            ไม่สามารถโหลดข้อมูลได้ กำลังลองใหม่...
          </div>
        )}

        {activeTab === 'scores' && (
          <MatchList
            matches={matches}
            liveMatches={liveMatches}
            upcomingMatches={upcomingMatches}
            isLoading={isLoading && !data}
          />
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
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
