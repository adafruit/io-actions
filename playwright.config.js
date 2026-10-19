import { env } from 'node:process'
import { defineConfig, devices } from '@playwright/test'


const PORT = 4410

export default defineConfig({
  testDir: './e2e',
  // no platform suffix: baselines are always rendered in the same container
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],

  expect: {
    toHaveScreenshot: {
      // per-pixel colour tolerance. The default (0.2) misses moderate colour
      // changes (e.g. #0a6cff -> #0a8cff); 0.05 catches those while absorbing
      // the faint sub-pixel antialiasing noise on rounded block corners
      threshold: 0.05,
    },
  },

  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
  },

  projects: [
    { name: 'visual', testMatch: 'visual/**/*.spec.js' },
    { name: 'behavior', testMatch: 'behavior/**/*.spec.js' },
  ],

  webServer: {
    command: `node e2e/fixture/build.js && npx vite preview --outDir tmp/e2e_dist --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    // always rebuild so tests never run against a stale export
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
