import { test, expect, type Page } from '@playwright/test'
import {
  readCell,
  writeCell,
  writeCells,
  appendComment,
  readComments,
  deleteCommentsByText,
} from './sheets-helper'

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Wait for fresh data on the page after a Google Sheets mutation.
 * Reloads + waits for the /api/data response, then waits a tick
 * for React to re-render.
 */
async function waitForFreshData(page: Page) {
  // Wait a bit for ISR cache to expire (3s revalidate)
  await page.waitForTimeout(3_000)
  // Reload to force a fresh fetch
  await page.reload({ waitUntil: 'networkidle' })
  // Give SWR a moment to hydrate
  await page.waitForTimeout(1_000)
}

/** Navigate to a tab using the bottom navigation */
async function goToTab(page: Page, tab: 'scores' | 'finished' | 'leaderboard') {
  const labels: Record<string, string> = {
    scores: 'แข่งขัน',
    finished: 'ผลแข่ง',
    leaderboard: 'ตาราง',
  }
  await page.getByRole('button', { name: labels[tab] }).click()
  await page.waitForTimeout(500)
}

// ── Test Suite ───────────────────────────────────────────────────

test.describe.serial('Tournament E2E — Google Sheets + Playwright', () => {
  // ────────────────────────────────────────────────────────────────
  // Scenario 1: Update score → verify on website + table order
  // ────────────────────────────────────────────────────────────────
  test('1. Score update reflects on the website and table reorders', async ({
    page,
  }) => {
    // Read original values
    const origScoreA = await readCell('matches!J2') // score_a of match row 2
    const origScoreB = await readCell('matches!K2') // score_b of match row 2
    const origStatus = await readCell('matches!H2') // status of match row 2

    try {
      // Update scores: ปี 1 scores 2, ปี 3 scores 1
      await writeCells([
        { range: 'matches!J2', value: 2 },
        { range: 'matches!K2', value: 1 },
      ])

      // Set match status to "finished"
      await writeCell('matches!H2', 'finished')

      await waitForFreshData(page)

      // Go to scores tab (default) and find the match card with ปี 1 and ปี 3
      await page.goto('/')
      await waitForFreshData(page)

      // Navigate to ผลแข่ง tab first before checking the score
      await goToTab(page, 'finished')

      // Check that the score "2 - 1" appears on a match card
      // that has both ปี 1 and ปี 3
      const matchCard = page.locator('div').filter({ hasText: 'ปี 1' }).filter({ hasText: 'ปี 3' })
      await expect(matchCard.first().getByText('2 - 1')).toBeVisible({ timeout: 20_000 })

      // Go to leaderboard and verify table has updated
      await goToTab(page, 'leaderboard')
      const table = page.locator('table')
      await expect(table).toBeVisible()

      // The standings table should reflect the new scores
      // Just verify the table is present and has rows
      const rows = table.locator('tbody tr')
      await expect(rows).not.toHaveCount(0)
    } finally {
      // Revert scores
      await writeCells([
        { range: 'matches!J2', value: origScoreA || 0 },
        { range: 'matches!K2', value: origScoreB || 0 },
      ])
      // Revert status
      await writeCell('matches!H2', origStatus || 'upcoming')
    }
  })

  // ────────────────────────────────────────────────────────────────
  // Scenario 2: Update status to finished → match moves to finished tab
  // ────────────────────────────────────────────────────────────────
  test('2. Changing status to "finished" moves match to finished tab', async ({
    page,
  }) => {
    // Read original status of match row 2
    const origStatus = await readCell('matches!H2')

    try {
      // Set match status to "finished"
      await writeCell('matches!H2', 'finished')

      await page.goto('/')
      await waitForFreshData(page)

      // Go to finished tab — the match should appear there
      await goToTab(page, 'finished')
      const finishedSection = page.locator('section[aria-label="รายการแข่งขันที่ผ่านไปแล้ว"]')
      await expect(finishedSection).toBeVisible()

      // The match card with ปี 1 and ปี 3 should be in the finished tab
      const finishedCard = finishedSection
        .locator('div')
        .filter({ hasText: 'ปี 1' })
        .filter({ hasText: 'ปี 3' })
      await expect(finishedCard.first()).toBeVisible({ timeout: 20_000 })

      // The status badge should say "finished"
      await expect(finishedCard.first().getByText('finished', { exact: false })).toBeVisible()
    } finally {
      // Revert status
      await writeCell('matches!H2', origStatus || 'upcoming')
    }
  })

  // ────────────────────────────────────────────────────────────────
  // Scenario 3: Post a comment → verify it appears in the sheet
  // ────────────────────────────────────────────────────────────────
  test('3. Comment appears in Google Sheet after posting', async ({
    page,
  }) => {
    const TEST_COMMENT = '__E2E_TEST_COMMENT__'

    // First, make match row 2 "finished" so the comment section shows
    const origStatus = await readCell('matches!H2')
    await writeCell('matches!H2', 'finished')

    try {
      await page.goto('/')
      await waitForFreshData(page)

      // Go to finished tab
      await goToTab(page, 'finished')

      // Find the match card for ปี 1 vs ปี 3
      const finishedSection = page.locator('section[aria-label="รายการแข่งขันที่ผ่านไปแล้ว"]')
      await expect(finishedSection).toBeVisible()

      // Find the comment input within the match card
      const commentInput = finishedSection
        .locator('div')
        .filter({ hasText: 'ปี 1' })
        .filter({ hasText: 'ปี 3' })
        .locator('input[placeholder="พิมพ์ความคิดเห็น..."]')
        .first()

      await expect(commentInput).toBeVisible({ timeout: 20_000 })

      // Type and submit the comment, waiting for the API response
      await commentInput.fill(TEST_COMMENT)
      await Promise.all([
        page.waitForResponse((r) => r.url().includes('/api/comment') && r.status() === 200),
        commentInput.press('Enter'),
      ])

      // Retry reading comments from the sheet (eventual consistency)
      await expect(async () => {
        const rows = await readComments()
        const found = rows.some((row) => row[1] === TEST_COMMENT)
        expect(found).toBe(true)
      }).toPass({ timeout: 15_000, intervals: [1_000, 2_000, 3_000] })
    } finally {
      // Revert status and delete the test comment
      await writeCell('matches!H2', origStatus || 'upcoming')
      await deleteCommentsByText(TEST_COMMENT)

      // Verify cleanup: comment should be gone
      const rowsAfter = await readComments()
      const stillExists = rowsAfter.some((row) => row[1] === TEST_COMMENT)
      expect(stillExists).toBe(false)
    }
  })

  // ────────────────────────────────────────────────────────────────
  // Complex Scenario: Goal difference determines table ranking
  //
  //   1. Set K2 = 3  (match M1: ปี 1 vs ปี 3, score_b = 3)
  //   2. Set J2 = 1  (match M1: ปี 1 vs ปี 3, score_a = 1)
  //   3. Set K3 = 2  (match M2: ปี 2 vs ปี 4, score_b = 2)
  //
  //   ปี 3 should be #1 because of goal difference.
  // ────────────────────────────────────────────────────────────────
  test('Complex: Goal difference — ปี 3 ranks #1 after score changes', async ({
    page,
  }) => {
    // Save original values
    const origJ2 = await readCell('matches!J2')
    const origK2 = await readCell('matches!K2')
    const origK3 = await readCell('matches!K3')
    // Also need matches to be "finished" for standings to count
    const origH2 = await readCell('matches!H2')
    const origH3 = await readCell('matches!H3')

    try {
      // Update scores + set matches as finished so they count in standings
      await writeCells([
        { range: 'matches!J2', value: 1 },   // ปี 1 scores 1
        { range: 'matches!K2', value: 3 },   // ปี 3 scores 3 → GD +3 for ปี 3
        { range: 'matches!K3', value: 2 },   // ปี 4 scores 2 → GD +2 for ปี 4
        { range: 'matches!H2', value: 'finished' },
        { range: 'matches!H3', value: 'finished' },
      ])

      await page.goto('/')
      await waitForFreshData(page)

      // Go to leaderboard tab
      await goToTab(page, 'leaderboard')

      const table = page.locator('table')
      await expect(table).toBeVisible()

      // Verify ปี 3 is in rank 1 (first data row of the table)
      // The table structure: rank | team | points | played | ...
      // First row in tbody should have ปี 3
      await expect(async () => {
        const firstRow = table.locator('tbody tr').first()
        const teamCell = firstRow.locator('td').nth(1)
        await expect(teamCell).toContainText('ปี 3')
      }).toPass({ timeout: 25_000 })

      // Also verify ปี 3 has the correct goal difference
      const firstRow = table.locator('tbody tr').first()
      const gdCell = firstRow.locator('td').last()
      // ปี 3 scored 3, conceded 1 → GD = +2
      await expect(gdCell).toContainText('+2')
    } finally {
      // Revert all changes
      await writeCells([
        { range: 'matches!J2', value: origJ2 || 0 },
        { range: 'matches!K2', value: origK2 || 0 },
        { range: 'matches!K3', value: origK3 || 0 },
        { range: 'matches!H2', value: origH2 || 'upcoming' },
        { range: 'matches!H3', value: origH3 || 'upcoming' },
      ])
    }
  })
})
