'use client'

import { cn } from '@/lib/utils'
import type { TableRow } from '@/lib/types'

function RankBadge({ rank }: { rank: number | string }) {
  const numRank = Number(rank)
  if (numRank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[oklch(0.78_0.17_85)] text-[oklch(0.12_0_0)] text-xs font-bold">
        1
      </span>
    )
  }
  if (numRank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[oklch(0.72_0_0)] text-[oklch(0.12_0_0)] text-xs font-bold">
        2
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 text-muted-foreground text-xs font-medium">
      {rank}
    </span>
  )
}

function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
      <div className="flex-1 h-4 rounded bg-muted animate-pulse" />
      <div className="w-8 h-4 rounded bg-muted animate-pulse" />
      <div className="w-8 h-4 rounded bg-muted animate-pulse" />
      <div className="w-8 h-4 rounded bg-muted animate-pulse" />
      <div className="w-8 h-4 rounded bg-muted animate-pulse" />
    </div>
  )
}

interface LeaderboardTableProps {
  rows: TableRow[]
  isLoading: boolean
}

export function LeaderboardTable({ rows, isLoading }: LeaderboardTableProps) {
  const colHeader = 'text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-center'
  const colCell = 'text-xs text-center text-foreground/80'

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <LeaderboardRowSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px]">
          <thead>
            <tr className="border-b border-border">
              <th className={cn(colHeader, 'py-2.5 pl-4 pr-2 text-left w-8')}>#</th>
              <th className={cn(colHeader, 'py-2.5 px-2 text-left')}>ทีม</th>
              <th className={cn(colHeader, 'py-2.5 px-1.5 w-8')}>P</th>
              <th className={cn(colHeader, 'py-2.5 px-1.5 w-8')}>W</th>
              <th className={cn(colHeader, 'py-2.5 px-1.5 w-8')}>D</th>
              <th className={cn(colHeader, 'py-2.5 px-1.5 w-8')}>L</th>
              <th className={cn(colHeader, 'py-2.5 px-1.5 w-8')}>GF</th>
              <th className={cn(colHeader, 'py-2.5 px-1.5 w-8')}>GA</th>
              <th className={cn(colHeader, 'py-2.5 px-1.5 w-8')}>GD</th>
              <th className={cn(colHeader, 'py-2.5 pl-1.5 pr-4 w-10')}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rank = Number(row.rank) || 0
              const isTop = rank <= 2
              const isLive = row.status === 'live'
              return (
                <tr
                  key={row.team}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors',
                    isLive && 'bg-[oklch(0.78_0.17_85/0.07)]',
                    !isLive && isTop ? 'bg-card' : 'bg-card/60'
                  )}
                >
                  <td className="py-3 pl-4 pr-2">
                    <RankBadge rank={row.rank} />
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          rank === 1 && 'text-[oklch(0.78_0.17_85)]',
                          rank === 2 && 'text-[oklch(0.72_0_0)]',
                          rank > 2 && 'text-foreground'
                        )}
                      >
                        {row.team}
                      </span>
                      {isLive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.17_85)] animate-pulse" />
                      )}
                    </div>
                  </td>
                  <td className={cn(colCell, 'py-3 px-1.5')}>{row.played}</td>
                  <td className={cn(colCell, 'py-3 px-1.5')}>{row.win}</td>
                  <td className={cn(colCell, 'py-3 px-1.5')}>{row.draw}</td>
                  <td className={cn(colCell, 'py-3 px-1.5')}>{row.lose}</td>
                  <td className={cn(colCell, 'py-3 px-1.5')}>{row.gf}</td>
                  <td className={cn(colCell, 'py-3 px-1.5')}>{row.ga}</td>
                  <td
                    className={cn(
                      colCell,
                      'py-3 px-1.5',
                      Number(row.gd) > 0 && 'text-[oklch(0.65_0.15_145)]',
                      Number(row.gd) < 0 && 'text-destructive-foreground'
                    )}
                  >
                    {Number(row.gd) > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td className="py-3 pl-1.5 pr-4 text-center">
                    <span className="text-sm font-bold text-foreground">{row.points}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
