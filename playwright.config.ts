import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,       // run sequentially — tests mutate shared sheet
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
