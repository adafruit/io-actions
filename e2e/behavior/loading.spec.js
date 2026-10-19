import { test, expect } from '../helpers.js'


test('default workspace loads just the root block', async ({ open, h }) => {
  await open()

  expect(await h('topBlockTypes')).toEqual(['action_root'])
})

test('every block definition loads onto a workspace', async ({ open, h }) => {
  await open({ workspace: 'all', toolbox: 'off' })

  const
    expected = await h('allBlockTypes'),
    actual = await h('topBlockTypes')

  expect(actual.toSorted()).toEqual(expected.toSorted())
})
