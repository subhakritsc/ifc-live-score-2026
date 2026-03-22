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
  const colHeader = 'text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-center'
  const colCell = 'text-sm text-center text-foreground'

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
    <div className="rounded-xl bg-card border-l-4 border-l-primary border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px]">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className={cn(colHeader, 'py-3 pl-4 pr-2 text-left w-12')}>อันดับ</th>
              <th className={cn(colHeader, 'py-3 px-2 text-left')}>ทีม</th>
              <th className={cn(colHeader, 'py-3 px-2 w-12')}>แข่ง</th>
              <th className={cn(colHeader, 'py-3 px-2 w-12')}>ชนะ</th>
              <th className={cn(colHeader, 'py-3 px-2 w-12')}>เสมอ</th>
              <th className={cn(colHeader, 'py-3 px-2 w-12')}>แพ้</th>
              <th className={cn(colHeader, 'py-3 px-2 w-12')}>ได้</th>
              <th className={cn(colHeader, 'py-3 px-2 w-12')}>เสีย</th>
              <th className={cn(colHeader, 'py-3 px-2 w-12')}>ต่าง</th>
              <th className={cn(colHeader, 'py-3 pl-2 pr-4 w-12')}>แต้ม</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rank = Number(row.rank) || 0
              const isLive = row.status?.toLowerCase() === 'live'
              return (
                <tr
                  key={row.team}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors',
                    isLive && 'bg-primary/5'
                  )}
                >
                  <td className="py-4 pl-4 pr-2">
                    <span className="text-lg font-bold text-foreground">
                      {rank}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {row.team}
                      </span>
                      {isLive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                  </td>
                  <td className={cn(colCell, 'py-4 px-2')}>{row.played}</td>
                  <td className={cn(colCell, 'py-4 px-2')}>{row.win}</td>
                  <td className={cn(colCell, 'py-4 px-2')}>{row.draw}</td>
                  <td className={cn(colCell, 'py-4 px-2')}>{row.lose}</td>
                  <td className={cn(colCell, 'py-4 px-2')}>{row.gf}</td>
                  <td className={cn(colCell, 'py-4 px-2')}>{row.ga}</td>
                  <td
                    className={cn(
                      colCell,
                      'py-4 px-2',
                      Number(row.gd) > 0 && 'text-green-600',
                      Number(row.gd) < 0 && 'text-primary'
                    )}
                  >
                    {Number(row.gd) > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td className="py-4 pl-2 pr-4 text-center">
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
