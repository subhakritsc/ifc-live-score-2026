'use client'

import { cn } from '@/lib/utils'
import type { Match } from '@/lib/types'

function normalizeStatus(status: string): 'upcoming' | 'live' | 'finished' {
  const s = status?.toLowerCase().trim() || ''
  if (s === 'live' || s === 'playing' || s === 'กำลังแข่ง') return 'live'
  if (s === 'finished' || s === 'ended' || s === 'จบ' || s === 'ft') return 'finished'
  return 'upcoming'
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
        normalized === 'live' &&
          'bg-[oklch(0.78_0.17_85/0.15)] text-[oklch(0.78_0.17_85)] border border-[oklch(0.78_0.17_85/0.3)]',
        normalized === 'finished' &&
          'bg-[oklch(0.65_0.15_145/0.12)] text-[oklch(0.65_0.15_145)] border border-[oklch(0.65_0.15_145/0.25)]',
        normalized === 'upcoming' &&
          'bg-muted text-muted-foreground border border-border'
      )}
    >
      {normalized === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.17_85)] animate-pulse" />
      )}
      {normalized === 'live' ? 'Live' : normalized === 'finished' ? 'FT' : 'Soon'}
    </span>
  )
}

function MatchCardSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-3 bg-muted rounded animate-pulse" />
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
      </div>
      <div className="w-12 h-5 bg-muted rounded-full animate-pulse" />
    </div>
  )
}

interface MatchListProps {
  matches: Match[]
  isLoading: boolean
}

export function MatchList({ matches, isLoading }: MatchListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const sorted = [...matches].sort((a, b) =>
    a.time_start.localeCompare(b.time_start)
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">ไม่มีข้อมูลการแข่งขัน</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((match, idx) => {
        const status = normalizeStatus(match.status)
        const isLive = status === 'live'
        const isUpcoming = status === 'upcoming'
        return (
          <div
            key={`${match.time_start}-${match.team_a}-${match.team_b}-${idx}`}
            className={cn(
              'rounded-xl border px-4 py-3 flex items-center gap-3 transition-colors',
              isLive
                ? 'bg-[oklch(0.78_0.17_85/0.07)] border-[oklch(0.78_0.17_85/0.25)]'
                : 'bg-card border-border'
            )}
          >
            {/* Time */}
            <span className="text-xs text-muted-foreground font-mono w-10 shrink-0 tabular-nums">
              {match.time_start}
            </span>

            {/* Match */}
            <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
              <span
                className={cn(
                  'text-sm font-semibold truncate text-right flex-1',
                  isLive ? 'text-foreground' : 'text-foreground/80'
                )}
              >
                {match.team_a}
              </span>

              {isUpcoming ? (
                <span className="text-xs font-mono text-muted-foreground bg-muted rounded-lg px-3 py-1 shrink-0">
                  vs
                </span>
              ) : (
                <span
                  className={cn(
                    'text-base font-bold font-mono tabular-nums rounded-lg px-3 py-1 shrink-0',
                    isLive
                      ? 'text-[oklch(0.78_0.17_85)] bg-[oklch(0.78_0.17_85/0.1)]'
                      : 'text-foreground bg-secondary'
                  )}
                >
                  {match.score_a} — {match.score_b}
                </span>
              )}

              <span
                className={cn(
                  'text-sm font-semibold truncate text-left flex-1',
                  isLive ? 'text-foreground' : 'text-foreground/80'
                )}
              >
                {match.team_b}
              </span>
            </div>

            {/* Status */}
            <div className="shrink-0">
              <StatusBadge status={match.status} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
