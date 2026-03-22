import { NextResponse } from 'next/server'

export async function GET() {
  const data = {
    data: {
      matches: [
        ["match_id", "time_start", "round", "status", "team_a", "score_a", "score_b", "team_b"],
        ["M001", "09:00", "group", "finished", "ปี 1", 3, 1, "ปี 2"],
        ["M002", "10:00", "group", "finished", "ปี 3", 0, 2, "ปี 4"],
        ["M003", "11:00", "group", "finished", "ปี 5", 1, 1, "ปี 6"],
        ["M004", "12:00", "group", "live", "ปี 2", 1, 0, "ปี 3"],
        ["M005", "13:00", "group", "upcoming", "ปี 1", 0, 0, "ปี 4"],
        ["M006", "14:00", "group", "upcoming", "ปี 5", 0, 0, "ปี 2"],
        ["M007", "15:00", "group", "upcoming", "ปี 6", 0, 0, "ปี 1"],
        ["M008", "10:00", "final", "upcoming", "TBD", 0, 0, "TBD"],
        ["M009", "09:30", "friendly", "finished", "ปี 1", 2, 2, "ปี 5"],
      ],
      sorted_table: [
        ["team", "played", "win", "draw", "lose", "gf", "ga", "gd", "points"],
        ["ปี 1", 3, 2, 1, 0, 8, 3, 5, 7],
        ["ปี 4", 3, 2, 0, 1, 5, 4, 1, 6],
        ["ปี 2", 2, 1, 0, 1, 3, 4, -1, 3],
        ["ปี 3", 2, 1, 0, 1, 3, 4, -1, 3],
        ["ปี 5", 2, 0, 1, 1, 2, 4, -2, 1],
        ["ปี 6", 2, 0, 0, 2, 1, 5, -4, 0],
      ],
    },
  }

  return NextResponse.json(data)
}
