import { test, expect } from '../helpers.js'


test('toolbox shows every category from the toolbox definition', async ({ open, page, h }) => {
  await open()

  const expected = await page.evaluate(() =>
    window.harness.toolbox.contents.filter(item => item.kind === 'category').map(c => c.name))

  expect(await h('categoryNames')).toEqual(expected)
})

test('each category opens a flyout with its blocks, in order', async ({ open, page, h, clickAt }) => {
  await open()

  const categories = await page.evaluate(() =>
    window.harness.toolbox.contents.filter(item => item.kind === 'category'))

  for(const category of categories) {
    await clickAt(await h('categoryCenter', category.name))
    await expect.poll(() => h('flyoutVisible'), category.name).toBe(true)

    // dynamic categories build their contents at runtime
    if(category.custom) { continue }

    const expectedTypes = category.contents.filter(item => item.kind === 'block').map(item => item.type)
    expect(await h('flyoutBlockTypes'), category.name).toEqual(expectedTypes)
  }
})

test('clicking the selected category again closes its flyout', async ({ open, h, clickAt }) => {
  await open()

  await clickAt(await h('categoryCenter', 'Logic'))
  await expect.poll(() => h('flyoutVisible')).toBe(true)

  await clickAt(await h('categoryCenter', 'Logic'))
  await expect.poll(() => h('flyoutVisible')).toBe(false)
})

test('dragging a block out of a flyout adds it to the workspace', async ({ open, page, h, clickAt }) => {
  await open()

  await clickAt(await h('categoryCenter', 'Logic'))
  await expect.poll(() => h('flyoutVisible')).toBe(true)

  const from = await h('flyoutBlockCenter', 'io_logic_boolean')
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(from.x + 150, from.y + 250, { steps: 12 })
  await page.mouse.move(from.x + 300, from.y + 400, { steps: 12 })
  await page.mouse.up()

  await expect.poll(() => h('topBlockTypes')).toContain('io_logic_boolean')
  expect(await h('flyoutVisible')).toBe(false)
})

test.describe('variables category', () => {
  test('offers a create button when there are no variables', async ({ open, h, clickAt }) => {
    await open()

    await clickAt(await h('categoryCenter', 'Variables'))
    await expect.poll(() => h('flyoutVisible')).toBe(true)

    expect((await h('flyoutButtonTexts')).map(text => text.trim())).toEqual(['Create New Variable'])
    expect(await h('flyoutBlockTypes')).toEqual([])
  })

  test('creating a variable adds set/get blocks for it', async ({ open, page, h, clickAt }) => {
    await open()

    page.once('dialog', dialog => dialog.accept('temperature'))

    await clickAt(await h('categoryCenter', 'Variables'))
    await expect.poll(() => h('flyoutVisible')).toBe(true)
    await clickAt(await h('flyoutButtonCenter', 'Create New Variable'))

    await expect.poll(() => h('variableNames')).toEqual(['temperature'])
    // the open flyout refreshes with the new variable's blocks
    await expect.poll(() => h('flyoutBlockTypes')).toEqual(['io_variables_set', 'io_variables_get'])
  })
})
