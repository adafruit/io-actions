import { test, expect } from '../helpers.js'


// build a small action: when a feed gets data, send an email and log a value
const buildAction = async h => {
  const root = await h('rootId')

  const trigger = await h('append', { type: 'when_data', x: 600, y: 100 })
  await h('connect', root, 'TRIGGERS', trigger)

  const email = await h('append', {
    type: 'action_email', x: 600, y: 300,
    inputs: {
      SUBJECT: { block: { type: 'io_text', fields: { TEXT: 'Hello from IO' } } },
      BODY: { block: { type: 'io_text_multiline', fields: { TEXT: 'line one\nline two' } } },
    },
    next: { block: {
      type: 'action_log',
      inputs: { EXPRESSION: { block: { type: 'io_math_number', fields: { NUM: 42 } } } },
    } },
  })
  await h('connect', root, 'ACTIONS', email)
}

const lastJson = page => page.evaluate(() => window.harness.lastJson)

test('editing the workspace emits bytecode through onJsonUpdated', async ({ open, page, h }) => {
  await open()
  await buildAction(h)

  await expect.poll(async () => JSON.parse(await lastJson(page) || '{}').expressions?.length).toBe(2)

  const bytecode = JSON.parse(await lastJson(page))
  expect(bytecode.triggers).toHaveLength(1)
  expect(JSON.stringify(bytecode)).toContain('Hello from IO')
})

test('bytecode loads back into an identical workspace', async ({ open, page, h }) => {
  await open()
  await buildAction(h)
  await expect.poll(async () => JSON.parse(await lastJson(page) || '{}').expressions?.length).toBe(2)

  const original = await lastJson(page)

  // io-rails loads saved actions with inject(_, { workspaceData: bytecode })
  await page.evaluate(json => window.harness.reinject({ workspaceData: json }), original)

  expect(await h('topBlockTypes')).toEqual(['action_root'])
  expect(JSON.parse(await h('bytecode'))).toEqual(JSON.parse(original))
})

test('workspace serialization round-trips', async ({ open, page, h }) => {
  await open()
  await buildAction(h)

  const saved = await h('saveWorkspace')
  await page.evaluate(json => window.harness.reinject({ workspaceJson: json }), saved)

  expect(await h('saveWorkspace')).toEqual(saved)
})
