'use client'

import { cn } from '@/lib/utils'
import type { TableRow } from '@/lib/types'

function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-0">
      <div className="w-6 h-6 rounded bg-muted animate-pulse" />
      <div className="flex-1 h-4 rounded bg-muted animate-pulse" />
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
  const colHeader = 'text-[11px] font-semibold text-white uppercase tracking-wide text-center whitespace-nowrap'
  const colCell = 'text-sm text-center text-foreground tabular-nums'

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <LeaderboardRowSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="bg-foreground text-white">
                <th className="py-3 pl-4 pr-2 text-left text-[11px] font-semibold uppercase tracking-wide text-white whitespace-nowrap w-14">
                  อันดับ
                </th>
                <th className="py-3 px-2 text-left text-[11px] font-semibold uppercase tracking-wide text-white min-w-[60px]">
                  ทีม
                </th>
                <th className={cn(colHeader, 'py-3 pl-2 pr-4 w-12')}>แต้ม</th>
                <th className={cn(colHeader, 'py-3 px-1 w-8')}>แข่ง</th>
                <th className={cn(colHeader, 'py-3 px-1 w-8')}>ชนะ</th>
                <th className={cn(colHeader, 'py-3 px-1 w-8')}>เสมอ</th>
                <th className={cn(colHeader, 'py-3 px-1 w-8')}>แพ้</th>
                <th className={cn(colHeader, 'py-3 px-1 w-8')}>ได้</th>
                <th className={cn(colHeader, 'py-3 px-1 w-8')}>เสีย</th>
                <th className={cn(colHeader, 'py-3 pl-1 pr-3 w-8')}>+/-</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const rank = Number(row.rank) || index + 1
                const isQualified = rank <= 2
                const isLive = row.status?.toLowerCase() === 'live'
                const qualifiedIndicatorColor =
                  rank === 1 ? 'bg-amber-400' : rank === 2 ? 'bg-slate-300' : 'bg-primary'
                return (
                  <tr
                    key={row.team}
                    className="border-b border-border last:border-0 transition-colors"
                  >
                    {/* Rank with qualified indicator */}
                    <td className="py-3.5 pl-0 pr-2 relative">
                      <div className="flex items-center">
                        <span
                          className={cn(
                            'w-1 self-stretch mr-3 rounded-r-full',
                            isQualified ? qualifiedIndicatorColor : 'bg-transparent'
                          )}
                        />
                        <span className="text-base font-bold text-foreground w-6 text-center">
                          {rank}
                        </span>
                      </div>
                    </td>

                    {/* Team name — wider, no wrap */}
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {row.team}
                        </span>
                        {isLive && (
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 pl-2 pr-4 text-center">
                      <span className="text-sm font-bold text-foreground">{row.points}</span>
                    </td>
                    <td className={cn(colCell, 'py-3.5 px-1')}>{row.played}</td>
                    <td className={cn(colCell, 'py-3.5 px-1')}>{row.win}</td>
                    <td className={cn(colCell, 'py-3.5 px-1')}>{row.draw}</td>
                    <td className={cn(colCell, 'py-3.5 px-1')}>{row.lose}</td>
                    <td className={cn(colCell, 'py-3.5 px-1')}>{row.gf}</td>
                    <td className={cn(colCell, 'py-3.5 px-1')}>{row.ga}</td>
                    <td
                      className={cn(
                        colCell,
                        'py-3.5 pl-1 pr-3',
                        Number(row.gd) > 0 && 'text-green-600',
                        Number(row.gd) < 0 && 'text-primary'
                      )}
                    >
                      {Number(row.gd) > 0 ? `+${row.gd}` : row.gd}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-3 h-3 rounded-sm bg-amber-400" />
            <span className="w-3 h-3 rounded-sm bg-slate-300" />
          </span>
          <span className="text-xs text-muted-foreground font-medium">เข้ารอบชิง</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
          <span className="text-xs text-muted-foreground font-medium">กำลังแข่ง</span>
        </div>
      </div>
    </div>
  )
}
