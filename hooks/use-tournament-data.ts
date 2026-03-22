'use client'

import useSWR from 'swr'
import { parseTournamentData, type TournamentData } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useTournamentData() {
  const { data, error, isLoading, mutate } = useSWR('/api/data', fetcher, {
    refreshInterval: 10_000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  })

  const parsed: TournamentData | null = data ? parseTournamentData(data) : null

  const refresh = async () => {
    await mutate()
  }

  return {
    data: parsed,
    isLoading,
    isError: !!error,
    refresh,
    lastUpdated: data ? new Date() : null,
  }
}
