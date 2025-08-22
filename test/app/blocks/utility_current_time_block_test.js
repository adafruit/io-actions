import { describe, it } from 'node:test'
import { assert } from 'chai'

import currentTimeBlockDefObject from "#app/blocks/utility/current_time.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("Utility Current Time Block", () => {
  it("works", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)

    assert.equal(currentTimeDefinition.type, 'io_utility_current_time')
  })

  it("exports block JSON", () => {
    const
      currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject),
      currentTimeBlockJSON = currentTimeDefinition.toBlocklyJSON()

    // contains message and args
    assert.exists(currentTimeBlockJSON.message0)
    assert.exists(currentTimeBlockJSON.args0)

    // has proper output types
    assert.deepEqual(currentTimeBlockJSON.output, ['expression', 'time'])

    // has correct color
    assert.equal(currentTimeBlockJSON.colour, 360)
  })

  it("exports instance JSON with correct type", () => {
    const
      currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject),
      currentTimeInstanceJson = currentTimeDefinition.toBlocklyInstanceJSON()

    // has correct type
    assert.equal(currentTimeInstanceJson.type, 'io_utility_current_time')

    // no fields needed for current time block
    assert.notExists(currentTimeInstanceJson.fields)
  })

  it("generates correct JSON output", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)

    const [result, precedence] = currentTimeDefinition.generators.json()
    const parsedResult = JSON.parse(result)

    assert.equal(precedence, 0)
    assert.exists(parsedResult.currentTime)
    assert.isObject(parsedResult.currentTime)
  })

  it("regenerates correctly from JSON", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)

    const blockObject = {
      currentTime: {}
    }

    const regenerated = currentTimeDefinition.regenerators.json(blockObject)

    assert.equal(regenerated.type, 'io_utility_current_time')
    assert.notExists(regenerated.fields) // No fields needed
  })

  it("throws error when regenerating without currentTime data", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)

    const blockObject = {}

    assert.throws(() => {
      currentTimeDefinition.regenerators.json(blockObject)
    }, Error, "No currentTime data for io_utility_current_time regenerator")
  })

  it("has compatible output type with time blocks", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)

    // Should have same output types as regular time blocks for compatibility
    const outputTypes = currentTimeDefinition.connections.output
    assert.includeMembers(outputTypes, ['expression', 'time'])
  })
})
