export interface Match {
  match_id: string
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

export interface Comment {
  match_id: string
  comment: string
  timestamp: string
}

export interface TournamentData {
  matches: Match[]
  sorted_table: TableRow[]
  comments: Comment[]
  fetched_at?: string
}

export function getMatchId(match: Match): string {
  return match.match_id
}

function parseRows<T>(rows: unknown[][]): T[] {
  if (rows.length < 2) return []
  const headers = (rows[0] as string[]).map((h) => h.trim())
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
    comments: unknown[][]
    fetched_at?: string
  }
}): TournamentData {
  return {
    matches: parseRows<Match>(raw.data.matches),
    sorted_table: parseRows<TableRow>(raw.data.sorted_table),
    comments: parseRows<Comment>(raw.data.comments),
    fetched_at: raw.data.fetched_at,
  }
}
