import { describe, it } from 'node:test'

import DefinitionSet from "#src/definitions/definition_set.js"


describe("Block Snapshots", async () => {
  const definitionSet = await DefinitionSet.load();

  describe("Blockly JSON", () => {
    // load all current blocks
    definitionSet.blocks.forEach(blockDefinition => {
      // define a test for each block
      it(`${blockDefinition.type}`, ({ assert: { snapshot }}) => {
        // test merely checks the json representation
        snapshot(blockDefinition.toBlocklyJSON())
      })
    })
  })
})
