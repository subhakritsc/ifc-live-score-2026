/**
 * Quick test script to verify Google Sheets append works.
 *
 * Usage:
 *   1. Make sure you've created the "comment" sheet with headers: match_id | comment | timestamp
 *   2. Make sure you've shared the spreadsheet with the service account email (Editor)
 *   3. Run: node scripts/test-comment.mjs
 */
import { config } from 'dotenv'
import { google } from 'googleapis'

// load from .env.local
config({ path: '../.env.local' })

// === CONFIG ===
const SHEET_ID = process.env.GOOGLE_SHEETS_ID
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
// === AUTH ===
const auth = new google.auth.JWT({
  email: SERVICE_ACCOUNT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

// === TEST: Append a comment ===
async function testAppend() {
  const timestamp = new Date().toISOString()

  const result = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'comment!A:C',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [
        ['M1', 'ทดสอบคอมเมนต์!', timestamp],
      ],
    },
  })

  console.log('Appended successfully!')
  console.log('Updated range:', result.data.updates?.updatedRange)
  console.log('Rows added:', result.data.updates?.updatedRows)
}

// === TEST: Read comments back ===
async function testRead() {
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'comment',
  })

  console.log('\nCurrent comments:')
  console.log(result.data.values)
}

// === RUN ===
try {
  await testAppend()
  await testRead()
} catch (err) {
  console.error('Error:', err.message)
  if (err.code === 403) {
    console.error('\nMake sure you shared the spreadsheet with:', SERVICE_ACCOUNT_EMAIL)
  }
}
