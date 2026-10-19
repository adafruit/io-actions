import { test, expect, PARK } from '../helpers.js'


test.describe('fields', () => {
  test('text field edits via the keyboard', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'io_text', x: 300, y: 200 })

    await clickAt(await h('fieldCenter', id, 'TEXT'))
    await expect.poll(() => h('editorOpen')).toBe(true)

    await page.keyboard.type('hello world')
    await page.keyboard.press('Enter')

    await expect.poll(() => h('editorOpen')).toBe(false)
    expect(await h('fieldValue', id, 'TEXT')).toBe('hello world')
  })

  test('multiline field keeps newlines', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'io_text_multiline', x: 300, y: 200 })

    await clickAt(await h('fieldCenter', id, 'TEXT'))
    await expect.poll(() => h('editorOpen')).toBe(true)

    await page.keyboard.type('line one')
    await page.keyboard.press('Enter')
    await page.keyboard.type('line two')
    await page.mouse.click(PARK.x, PARK.y)

    await expect.poll(() => h('editorOpen')).toBe(false)
    expect(await h('fieldValue', id, 'TEXT')).toBe('line one\nline two')
  })

  test('dropdown opens and selecting an option changes the value', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'io_logic_compare', x: 300, y: 200 })
    const before = await h('fieldValue', id, 'OP')

    await clickAt(await h('fieldCenter', id, 'OP'))
    await expect.poll(() => h('dropdownOpen')).toBe(true)

    await page.locator('.blocklyDropDownDiv .blocklyMenuItem').nth(1).click()

    await expect.poll(() => h('dropdownOpen')).toBe(false)
    expect(await h('fieldValue', id, 'OP')).not.toBe(before)
  })

  test('feed dropdown lists the feeds from extension data', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'when_data', x: 300, y: 200 })

    await clickAt(await h('fieldCenter', id, 'FEED_KEY'))
    await expect.poll(() => h('dropdownOpen')).toBe(true)

    const longName = await page.evaluate(() => window.harness.LONG_FEED_NAME)
    await expect(page.locator('.blocklyDropDownDiv .blocklyMenuItem')).toHaveText([
      'Default: Temperature', 'Default: Humidity', longName,
    ])
  })

  test('checkbox toggles on click', async ({ open, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'action_webhook', x: 300, y: 200 })
    expect(await h('fieldValue', id, 'FORM_ENCODE')).toBe('FALSE')

    await clickAt(await h('fieldCenter', id, 'FORM_ENCODE'))
    await expect.poll(() => h('fieldValue', id, 'FORM_ENCODE')).toBe('TRUE')

    await clickAt(await h('fieldCenter', id, 'FORM_ENCODE'))
    await expect.poll(() => h('fieldValue', id, 'FORM_ENCODE')).toBe('FALSE')
  })
})

// app/scripts/hacks.js: floating number blocks select on the first click and
// only open the editor on the second, so they can be selected and deleted
test.describe('floating number blocks', () => {
  test('first click selects, second click edits', async ({ open, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'io_math_number', x: 300, y: 200 })
    const field = await h('fieldCenter', id, 'NUM')

    await clickAt(field)
    expect(await h('editorOpen')).toBe(false)

    await clickAt(field)
    await expect.poll(() => h('editorOpen')).toBe(true)
  })

  test('deselecting re-arms the two-click behavior', async ({ open, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'io_math_number', x: 300, y: 200 })
    const field = await h('fieldCenter', id, 'NUM')

    await clickAt(field)
    await clickAt(field)
    await expect.poll(() => h('editorOpen')).toBe(true)

    // click empty workspace: closes the editor and clears the selection
    await clickAt(PARK)
    await expect.poll(() => h('editorOpen')).toBe(false)

    await clickAt(field)
    expect(await h('editorOpen')).toBe(false)
  })

  test('connected number blocks edit on the first click', async ({ open, h, clickAt }) => {
    await open({ workspace: 'empty' })
    await h('append', {
      type: 'io_logic_compare', x: 300, y: 200,
      inputs: { A: { block: { type: 'io_math_number', id: 'num' } } },
    })

    await clickAt(await h('fieldCenter', 'num', 'NUM'))
    await expect.poll(() => h('editorOpen')).toBe(true)
  })
})

test.describe('keyboard', () => {
  test('Delete removes the selected block and undo restores it', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'io_math_number', x: 300, y: 200 })

    // first click selects without opening the editor
    await clickAt(await h('fieldCenter', id, 'NUM'))
    await page.keyboard.press('Delete')
    await expect.poll(() => h('exists', id)).toBe(false)
    // input outranks timers in chromium: wait until the delete is undoable
    await expect.poll(() => h('lastUndoEventType')).toBe('delete')

    await page.keyboard.press('ControlOrMeta+z')
    await expect.poll(() => h('exists', id)).toBe(true)
  })
})

test.describe('context menu', () => {
  test('matches the io-rails configuration', async ({ open, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'action_log', x: 300, y: 200 })

    await clickAt(await h('blockCenter', id), { button: 'right' })
    await expect.poll(() => h('contextMenuItems')).toContain('Duplicate')

    const items = await h('contextMenuItems')
    // io-rails unregisters these
    expect(items).not.toContain('Add Comment')
    expect(items).not.toContain('Disable Block')
  })

  test('duplicate copies the block', async ({ open, page, h, clickAt }) => {
    await open({ workspace: 'empty' })
    const id = await h('append', { type: 'action_log', x: 300, y: 200 })

    await clickAt(await h('blockCenter', id), { button: 'right' })
    await page.locator('.blocklyContextMenu .blocklyMenuItem', { hasText: 'Duplicate' }).click()

    await expect.poll(() => h('topBlockTypes')).toEqual(['action_log', 'action_log'])
  })
})
