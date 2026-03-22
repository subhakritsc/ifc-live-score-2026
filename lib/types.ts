export interface Match {
  time_start: string
  time_end?: string
  periods?: string
  duration?: string
  break?: string
  round: string
  status: string
  team_a: string
  score_a: number | string
  score_b: number | string
  team_b: string
  referee_name?: string
  referee_level?: string
  winner?: string
}

export interface TableRow {
  rank: number | string
  team: string
  played: number | string
  win: number | string
  draw: number | string
  lose: number | string
  gf: number | string
  ga: number | string
  gd: number | string
  points: number | string
  status?: string
}

export interface TournamentData {
  matches: Match[]
  sorted_table: TableRow[]
}

function parseRows<T>(rows: unknown[][]): T[] {
  if (rows.length < 2) return []
  const headers = rows[0] as string[]
  return rows.slice(1).map((row) => {
    const obj: Record<string, unknown> = {}
    headers.forEach((header, i) => {
      obj[header] = row[i]
    })
    return obj as T
  })
}

export function parseTournamentData(raw: {
  data: {
    matches: unknown[][]
    sorted_table: unknown[][]
  }
}): TournamentData {
  return {
    matches: parseRows<Match>(raw.data.matches),
    sorted_table: parseRows<TableRow>(raw.data.sorted_table),
  }
}
