import { env } from 'node:process'
import { test as base, expect } from '@playwright/test'


// Visual baselines are only valid inside the pinned Playwright image (fonts,
// freetype and the chromium build all affect pixels). e2e/docker.sh and the
// CI workflow set this; visual specs skip themselves without it.
export const IN_CONTAINER = !!env.E2E_IN_CONTAINER

export const skipUnlessInContainer = test => test.skip(!IN_CONTAINER,
  'visual baselines only match inside the Playwright image: run `npm run test-e2e`')

// a quiet spot over empty workspace to park the mouse before screenshots
export const PARK = { x: 1380, y: 20 }

export const test = base.extend({
  // fail any test that logs a console warning/error or throws. Blockly
  // reports deprecated API use with console.warn, so this catches those too.
  consoleProblems: [async ({ page }, use) => {
    const problems = []
    page.on('console', message => {
      if(['warning', 'error'].includes(message.type())) {
        problems.push(`${message.type()}: ${message.text()}`)
      }
    })
    page.on('pageerror', error => problems.push(`pageerror: ${error.message}`))

    // tests must not depend on the network: block and report external requests
    await page.route(url => !['127.0.0.1', 'localhost'].includes(url.hostname) && url.protocol !== 'data:', route => {
      problems.push(`external request: ${route.request().url()}`)
      return route.abort()
    })

    await use(problems)

    expect(problems, 'browser console warnings/errors').toEqual([])
  }, { auto: true }],

  // load the harness with the given URL params and wait for Blockly to be ready
  open: async ({ page }, use) => {
    await use(async (params = {}) => {
      await page.goto(`/?${new URLSearchParams(params)}`)
      await page.waitForFunction(() => window.harness?.ready)
      await page.mouse.move(PARK.x, PARK.y)
    })
  },

  // run a harness method in the page: await h('fieldCenter', id, 'TEXT')
  h: async ({ page }, use) => {
    await use((method, ...args) => page.evaluate(
      ({ method, args }) => window.harness[method](...args),
      { method, args }
    ))
  },

  // click the center of a point returned by a harness method
  clickAt: async ({ page }, use) => {
    await use(async (point, options) => {
      await page.mouse.click(point.x, point.y, options)
    })
  },
})

export { expect }
