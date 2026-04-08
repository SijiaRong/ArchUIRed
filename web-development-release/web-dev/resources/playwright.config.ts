import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for ArchUI visual snapshot regression tests.
 *
 * Two run targets:
 *   npm run test:e2e          → dev server (fast, for local iteration)
 *   npm run test:e2e:preview  → production build preview (for CI / release gate)
 *
 * Both serve identical files (same dist/ bundle), so snapshots are reusable
 * across both targets.
 */

const DEV_SERVER_URL = 'http://localhost:5173'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,      // snapshot tests must run serially for determinism
  retries: 0,
  timeout: 30_000,

  use: {
    baseURL: DEV_SERVER_URL,
    // Disable all CSS animations / transitions for pixel-deterministic screenshots
    reducedMotion: 'reduce',
    // Force dark mode (matches data-theme="dark" set in main.tsx)
    colorScheme: 'dark',
    // Consistent viewport for all snapshots
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
  },

  /* Snapshot comparison threshold: 0.1% pixel diff allowed */
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
      // Inter is loaded from Google Fonts; don't block indefinitely on it
      timeout: 15_000,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start the dev server automatically when running tests locally */
  webServer: {
    command: 'npm run dev',
    url: DEV_SERVER_URL,
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
