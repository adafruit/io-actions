import { test, expect } from '../helpers.js'


test.describe('orphaned blocks', () => {
  test('are disabled until connected to the root block', async ({ open, h }) => {
    await open()
    const log = await h('append', { type: 'action_log', x: 400, y: 300 })

    await expect.poll(() => h('enabled', log)).toBe(false)

    await h('connect', await h('rootId'), 'ACTIONS', log)
    await expect.poll(() => h('enabled', log)).toBe(true)
  })
})

test.describe('feed blocks', () => {
  test('are disabled with a hint when there are no feeds', async ({ open, h }) => {
    await open({ workspace: 'empty', feeds: 'none', orphans: 'off' })
    const id = await h('append', { type: 'when_data', x: 300, y: 200 })

    expect(await h('fieldText', id, 'FEED_KEY')).toBe('No feeds available! Visit Feeds')
    expect(await h('enabled', id)).toBe(false)
  })

  test('are enabled when feeds exist', async ({ open, h }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'when_data', x: 300, y: 200 })

    expect(await h('enabled', id)).toBe(true)
  })
})

for(const { type, name } of [
  { type: 'weather', name: 'Weather' },
  { type: 'air_quality', name: 'Air Quality' },
]) {
  test.describe(`${type} blocks`, () => {
    test('are disabled with a hint when there are no locations', async ({ open, h }) => {
      await open({ workspace: 'empty', locations: 'none', orphans: 'off' })
      const id = await h('append', { type, x: 300, y: 200 })

      expect(await h('fieldText', id, 'POWER_UP_ID')).toBe(`No locations! Visit Power-Ups -> ${name}`)
      expect(await h('enabled', id)).toBe(false)
    })

    // the mixin re-checks when disableOrphans re-enables the block, so these
    // run with orphan handling on, like io-rails
    // returns the parent log block, which is enabled once attached
    const attachToRoot = async (h, id) => {
      const log = await h('append', { type: 'action_log', x: 300, y: 400 })
      await h('connect', log, 'EXPRESSION', id)
      await h('connect', await h('rootId'), 'ACTIONS', log)
      return log
    }

    test('are enabled once they have a location and are attached', async ({ open, h }) => {
      await open()
      const id = await h('append', { type, x: 300, y: 200 })
      expect(await h('enabled', id)).toBe(false)

      await h('setField', id, 'POWER_UP_ID', '1')
      await attachToRoot(h, id)

      await expect.poll(() => h('enabled', id)).toBe(true)
    })

    test('stay disabled when attached without a location', async ({ open, h }) => {
      await open()
      const id = await h('append', { type, x: 300, y: 200 })

      const log = await attachToRoot(h, id)

      // the parent proves the chain is attached; only the location keeps this disabled
      await expect.poll(() => h('enabled', log)).toBe(true)
      expect(await h('enabled', id)).toBe(false)
    })
  })
}
