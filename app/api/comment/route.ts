import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const SHEET_ID = process.env.GOOGLE_SHEETS_ID
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')

export async function POST(request: Request) {
  try {
    if (!SHEET_ID || !SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Missing Google Sheets service account configuration' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { match_id, comment } = body

    if (!match_id || typeof match_id !== 'string') {
      return NextResponse.json({ error: 'match_id is required' }, { status: 400 })
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return NextResponse.json({ error: 'comment is required' }, { status: 400 })
    }

    if (comment.trim().length > 280) {
      return NextResponse.json({ error: 'comment must be 280 characters or less' }, { status: 400 })
    }

    const auth = new google.auth.JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: SERVICE_ACCOUNT_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    const sheets = google.sheets({ version: 'v4', auth })

    const timestamp = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'comment!A:C',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[match_id, comment.trim(), timestamp]],
      },
    })

    return NextResponse.json({ success: true, timestamp })
  } catch (error) {
    console.log('[comment] API Error:', error)
    return NextResponse.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    )
  }
}
