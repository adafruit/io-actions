import { test, expect, PARK } from '../helpers.js'


test.describe('mutator popups', () => {
  test('cog opens the popup and clicking it again closes it', async ({ open, h, clickAt }) => {
    await open()
    const root = await h('rootId')

    await clickAt(await h('mutatorCenter', root))
    await expect.poll(() => h('mutatorOpen', root)).toBe(true)

    await clickAt(await h('mutatorCenter', root))
    await expect.poll(() => h('mutatorOpen', root)).toBe(false)
  })

  // app/scripts/hacks.js closes open popups on any outside click
  test('clicking outside closes the popup', async ({ open, h, clickAt }) => {
    await open()
    const root = await h('rootId')

    await clickAt(await h('mutatorCenter', root))
    await expect.poll(() => h('mutatorOpen', root)).toBe(true)

    await clickAt(PARK)
    await expect.poll(() => h('mutatorOpen', root)).toBe(false)
  })

  test('schedule chips open their settings popup', async ({ open, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'days_of_week', x: 300, y: 200 })

    await clickAt(await h('mutatorCenter', id))
    await expect.poll(() => h('mutatorOpen', id)).toBe(true)
  })
})
