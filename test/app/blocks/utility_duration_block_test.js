import { describe, it } from 'node:test'
import { assert } from 'chai'

import durationDef from "#app/blocks/utility/duration.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("Duration Block", () => {
  it("works", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    assert.equal(definition.type, 'io_utility_duration')
  })

  it("exports block JSON with correct structure", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    const blockJSON = definition.toBlocklyJSON()

    assert.exists(blockJSON.message0)
    assert.exists(blockJSON.args0)
    assert.deepEqual(blockJSON.output, ['expression', 'duration'])
    assert.equal(blockJSON.colour, 360)
  })

  it("has AMOUNT input that accepts number blocks", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    const blockJSON = definition.toBlocklyJSON()
    
    const amountArg = blockJSON.args0.find(arg => arg.name === 'AMOUNT')
    assert.exists(amountArg, 'AMOUNT input should exist')
    assert.equal(amountArg.type, 'input_value')
    assert.deepEqual(amountArg.check, ['expression', 'number'])
  })

  it("has UNIT dropdown with all time units", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    const blockJSON = definition.toBlocklyJSON()
    
    // UNIT may be in args1 due to template line breaks
    const allArgs = [...(blockJSON.args0 || []), ...(blockJSON.args1 || [])]
    const unitArg = allArgs.find(arg => arg.name === 'UNIT')
    assert.exists(unitArg, 'UNIT field should exist')
    assert.equal(unitArg.type, 'field_dropdown')
    
    const optionValues = unitArg.options.map(opt => opt[1])
    assert.include(optionValues, 'seconds')
    assert.include(optionValues, 'minutes')
    assert.include(optionValues, 'hours')
    assert.include(optionValues, 'days')
    assert.include(optionValues, 'weeks')
    assert.include(optionValues, 'months')
    assert.include(optionValues, 'years')
    assert.equal(optionValues.length, 7)
  })

  it("generates correct JSON for a duration", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'UNIT') return 'hours'
        return null
      },
      timezoneType: 'tz_io_account'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ number: 2 })
    }
    
    const [result, precedence] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.equal(precedence, 0)
    assert.exists(parsed.duration)
    assert.deepEqual(parsed.duration.amount, { number: 2 })
    assert.equal(parsed.duration.unit, 'hours')
    assert.deepEqual(parsed.duration.timezone, { type: 'tz_io_account' })
  })

  it("generates correct JSON for negative durations", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    // Negative duration for "2 hours ago" or "sunset - 2 hours"
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'UNIT') return 'hours'
        return null
      },
      timezoneType: 'tz_utc'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ number: -2 })
    }
    
    const [result] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.deepEqual(parsed.duration.amount, { number: -2 })
    assert.equal(parsed.duration.unit, 'hours')
  })

  it("regenerates correctly from JSON", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    const blockObject = {
      duration: {
        amount: { number: 7 },
        unit: 'days',
        timezone: { type: 'tz_utc' }
      }
    }
    
    const mockHelpers = {
      expressionToBlock: (expr, opts) => ({ block: { type: 'io_math_number' } })
    }
    
    const regenerated = definition.regenerators.json(blockObject, mockHelpers)
    
    assert.equal(regenerated.type, 'io_utility_duration')
    assert.equal(regenerated.fields.UNIT, 'days')
    assert.exists(regenerated.inputs.AMOUNT)
    assert.equal(regenerated.extraState.timezoneType, 'tz_utc')
  })

  it("throws error when regenerating without duration data", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    assert.throws(() => {
      definition.regenerators.json({}, {})
    }, /No duration data/)
  })

  it("has mutator for timezone configuration", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    assert.exists(definition.mutator, 'should have a mutator for timezone settings')
  })

  it("defaults to tz_io_account when timezoneType is not set", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'UNIT') return 'days'
        return null
      }
      // timezoneType not set
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ number: 1 })
    }
    
    const [result] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.deepEqual(parsed.duration.timezone, { type: 'tz_io_account' })
  })
})


describe("Duration Block - Practical Use Cases", () => {
  it("can represent 'sunset minus 2 hours' duration", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'UNIT') return 'hours'
        return null
      },
      timezoneType: 'tz_io_account'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ number: -2 })
    }
    
    const [result] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.deepEqual(parsed.duration.amount, { number: -2 })
    assert.equal(parsed.duration.unit, 'hours')
  })

  it("can represent 'next week' duration", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'UNIT') return 'weeks'
        return null
      },
      timezoneType: 'tz_io_account'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ number: 1 })
    }
    
    const [result] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.deepEqual(parsed.duration.amount, { number: 1 })
    assert.equal(parsed.duration.unit, 'weeks')
  })

  it("can represent '30 days from now' duration", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'UNIT') return 'days'
        return null
      },
      timezoneType: 'tz_io_account'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ number: 30 })
    }
    
    const [result] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.deepEqual(parsed.duration.amount, { number: 30 })
    assert.equal(parsed.duration.unit, 'days')
  })

  it("can represent '1 year anniversary' duration", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'UNIT') return 'years'
        return null
      },
      timezoneType: 'tz_utc'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ number: 1 })
    }
    
    const [result] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.deepEqual(parsed.duration.amount, { number: 1 })
    assert.equal(parsed.duration.unit, 'years')
  })

  it("can represent '90 seconds' fine-grained duration", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'UNIT') return 'seconds'
        return null
      },
      timezoneType: 'tz_io_account'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ number: 90 })
    }
    
    const [result] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.deepEqual(parsed.duration.amount, { number: 90 })
    assert.equal(parsed.duration.unit, 'seconds')
  })

  it("can accept expressions as the amount (e.g., feed value)", () => {
    const definition = BlockDefinition.parseRawDefinition(durationDef)
    
    // Simulate a feed value being used as the duration amount
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'UNIT') return 'minutes'
        return null
      },
      timezoneType: 'tz_io_account'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ feedValue: { feed: 'delay-time' } })
    }
    
    const [result] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.deepEqual(parsed.duration.amount, { feedValue: { feed: 'delay-time' } })
    assert.equal(parsed.duration.unit, 'minutes')
  })
})
