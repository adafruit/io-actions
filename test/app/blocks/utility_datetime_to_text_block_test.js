import { describe, it } from 'node:test'
import { assert } from 'chai'

import datetimeToTextBlockDefObject from "#app/blocks/utility/datetime_to_text.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("Utility DateTime to Text Block", () => {
  it("works", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeToTextBlockDefObject)

    assert.equal(definition.type, 'io_utility_datetime_to_text')
  })

  it("exports block JSON", () => {
    const
      definition = BlockDefinition.parseRawDefinition(datetimeToTextBlockDefObject),
      blockJSON = definition.toBlocklyJSON()

    // contains message and args
    assert.exists(blockJSON.message0)
    assert.exists(blockJSON.args0)

    // has proper output type - outputs String for text formatting
    assert.equal(blockJSON.output, 'String')

    // has correct color
    assert.equal(blockJSON.colour, 20)
    
    // has mutator defined
    assert.exists(blockJSON.mutator)
  })

  it("exports instance JSON with correct type", () => {
    const
      definition = BlockDefinition.parseRawDefinition(datetimeToTextBlockDefObject),
      instanceJson = definition.toBlocklyInstanceJSON()

    // has correct type
    assert.equal(instanceJson.type, 'io_utility_datetime_to_text')
  })

  it("has INPUT that accepts time blocks", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeToTextBlockDefObject)

    // Should accept expression and time types (what time blocks output)
    assert.deepEqual(definition.inputs.INPUT.check, ['expression', 'time'])
    
    // Should have a shadow block
    assert.equal(definition.inputs.INPUT.shadow, 'io_utility_current_time')
  })

  it("generates correct JSON output", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeToTextBlockDefObject)

    // Mock block object with mutator state
    const mockBlock = {
      timezoneType: 'tz_preset',
      formatType: 'fmt_iso8601'
    }

    // Mock generator
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ currentTime: {} })
    }

    const result = definition.generators.json(mockBlock, mockGenerator)

    assert.exists(result.datetimeToText)
    assert.exists(result.datetimeToText.timezone)
    assert.equal(result.datetimeToText.timezone.type, 'tz_preset')
    assert.exists(result.datetimeToText.format)
    assert.equal(result.datetimeToText.format.type, 'fmt_iso8601')
  })

  it("regenerates correctly from JSON", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeToTextBlockDefObject)

    const blockObject = {
      datetimeToText: {
        input: { currentTime: {} },
        timezone: { type: 'tz_io_account' },
        format: { type: 'fmt_rfc2822' }
      }
    }

    // Mock helpers
    const mockHelpers = {
      expressionToBlock: (expr, opts) => ({ block: { type: opts.shadow } })
    }

    const regenerated = definition.regenerators.json(blockObject, mockHelpers)

    assert.equal(regenerated.type, 'io_utility_datetime_to_text')
    assert.exists(regenerated.extraState)
    assert.equal(regenerated.extraState.timezoneType, 'tz_io_account')
    assert.equal(regenerated.extraState.formatType, 'fmt_rfc2822')
  })

  it("throws error when regenerating without datetimeToText data", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeToTextBlockDefObject)

    const blockObject = {}
    const mockHelpers = { expressionToBlock: () => ({}) }

    assert.throws(() => {
      definition.regenerators.json(blockObject, mockHelpers)
    }, Error, "No datetimeToText data for io_utility_datetime_to_text regenerator")
  })

  it("has mutator with timezone and format flyout blocks", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeToTextBlockDefObject)

    assert.exists(definition.mutator)
    assert.exists(definition.mutator.flyoutBlockTypes)
    
    // Should include timezone option blocks
    assert.include(definition.mutator.flyoutBlockTypes, 'tz_io_account')
    assert.include(definition.mutator.flyoutBlockTypes, 'tz_preset')
    
    // Should include format option blocks
    assert.include(definition.mutator.flyoutBlockTypes, 'fmt_iso8601')
    assert.include(definition.mutator.flyoutBlockTypes, 'fmt_custom')
  })
})
