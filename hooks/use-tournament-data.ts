'use client'

import useSWR from 'swr'
import { parseTournamentData, type TournamentData } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const freshFetcher = () =>
  fetch(`/api/data?t=${Date.now()}`).then((r) => r.json())

export function useTournamentData() {
  const { data, error, isLoading, mutate } = useSWR('/api/data', fetcher, {
    refreshInterval: 10_000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  })

  const parsed: TournamentData | null = data ? parseTournamentData(data) : null

  const refresh = async () => {
    const response = await mutate(freshFetcher, { revalidate: false })
    console.log('Data refreshed:', response)
  }

  const postComment = async (matchId: string, comment: string) => {
    const res = await fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: matchId, comment }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to post comment')
    }
    await mutate(freshFetcher, { revalidate: false })
  }

  return {
    data: parsed,
    isLoading,
    isError: !!error,
    refresh,
    postComment,
    lastUpdated: parsed?.fetched_at ? new Date(parsed.fetched_at) : null,
  }
}
