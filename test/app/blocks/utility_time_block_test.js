import { describe, it } from 'node:test'
import { assert } from 'chai'

import timeBlockDefObject from "#app/blocks/utility/time.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("Utility Time Block", () => {
  it("works", () => {
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject)

    assert.equal(timeDefinition.type, 'io_utility_time')
  })

  it("exports block JSON", () => {
    const
      timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject),
      timeBlockJSON = timeDefinition.toBlocklyJSON()

    // contains message and args
    assert.exists(timeBlockJSON.message0)
    assert.exists(timeBlockJSON.args0)

    // has proper output types
    assert.deepEqual(timeBlockJSON.output, ['expression', 'time'])
    
    // has correct color
    assert.equal(timeBlockJSON.colour, 360)
  })

  it("exports instance JSON with correct type", () => {
    const
      timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject),
      timeInstanceJson = timeDefinition.toBlocklyInstanceJSON()

    // has correct type
    assert.equal(timeInstanceJson.type, 'io_utility_time')
    
    // fields are not included in instance JSON by default for dropdown fields
    assert.notExists(timeInstanceJson.fields)
  })

  it("generates correct JSON output", () => {
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject)
    
    // Mock block object
    const mockBlock = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '14'
        if (fieldName === 'MINUTE') return '30'
        return null
      }
    }
    
    const [result, precedence] = timeDefinition.generators.json(mockBlock)
    const parsedResult = JSON.parse(result)
    
    assert.equal(precedence, 0)
    assert.exists(parsedResult.time)
    assert.equal(parsedResult.time.display, '14:30')
    assert.equal(parsedResult.time.value, 870) // 14 * 60 + 30 = 870 minutes since midnight
  })

  it("regenerates correctly from JSON", () => {
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject)
    
    const blockObject = {
      time: {
        display: '09:15',
        value: 555 // 9 * 60 + 15 = 555 minutes since midnight
      }
    }
    
    const regenerated = timeDefinition.regenerators.json(blockObject)
    
    assert.equal(regenerated.type, 'io_utility_time')
    assert.equal(regenerated.fields.HOUR, '09')
    assert.equal(regenerated.fields.MINUTE, '15')
  })

  it("handles edge cases correctly", () => {
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject)
    
    // Test midnight
    const mockBlockMidnight = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '00'
        if (fieldName === 'MINUTE') return '00'
        return null
      }
    }
    
    const [midnightResult] = timeDefinition.generators.json(mockBlockMidnight)
    const parsedMidnight = JSON.parse(midnightResult)
    
    assert.equal(parsedMidnight.time.display, '00:00')
    assert.equal(parsedMidnight.time.value, 0)
    
    // Test end of day
    const mockBlockEndDay = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '23'
        if (fieldName === 'MINUTE') return '59'
        return null
      }
    }
    
    const [endDayResult] = timeDefinition.generators.json(mockBlockEndDay)
    const parsedEndDay = JSON.parse(endDayResult)
    
    assert.equal(parsedEndDay.time.display, '23:59')
    assert.equal(parsedEndDay.time.value, 1439) // 23 * 60 + 59 = 1439 minutes since midnight
  })

  it("integrates correctly with comparison blocks", () => {
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject)
    
    // Test that time blocks can be compared with each other
    const mockBlockA = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '09'
        if (fieldName === 'MINUTE') return '30'
        return null
      }
    }
    
    const mockBlockB = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '17'
        if (fieldName === 'MINUTE') return '45'
        return null
      }
    }
    
    const [resultA] = timeDefinition.generators.json(mockBlockA)
    const [resultB] = timeDefinition.generators.json(mockBlockB)
    
    const parsedA = JSON.parse(resultA)
    const parsedB = JSON.parse(resultB)
    
    // Verify that the numeric values can be compared
    assert.isTrue(parsedA.time.value < parsedB.time.value, '09:30 should be less than 17:45')
    assert.equal(parsedA.time.value, 570) // 9 * 60 + 30
    assert.equal(parsedB.time.value, 1065) // 17 * 60 + 45
    
    // Verify display formats are correct
    assert.equal(parsedA.time.display, '09:30')
    assert.equal(parsedB.time.display, '17:45')
  })
})