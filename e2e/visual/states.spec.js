// Baselines for interactive and edge-case states: toolbox and flyouts, open
// popups and editors, checkbox/disabled/selected looks, and long values.
import { test, expect, skipUnlessInContainer, PARK } from '../helpers.js'


skipUnlessInContainer(test)

const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

// screenshot just one block (others hidden), with the mouse parked out of the way
const expectBlockScreenshot = async (page, h, id, name) => {
  await page.mouse.move(PARK.x, PARK.y)
  const clip = await h('isolate', id)
  await expect(page).toHaveScreenshot(name, { clip })
}

test.describe('toolbox', () => {
  test('at rest', async ({ open, page }) => {
    await open()
    await expect(page).toHaveScreenshot('toolbox-at-rest.png')
  })

  test('category hover', async ({ open, page, h }) => {
    await open()
    const logic = await h('categoryCenter', 'Logic')
    await page.mouse.move(logic.x, logic.y)
    await expect(page).toHaveScreenshot('toolbox-category-hover.png')
  })

  test('each category flyout', async ({ open, page, h, clickAt }) => {
    await open()

    for(const name of await h('categoryNames')) {
      await clickAt(await h('categoryCenter', name))
      await expect.poll(() => h('flyoutVisible')).toBe(true)
      await page.mouse.move(PARK.x, PARK.y)
      await expect.soft(page, name).toHaveScreenshot(`flyout-${slug(name)}.png`)
    }
  })

  test('variables flyout with a variable', async ({ open, page, h, clickAt }) => {
    await open()
    page.once('dialog', dialog => dialog.accept('temperature'))

    await clickAt(await h('categoryCenter', 'Variables'))
    await clickAt(await h('flyoutButtonCenter', 'Create New Variable'))
    await expect.poll(() => h('flyoutBlockTypes')).toEqual(['io_variables_set', 'io_variables_get'])

    await page.mouse.move(PARK.x, PARK.y)
    await expect(page).toHaveScreenshot('flyout-variables-with-variable.png')
  })
})

test.describe('popups and editors', () => {
  test('root mutator open', async ({ open, page, h, clickAt }) => {
    await open()
    const root = await h('rootId')

    await clickAt(await h('mutatorCenter', root))
    await expect.poll(() => h('mutatorOpen', root)).toBe(true)
    await expect(page).toHaveScreenshot('mutator-root-open.png')
  })

  test('schedule settings open', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'days_of_week', x: 300, y: 150 })

    await clickAt(await h('mutatorCenter', id))
    await expect.poll(() => h('mutatorOpen', id)).toBe(true)
    await expect(page).toHaveScreenshot('mutator-schedule-open.png')
  })

  test('dropdown open', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'io_logic_compare', x: 300, y: 150 })

    await clickAt(await h('fieldCenter', id, 'OP'))
    await expect.poll(() => h('dropdownOpen')).toBe(true)
    await expect(page).toHaveScreenshot('dropdown-open.png')
  })

  test('feed dropdown open', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'when_data', x: 300, y: 150 })

    await clickAt(await h('fieldCenter', id, 'FEED_KEY'))
    await expect.poll(() => h('dropdownOpen')).toBe(true)
    await expect(page).toHaveScreenshot('dropdown-feeds-open.png')
  })

  test('text editor open', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'io_text', x: 300, y: 150 })

    await clickAt(await h('fieldCenter', id, 'TEXT'))
    await expect.poll(() => h('editorOpen')).toBe(true)
    await page.keyboard.type('Editing a text field')
    await expect(page).toHaveScreenshot('editor-text-open.png')
  })

  test('multiline editor open', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'io_text_multiline', x: 300, y: 150 })

    await clickAt(await h('fieldCenter', id, 'TEXT'))
    await expect.poll(() => h('editorOpen')).toBe(true)
    for(const line of ['First line', 'Second line', 'Third line']) {
      await page.keyboard.type(line)
      await page.keyboard.press('Enter')
    }
    await expect(page).toHaveScreenshot('editor-multiline-open.png')
  })

  test('context menu open', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'action_log', x: 300, y: 150 })

    await clickAt(await h('blockCenter', id), { button: 'right' })
    await expect.poll(() => h('contextMenuItems')).toContain('Duplicate')
    await expect(page).toHaveScreenshot('context-menu-open.png')
  })
})

test.describe('block states', () => {
  test('checkboxes checked and unchecked', async ({ open, page, h }) => {
    await open({ workspace: 'empty', orphans: 'off' })

    const webhook = await h('append', { type: 'action_webhook', x: 300, y: 150, fields: { FORM_ENCODE: true } })
    await expectBlockScreenshot(page, h, webhook, 'checkbox-checked.png')

    // keep blocks well apart: Blockly bumps overlapping blocks after a delay,
    // which would move this one mid-screenshot
    const days = await h('append', { type: 'days_of_week', x: 300, y: 600, fields: { SUN: false, WED: false, SAT: false } })
    await expectBlockScreenshot(page, h, days, 'checkboxes-mixed.png')
  })

  test('disabled orphan', async ({ open, page, h }) => {
    await open()
    const id = await h('append', { type: 'action_email', x: 400, y: 300 })
    await expect.poll(() => h('enabled', id)).toBe(false)
    await expectBlockScreenshot(page, h, id, 'disabled-orphan.png')
  })

  test('disabled without locations', async ({ open, page, h }) => {
    await open({ workspace: 'empty', locations: 'none', orphans: 'off' })
    const id = await h('append', { type: 'weather', x: 300, y: 150 })
    await expectBlockScreenshot(page, h, id, 'disabled-no-locations.png')
  })

  test('selected', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'action_log', x: 300, y: 150 })

    const { x, y } = await h('blockRect', id)
    await clickAt({ x: x + 12, y: y + 12 })
    await expectBlockScreenshot(page, h, id, 'selected.png')
  })

  test('floating number armed for editing', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'io_math_number', x: 300, y: 150 })

    await clickAt(await h('fieldCenter', id, 'NUM'))
    expect(await h('editorOpen')).toBe(false)
    await expectBlockScreenshot(page, h, id, 'number-armed.png')
  })
})

// long values exercise the truncation and squeezing in app/scripts/hacks.js
test.describe('long values', () => {
  test('long text', async ({ open, page, h }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'io_text', x: 300, y: 150, fields: {
      TEXT: 'This is a very long text value that should be truncated and squeezed to fit',
    } })
    await expectBlockScreenshot(page, h, id, 'long-text.png')
  })

  test('long multiline text', async ({ open, page, h }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'io_text_multiline', x: 300, y: 150, fields: {
      TEXT: [
        'A first line that is quite a bit longer than the field is wide',
        'Second line', 'Third line', 'Fourth line', 'Fifth line is hidden', 'Sixth line too',
      ].join('\n'),
    } })
    await expectBlockScreenshot(page, h, id, 'long-multiline.png')
  })

  test('long feed name', async ({ open, page, h }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'when_data', x: 300, y: 150, fields: {
      FEED_KEY: 'greenhouse.soil-moisture-7',
    } })
    await expectBlockScreenshot(page, h, id, 'long-feed-name.png')
  })

  test('long variable name', async ({ open, page, h }) => {
    await open({ workspace: 'empty', orphans: 'off' })
    const id = await h('append', { type: 'io_variables_set', x: 300, y: 150, fields: {
      VAR: { name: 'average_greenhouse_temperature_over_the_last_hour' },
    } })
    await expectBlockScreenshot(page, h, id, 'long-variable-name.png')
  })
})
