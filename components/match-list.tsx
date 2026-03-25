'use client'

import type { Match, Comment } from '@/lib/types'
import { MatchCard, MatchCardSkeleton } from '@/components/match-card'

interface MatchListProps {
  liveMatches: Match[]
  upcomingMatches: Match[]
  isLoading: boolean
  upcomingTitle?: string
  comments?: Comment[]
  onPostComment?: (matchId: string, comment: string) => Promise<void>
  onRefreshComments?: () => Promise<void>
}

export function MatchList({ liveMatches, upcomingMatches, isLoading, upcomingTitle, comments = [], onPostComment, onRefreshComments }: MatchListProps) {
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
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
            กำลังแข่งขัน
          </h2>
          <div className="flex flex-col gap-3">
            {liveMatches.map((match, idx) => (
              <MatchCard
                key={`live-${match.match_id}-${idx}`}
                match={match}
                isLive
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming / Finished Matches */}
      {hasUpcoming && (
        <section>
          {upcomingTitle && (
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
              {upcomingTitle}
            </h2>
          )}
          <div className="flex flex-col gap-3">
            {upcomingMatches
              .sort((a, b) => a.time_start.localeCompare(b.time_start))
              .map((match, idx) => (
                <MatchCard
                  key={`match-${match.match_id}-${idx}`}
                  match={match}
                  comments={comments}
                  onPostComment={onPostComment}
                  onRefreshComments={onRefreshComments}
                />
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
