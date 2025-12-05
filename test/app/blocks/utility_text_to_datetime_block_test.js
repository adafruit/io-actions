import { describe, it } from 'node:test'
import { assert } from 'chai'

import textToDatetimeBlockDefObject from "#app/blocks/utility/text_to_datetime.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("Utility Text to DateTime Block", () => {
  it("works", () => {
    const definition = BlockDefinition.parseRawDefinition(textToDatetimeBlockDefObject)

    assert.equal(definition.type, 'io_utility_text_to_datetime')
  })

  it("exports block JSON", () => {
    const
      definition = BlockDefinition.parseRawDefinition(textToDatetimeBlockDefObject),
      blockJSON = definition.toBlocklyJSON()

    // contains message and args
    assert.exists(blockJSON.message0)
    assert.exists(blockJSON.args0)

    // has proper output types - outputs time type for use with other time blocks
    assert.deepEqual(blockJSON.output, ['expression', 'time'])

    // has correct color
    assert.equal(blockJSON.colour, 20)
    
    // has mutator defined
    assert.exists(blockJSON.mutator)
  })

  it("exports instance JSON with correct type", () => {
    const
      definition = BlockDefinition.parseRawDefinition(textToDatetimeBlockDefObject),
      instanceJson = definition.toBlocklyInstanceJSON()

    // has correct type
    assert.equal(instanceJson.type, 'io_utility_text_to_datetime')
  })

  it("has INPUT that accepts string blocks", () => {
    const definition = BlockDefinition.parseRawDefinition(textToDatetimeBlockDefObject)

    // Should accept expression and string types (what text blocks output)
    assert.deepEqual(definition.inputs.INPUT.check, ['expression', 'string'])
    
    // Should have a shadow block with sample ISO date
    assert.exists(definition.inputs.INPUT.shadow)
    assert.equal(definition.inputs.INPUT.shadow.type, 'io_text')
    assert.equal(definition.inputs.INPUT.shadow.fields.TEXT, '2024-01-01T12:00:00Z')
  })

  it("generates correct JSON output", () => {
    const definition = BlockDefinition.parseRawDefinition(textToDatetimeBlockDefObject)

    // Mock block object with mutator state
    const mockBlock = {
      timezoneType: 'tz_io_server',
      formatType: 'fmt_custom'
    }

    // Mock generator
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ text: '2024-06-15T09:30:00Z' })
    }

    const result = definition.generators.json(mockBlock, mockGenerator)

    assert.exists(result.textToDatetime)
    assert.exists(result.textToDatetime.timezone)
    assert.equal(result.textToDatetime.timezone.type, 'tz_io_server')
    assert.exists(result.textToDatetime.format)
    assert.equal(result.textToDatetime.format.type, 'fmt_custom')
  })

  it("regenerates correctly from JSON", () => {
    const definition = BlockDefinition.parseRawDefinition(textToDatetimeBlockDefObject)

    const blockObject = {
      textToDatetime: {
        input: { text: '2024-12-25T00:00:00Z' },
        timezone: { type: 'tz_preset' },
        format: { type: 'fmt_iso8601' }
      }
    }

    // Mock helpers
    const mockHelpers = {
      expressionToBlock: (expr, opts) => ({ block: { type: opts.shadow?.type || opts.shadow } })
    }

    const regenerated = definition.regenerators.json(blockObject, mockHelpers)

    assert.equal(regenerated.type, 'io_utility_text_to_datetime')
    assert.exists(regenerated.extraState)
    assert.equal(regenerated.extraState.timezoneType, 'tz_preset')
    assert.equal(regenerated.extraState.formatType, 'fmt_iso8601')
  })

  it("throws error when regenerating without textToDatetime data", () => {
    const definition = BlockDefinition.parseRawDefinition(textToDatetimeBlockDefObject)

    const blockObject = {}
    const mockHelpers = { expressionToBlock: () => ({}) }

    assert.throws(() => {
      definition.regenerators.json(blockObject, mockHelpers)
    }, Error, "No textToDatetime data for io_utility_text_to_datetime regenerator")
  })

  it("has mutator with timezone and format flyout blocks", () => {
    const definition = BlockDefinition.parseRawDefinition(textToDatetimeBlockDefObject)

    assert.exists(definition.mutator)
    assert.exists(definition.mutator.flyoutBlockTypes)
    
    // Should include timezone option blocks
    assert.include(definition.mutator.flyoutBlockTypes, 'tz_io_account')
    assert.include(definition.mutator.flyoutBlockTypes, 'tz_io_server')
    assert.include(definition.mutator.flyoutBlockTypes, 'tz_preset')
    
    // Should include format option blocks
    assert.include(definition.mutator.flyoutBlockTypes, 'fmt_iso8601')
    assert.include(definition.mutator.flyoutBlockTypes, 'fmt_rfc2822')
    assert.include(definition.mutator.flyoutBlockTypes, 'fmt_custom')
  })

  it("output is compatible with time block inputs", () => {
    const definition = BlockDefinition.parseRawDefinition(textToDatetimeBlockDefObject)

    // Should output same types as other time blocks for chaining
    const outputTypes = definition.connections.output
    assert.includeMembers(outputTypes, ['expression', 'time'])
  })
})
