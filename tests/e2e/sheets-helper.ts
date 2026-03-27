/**
 * Google Sheets helper for e2e tests.
 * Provides read / write / append / delete helpers so tests can
 * mutate the live spreadsheet and roll back afterwards.
 */
import { google, type sheets_v4 } from 'googleapis'

const SHEET_ID = process.env.GOOGLE_SHEETS_ID!
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
  key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth })

// ── single-cell / range helpers ──────────────────────────────────

/** Read a range and return the 2-D values array */
export async function readRange(range: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  })
  return res.data.values ?? []
}

/** Read a single cell value (e.g. "matches!J2") */
export async function readCell(cell: string): Promise<string> {
  const rows = await readRange(cell)
  return rows[0]?.[0] ?? ''
}

/** Write a single cell value */
export async function writeCell(cell: string, value: string | number) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: cell,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[value]] },
  })
}

/** Batch-update several cells at once. Entries: { range, value } */
export async function writeCells(
  entries: { range: string; value: string | number }[]
) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: entries.map((e) => ({ range: e.range, values: [[e.value]] })),
    },
  })
}

// ── comment helpers ──────────────────────────────────────────────

/** Append a comment row to the "comment" sheet */
export async function appendComment(
  matchId: string,
  comment: string,
  timestamp?: string
) {
  const ts = timestamp ?? new Date().toISOString()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'comment!A:C',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [[matchId, comment, ts]] },
  })
}

/** Read all comment rows (including header) */
export async function readComments() {
  return readRange('comment')
}

/**
 * Delete comment rows whose `comment` column matches the given text.
 * Works by reading all rows, finding matching row indices, then
 * deleting them via batchUpdate (deleteRange) from bottom-up.
 */
export async function deleteCommentsByText(text: string) {
  // First, get the sheet ID for "comment"
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets(properties(sheetId,title))',
  })
  const commentSheet = meta.data.sheets?.find(
    (s) => s.properties?.title === 'comment'
  )
  if (!commentSheet) return

  const sheetId = commentSheet.properties!.sheetId!

  // Read all values to find matching rows
  const rows = await readRange('comment')
  // rows[0] is the header; data rows start at index 1
  const matchingIndices: number[] = []
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === text) {
      matchingIndices.push(i)
    }
  }
  if (matchingIndices.length === 0) return

  // Delete from bottom to top so indices stay valid
  const requests = matchingIndices
    .sort((a, b) => b - a)
    .map((rowIndex) => ({
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS' as const,
          startIndex: rowIndex,
          endIndex: rowIndex + 1,
        },
      },
    }))

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests },
  })
}
