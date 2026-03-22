import { NextResponse } from 'next/server'

const SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY
const SHEET_ID = process.env.GOOGLE_SHEETS_ID

async function fetchSheet(sheetName: string): Promise<unknown[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${SHEETS_API_KEY}`
  
  const res = await fetch(url, { 
    next: { revalidate: 0 },
    cache: 'no-store'
  })
  
  if (!res.ok) {
    console.log("[v0] Google Sheets API error:", res.status, await res.text())
    throw new Error(`Failed to fetch sheet: ${sheetName}`)
  }
  
  const json = await res.json()
  return json.values || []
}

export async function GET() {
  try {
    if (!SHEETS_API_KEY || !SHEET_ID) {
      console.log("[v0] Missing env vars - API_KEY:", !!SHEETS_API_KEY, "SHEET_ID:", !!SHEET_ID)
      return NextResponse.json(
        { error: 'Missing Google Sheets configuration' },
        { status: 500 }
      )
    }

    const [matchesRaw, standingsRaw] = await Promise.all([
      fetchSheet('matches'),
      fetchSheet('sorted_table'),
    ])

    const data = {
      data: {
        matches: matchesRaw,
        sorted_table: standingsRaw,
      },
    }

    return NextResponse.json(data)
  } catch (error) {
    console.log("[v0] API Error:", error)
    return NextResponse.json(
      { error: 'Failed to fetch data from Google Sheets' },
      { status: 500 }
    )
  }
}
