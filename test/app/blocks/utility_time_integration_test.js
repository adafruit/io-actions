import { describe, it } from 'node:test'
import { assert } from 'chai'

import timeBlockDefObject from "#app/blocks/utility/time.js"
import currentTimeBlockDefObject from "#app/blocks/utility/current_time.js"
import compareBlockDefObject from "#app/blocks/math/compare.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("Time Blocks Integration", () => {
  it("Time and Current Time blocks have compatible output types", () => {
    const
      timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject),
      currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)

    // Both should output the same types for compatibility
    assert.deepEqual(timeDefinition.connections.output, currentTimeDefinition.connections.output)
    assert.includeMembers(timeDefinition.connections.output, ['expression', 'time'])
  })

  it("Time blocks can be used with comparison blocks", () => {
    const
      timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject),
      currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject),
      compareDefinition = BlockDefinition.parseRawDefinition(compareBlockDefObject)

    // Verify that time blocks output 'expression' type which compare block accepts
    assert.include(timeDefinition.connections.output, 'expression')
    assert.include(currentTimeDefinition.connections.output, 'expression')
    
    // Compare block should accept 'expression' inputs
    assert.equal(compareDefinition.inputs.A.check, 'expression')
    assert.equal(compareDefinition.inputs.B.check, 'expression')
  })

  it("generates JSON that can be compared mathematically", () => {
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject)
    
    // Create mock blocks for different times
    const mockEarlyTime = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '09'
        if (fieldName === 'MINUTE') return '00'
        return null
      }
    }
    
    const mockLateTime = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '17'
        if (fieldName === 'MINUTE') return '30'
        return null
      }
    }
    
    const [earlyResult] = timeDefinition.generators.json(mockEarlyTime)
    const [lateResult] = timeDefinition.generators.json(mockLateTime)
    
    const parsedEarly = JSON.parse(earlyResult)
    const parsedLate = JSON.parse(lateResult)
    
    // Verify mathematical comparison works
    assert.isTrue(parsedEarly.time.value < parsedLate.time.value, '09:00 should be less than 17:30')
    assert.equal(parsedEarly.time.value, 540) // 9 * 60 = 540
    assert.equal(parsedLate.time.value, 1050) // 17 * 60 + 30 = 1050
  })

  it("Current Time block generates compatible JSON structure", () => {
    const currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)
    
    const [result] = currentTimeDefinition.generators.json()
    const parsedResult = JSON.parse(result)
    
    // Should have currentTime object (structure will be handled by backend)
    assert.exists(parsedResult.currentTime)
    assert.isObject(parsedResult.currentTime)
  })

  it("supports common time comparison scenarios", () => {
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject)
    
    // Business hours scenario: 9 AM to 5 PM
    const startHours = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '09'
        if (fieldName === 'MINUTE') return '00'
        return null
      }
    }
    
    const endHours = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '17'
        if (fieldName === 'MINUTE') return '00'
        return null
      }
    }
    
    const lunch = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '12'
        if (fieldName === 'MINUTE') return '00'
        return null
      }
    }
    
    const [startResult] = timeDefinition.generators.json(startHours)
    const [endResult] = timeDefinition.generators.json(endHours)
    const [lunchResult] = timeDefinition.generators.json(lunch)
    
    const startTime = JSON.parse(startResult).time.value
    const endTime = JSON.parse(endResult).time.value
    const lunchTime = JSON.parse(lunchResult).time.value
    
    // Verify logical time ordering
    assert.isTrue(startTime < lunchTime, 'Start time should be before lunch')
    assert.isTrue(lunchTime < endTime, 'Lunch should be before end time')
    assert.isTrue(startTime < endTime, 'Start should be before end')
    
    // Verify specific values for common times
    assert.equal(startTime, 540) // 9:00 = 9 * 60
    assert.equal(lunchTime, 720) // 12:00 = 12 * 60  
    assert.equal(endTime, 1020) // 17:00 = 17 * 60
  })

  it("handles edge cases correctly", () => {
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject)
    
    // Midnight
    const midnight = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '00'
        if (fieldName === 'MINUTE') return '00'
        return null
      }
    }
    
    // End of day
    const endOfDay = {
      getFieldValue: (fieldName) => {
        if (fieldName === 'HOUR') return '23'
        if (fieldName === 'MINUTE') return '59'
        return null
      }
    }
    
    const [midnightResult] = timeDefinition.generators.json(midnight)
    const [endOfDayResult] = timeDefinition.generators.json(endOfDay)
    
    const midnightValue = JSON.parse(midnightResult).time.value
    const endOfDayValue = JSON.parse(endOfDayResult).time.value
    
    // Verify edge case values
    assert.equal(midnightValue, 0, 'Midnight should be 0')
    assert.equal(endOfDayValue, 1439, 'End of day should be 1439 minutes')
    assert.isTrue(midnightValue < endOfDayValue, 'Midnight should be less than end of day')
  })

  it("both blocks belong to the same category", () => {
    const
      timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDefObject),
      currentTimeDefinition = BlockDefinition.parseRawDefinition(currentTimeBlockDefObject)

    // Both blocks should be in Time category and have same color
    assert.equal(timeDefinition.color, 360)
    assert.equal(currentTimeDefinition.color, 360)
  })
})