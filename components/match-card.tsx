'use client'

import { cn } from '@/lib/utils'
import type { Match, Comment } from '@/lib/types'
import { getMatchId } from '@/lib/types'
import { CommentSection } from '@/components/comment-section'

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase().trim() || ''
  const isLive = s === 'live' || s === 'playing'
  const isFinished = s === 'ended' || s === 'finished' || s === 'ft' || s.includes('จบ')

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wide',
        isLive
          ? 'bg-green-500 text-white animate-pulse'
          : isFinished
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          : 'bg-secondary text-secondary-foreground'
      )}
    >
      {status || 'UPCOMING'}
    </span>
  )
}

export function MatchCardSkeleton() {
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
  comments?: Comment[]
  onPostComment?: (matchId: string, comment: string) => Promise<void>
  onRefreshComments?: () => Promise<void>
}

export function MatchCard({ match, isLive = false, comments = [], onPostComment, onRefreshComments }: MatchCardProps) {
  const matchId = getMatchId(match)
  const matchComments = comments.filter((c) => c.match_id === matchId)

  const s = match.status?.toLowerCase().trim() || ''
  const isFinished = s === 'ended' || s === 'finished' || s === 'ft' || s.includes('จบ')

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
        <span className={cn('text-xs font-medium', textClass)}>
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

      {/* Comment section — only for finished matches */}
      {isFinished && onPostComment && (
        <CommentSection
          comments={matchComments}
          onPost={(comment) => onPostComment(matchId, comment)}
          onRefresh={onRefreshComments ?? (async () => {})}
        />
      )}
    </div>
  )
}
