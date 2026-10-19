// One baseline per block definition, in its default state.
import DefinitionSet from '#src/definitions/definition_set.js'
import { test, expect, skipUnlessInContainer } from '../helpers.js'


skipUnlessInContainer(test)

const { blocks } = await DefinitionSet.load()

for(const { type } of blocks) {
  test(type, async ({ open, page, h }) => {
    await open({ workspace: 'all', toolbox: 'off', orphans: 'off' })

    const id = `block-type-${type}`
    // power-up blocks disable themselves without a location; show them enabled
    // here (the disabled look has its own baseline in states.spec.js)
    await h('forceEnable', id)

    const clip = await h('isolate', id)
    await expect(page).toHaveScreenshot(`${type}.png`, { clip })
  })
}
