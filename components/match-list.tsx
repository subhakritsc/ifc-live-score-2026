'use client'

import { cn } from '@/lib/utils'
import type { Match } from '@/lib/types'

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase().trim() || ''
  const isLive = s === 'live' || s === 'playing'
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wide',
        isLive
          ? 'bg-green-500 text-white'
          : 'bg-secondary text-secondary-foreground'
      )}
    >
      {status || 'UPCOMING'}
    </span>
  )
}

function MatchCardSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        <div className="h-6 w-14 bg-muted rounded animate-pulse" />
        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

interface MatchCardProps {
  match: Match
  isLive?: boolean
}

function MatchCard({ match, isLive = false }: MatchCardProps) {
  const timeRange = match.time_end 
    ? `${match.time_start} - ${match.time_end}`
    : match.time_start
  
  const roundText = match.round?.toUpperCase() || ''
  const round = match.round ? ` • ${roundText}` : ''

  const isFinal = roundText.includes('FINAL') || roundText.includes('ชิง')
  const isFriendly = roundText.includes('FRIENDLY') || roundText.includes('กระชับมิตร')

  let borderClass = 'border-border'
  let textClass = 'text-muted-foreground'

  if (isLive) {
    borderClass = 'border-primary'
    textClass = 'text-primary'
  } else if (isFinal) {
    borderClass = 'border-amber-400 shadow-sm shadow-amber-400/20'
    textClass = 'text-amber-500'
  } else if (isFriendly) {
    borderClass = 'border-sky-400'
    textClass = 'text-sky-500'
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors bg-card',
        borderClass
      )}
    >
      {/* Header: Time + Status */}
      <div className="flex items-center justify-between mb-3">
        <span className={cn(
          'text-xs font-medium',
          textClass
        )}>
          {timeRange}{round}
        </span>
        <StatusBadge status={match.status} />
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-semibold text-foreground flex-1 min-w-0 truncate">
          {match.team_a}
        </span>
        
        <span className={cn(
          'text-xl font-bold tabular-nums px-3 shrink-0',
          isLive ? 'text-primary' : 'text-foreground'
        )}>
          {match.score_a ?? 0} - {match.score_b ?? 0}
        </span>
        
        <span className="text-base font-semibold text-foreground flex-1 text-right min-w-0 truncate">
          {match.team_b}
        </span>
      </div>
    </div>
  )
}

interface MatchListProps {
  matches: Match[]
  liveMatches: Match[]
  upcomingMatches: Match[]
  isLoading: boolean
}

export function MatchList({ liveMatches, upcomingMatches, isLoading }: MatchListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const hasLive = liveMatches.length > 0
  const hasUpcoming = upcomingMatches.length > 0

  if (!hasLive && !hasUpcoming) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">ไม่มีข้อมูลการแข่งขัน</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Live Matches */}
      {hasLive && (
        <section>
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            กำลังแข่งขัน
          </h2>
          <div className="flex flex-col gap-3">
            {liveMatches.map((match, idx) => (
              <MatchCard 
                key={`live-${match.time_start}-${match.team_a}-${idx}`} 
                match={match} 
                isLive 
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Matches */}
      {hasUpcoming && (
        <section>
          {/* <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
            รายการแข่งขัน
          </h2> */}
          <div className="flex flex-col gap-3">
            {upcomingMatches
              .sort((a, b) => a.time_start.localeCompare(b.time_start))
              .map((match, idx) => (
                <MatchCard 
                  key={`upcoming-${match.time_start}-${match.team_a}-${idx}`} 
                  match={match} 
                />
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
