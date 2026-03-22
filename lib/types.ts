export interface Match {
  match_id: string
  time_start: string
  round: string
  status: 'upcoming' | 'live' | 'finished'
  team_a: string
  score_a: number
  score_b: number
  team_b: string
}

export interface TableRow {
  team: string
  played: number
  win: number
  draw: number
  lose: number
  gf: number
  ga: number
  gd: number
  points: number
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
