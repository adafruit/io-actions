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

    // Generator now expects a block object with timezoneType
    const mockBlock = {
      timezoneType: 'tz_io_account'
    }
    
    const [result, precedence] = currentTimeDefinition.generators.json(mockBlock)
    const parsedResult = JSON.parse(result)

    assert.equal(precedence, 0)
    assert.exists(parsedResult.currentTime)
    assert.isObject(parsedResult.currentTime)
    assert.deepEqual(parsedResult.currentTime.timezone, { type: 'tz_io_account' })
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

  it("has mutator for timezone configuration", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)
    
    assert.exists(currentTimeDefinition.mutator, 'should have a mutator for timezone settings')
  })

  it("generates JSON with different timezone types", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)
    
    const timezones = [
      { type: 'tz_io_account', description: 'IO Account timezone (default)' },
      { type: 'tz_utc', description: 'UTC timezone' },
      { type: 'tz_device', description: 'Device timezone' },
    ]
    
    for (const tz of timezones) {
      const mockBlock = { timezoneType: tz.type }
      const [result] = currentTimeDefinition.generators.json(mockBlock)
      const parsed = JSON.parse(result)
      
      assert.deepEqual(parsed.currentTime.timezone, { type: tz.type }, 
        `Should generate correct timezone for ${tz.description}`)
    }
  })

  it("defaults to tz_io_account when timezoneType is not set", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)
    
    // Mock block without timezoneType set
    const mockBlock = {}
    const [result] = currentTimeDefinition.generators.json(mockBlock)
    const parsed = JSON.parse(result)
    
    assert.deepEqual(parsed.currentTime.timezone, { type: 'tz_io_account' },
      'Should default to IO Account timezone')
  })

  it("regenerates with timezone from JSON", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)
    
    const blockObject = {
      currentTime: {
        timezone: { type: 'tz_utc' }
      }
    }
    
    const regenerated = currentTimeDefinition.regenerators.json(blockObject)
    
    assert.equal(regenerated.type, 'io_utility_current_time')
    assert.exists(regenerated.extraState)
    assert.equal(regenerated.extraState.timezoneType, 'tz_utc')
  })

  it("regenerates with default timezone when not specified in JSON", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)
    
    const blockObject = {
      currentTime: {}
    }
    
    const regenerated = currentTimeDefinition.regenerators.json(blockObject)
    
    assert.equal(regenerated.type, 'io_utility_current_time')
    assert.exists(regenerated.extraState)
    assert.equal(regenerated.extraState.timezoneType, 'tz_io_account')
  })
})
