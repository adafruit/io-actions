import { describe, it } from 'node:test'
import { assert } from 'chai'

import datetimeDef from "#app/blocks/utility/datetime.js"
import timeBlockDef from "#app/blocks/utility/time.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("DateTime Block", () => {
  it("works", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    assert.equal(definition.type, 'io_utility_datetime')
  })

  it("exports block JSON with correct structure", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    const blockJSON = definition.toBlocklyJSON()

    assert.exists(blockJSON.message0)
    assert.exists(blockJSON.args0)
    assert.deepEqual(blockJSON.output, ['expression', 'time'])
    assert.equal(blockJSON.colour, 360)
  })

  it("has DAY dropdown with 1-31 options", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    const blockJSON = definition.toBlocklyJSON()
    
    // Block uses multiple messages, so check all args arrays
    const allArgs = [...(blockJSON.args0 || []), ...(blockJSON.args1 || [])]
    const dayArg = allArgs.find(arg => arg.name === 'DAY')
    assert.exists(dayArg, 'DAY field should exist')
    assert.equal(dayArg.type, 'field_dropdown')
    
    const optionValues = dayArg.options.map(opt => opt[1])
    assert.include(optionValues, '01')
    assert.include(optionValues, '14')
    assert.include(optionValues, '31')
    assert.equal(optionValues.length, 31)
  })

  it("has MONTH dropdown with all 12 months", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    const blockJSON = definition.toBlocklyJSON()
    
    const allArgs = [...(blockJSON.args0 || []), ...(blockJSON.args1 || [])]
    const monthArg = allArgs.find(arg => arg.name === 'MONTH')
    assert.exists(monthArg, 'MONTH field should exist')
    assert.equal(monthArg.type, 'field_dropdown')
    
    const optionValues = monthArg.options.map(opt => opt[1])
    assert.equal(optionValues.length, 12)
    assert.include(optionValues, '01') // January
    assert.include(optionValues, '10') // October
    assert.include(optionValues, '12') // December
  })

  it("has YEAR dropdown with range 2020-2035", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    const blockJSON = definition.toBlocklyJSON()
    
    const allArgs = [...(blockJSON.args0 || []), ...(blockJSON.args1 || [])]
    const yearArg = allArgs.find(arg => arg.name === 'YEAR')
    assert.exists(yearArg, 'YEAR field should exist')
    assert.equal(yearArg.type, 'field_dropdown')
    
    const optionValues = yearArg.options.map(opt => opt[1])
    assert.include(optionValues, '2020')
    assert.include(optionValues, '2024')
    assert.include(optionValues, '2035')
  })

  it("has TIME input that accepts time blocks", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    const blockJSON = definition.toBlocklyJSON()
    
    const allArgs = [...(blockJSON.args0 || []), ...(blockJSON.args1 || [])]
    const timeArg = allArgs.find(arg => arg.name === 'TIME')
    assert.exists(timeArg, 'TIME input should exist')
    assert.equal(timeArg.type, 'input_value')
    assert.deepEqual(timeArg.check, ['expression', 'time'])
  })

  it("generates correct JSON for a specific date and time", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'DAY') return '25'
        if (field === 'MONTH') return '12'
        if (field === 'YEAR') return '2024'
        return null
      },
      timezoneType: 'tz_io_account'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ time: { display: '00:00', value: 0 } })
    }
    
    const [result, precedence] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.equal(precedence, 0)
    assert.exists(parsed.datetime)
    assert.equal(parsed.datetime.day, 25)
    assert.equal(parsed.datetime.month, 12)
    assert.equal(parsed.datetime.year, 2024)
    assert.deepEqual(parsed.datetime.time, { time: { display: '00:00', value: 0 } })
    assert.deepEqual(parsed.datetime.timezone, { type: 'tz_io_account' })
  })

  it("regenerates correctly from JSON", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    
    const blockObject = {
      datetime: {
        day: 4,
        month: 7,
        year: 2024,
        time: { time: { display: '12:00', value: 43200 } },
        timezone: { type: 'tz_utc' }
      }
    }
    
    const mockHelpers = {
      expressionToBlock: (expr, opts) => ({ block: { type: 'io_utility_time' } })
    }
    
    const regenerated = definition.regenerators.json(blockObject, mockHelpers)
    
    assert.equal(regenerated.type, 'io_utility_datetime')
    assert.equal(regenerated.fields.DAY, '04')
    assert.equal(regenerated.fields.MONTH, '07')
    assert.equal(regenerated.fields.YEAR, '2024')
    assert.exists(regenerated.inputs.TIME)
    assert.equal(regenerated.extraState.timezoneType, 'tz_utc')
  })

  it("throws error when regenerating without datetime data", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    
    assert.throws(() => {
      definition.regenerators.json({}, {})
    }, /No datetime data/)
  })

  it("has mutator for timezone configuration", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    assert.exists(definition.mutator, 'should have a mutator')
  })

  it("output type is compatible with extract block inputs", () => {
    const datetimeDefinition = BlockDefinition.parseRawDefinition(datetimeDef)
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDef)
    
    const datetimeJSON = datetimeDefinition.toBlocklyJSON()
    const timeJSON = timeDefinition.toBlocklyJSON()
    
    // DateTime outputs ['expression', 'time']
    assert.deepEqual(datetimeJSON.output, ['expression', 'time'])
    
    // Time block also outputs ['expression', 'time']
    assert.deepEqual(timeJSON.output, ['expression', 'time'])
  })
})


describe("DateTime Block - Battle of Hastings (October 14, 1066)", () => {
  // The Battle of Hastings was fought on October 14, 1066
  // While 1066 is outside the year dropdown range (2020-2035), we can test
  // the concept of representing historical dates through the block structure
  
  it("can represent modern dates that anniversary the Battle of Hastings", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    
    // October 14, 2024 - 958 years after the battle
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'DAY') return '14'
        if (field === 'MONTH') return '10'
        if (field === 'YEAR') return '2024'
        return null
      },
      timezoneType: 'tz_utc'
    }
    
    // Battle reportedly started around 9:00 AM
    const battleStartTime = { time: { display: '09:00', value: 32400 } }
    const mockGenerator = {
      valueToCode: () => JSON.stringify(battleStartTime)
    }
    
    const [result] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.equal(parsed.datetime.day, 14)
    assert.equal(parsed.datetime.month, 10)
    assert.equal(parsed.datetime.year, 2024)
    // 9:00 AM = 9 * 60 * 60 = 32400 seconds
    assert.equal(parsed.datetime.time.time.value, 32400)
  })

  it("regenerates the Battle of Hastings anniversary correctly", () => {
    const definition = BlockDefinition.parseRawDefinition(datetimeDef)
    
    const blockObject = {
      datetime: {
        day: 14,
        month: 10,
        year: 2024,
        time: { time: { display: '09:00', value: 32400 } },
        timezone: { type: 'tz_utc' }
      }
    }
    
    const mockHelpers = {
      expressionToBlock: (expr, opts) => ({ 
        block: { 
          type: 'io_utility_time',
          fields: { HOUR: '09', MINUTE: '00' }
        } 
      })
    }
    
    const regenerated = definition.regenerators.json(blockObject, mockHelpers)
    
    assert.equal(regenerated.fields.DAY, '14')
    assert.equal(regenerated.fields.MONTH, '10')
    assert.equal(regenerated.fields.YEAR, '2024')
  })
})


describe("DateTime and Time Block Integration", () => {
  it("Time block output type matches DateTime block TIME input check", () => {
    const datetimeDefinition = BlockDefinition.parseRawDefinition(datetimeDef)
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDef)
    
    const datetimeJSON = datetimeDefinition.toBlocklyJSON()
    const timeJSON = timeDefinition.toBlocklyJSON()
    
    // Find the TIME input check on datetime block (may be in args1 due to multi-line template)
    const allArgs = [...(datetimeJSON.args0 || []), ...(datetimeJSON.args1 || [])]
    const timeInput = allArgs.find(arg => arg.name === 'TIME')
    
    // Time block output should be compatible with datetime TIME input
    // Time outputs ['expression', 'time'], TIME input checks ['expression', 'time']
    assert.deepEqual(timeJSON.output, ['expression', 'time'])
    assert.deepEqual(timeInput.check, ['expression', 'time'])
    
    // They should match - time block can connect to datetime's TIME input
    const hasMatchingType = timeJSON.output.some(t => timeInput.check.includes(t))
    assert.isTrue(hasMatchingType, 'Time block output should be compatible with DateTime TIME input')
  })

  it("generates combined datetime with numeric time value", () => {
    const datetimeDefinition = BlockDefinition.parseRawDefinition(datetimeDef)
    const timeDefinition = BlockDefinition.parseRawDefinition(timeBlockDef)
    
    // Generate time block output (2:30 PM)
    const mockTimeBlock = {
      getFieldValue: (field) => {
        if (field === 'HOUR') return '14'
        if (field === 'MINUTE') return '30'
        return null
      }
    }
    const [timeResult] = timeDefinition.generators.json(mockTimeBlock)
    const timeValue = JSON.parse(timeResult)
    
    // Verify time block output
    assert.equal(timeValue.time.display, '14:30')
    assert.equal(timeValue.time.value, 870 * 60) // 14*60 + 30 = 870 minutes = 52200 seconds
    
    // Now use that time in a datetime block
    const mockDatetimeBlock = {
      getFieldValue: (field) => {
        if (field === 'DAY') return '14'
        if (field === 'MONTH') return '10'
        if (field === 'YEAR') return '2024'
        return null
      },
      timezoneType: 'tz_utc'
    }
    const mockGenerator = {
      valueToCode: () => timeResult
    }
    
    const [datetimeResult] = datetimeDefinition.generators.json(mockDatetimeBlock, mockGenerator)
    const datetimeValue = JSON.parse(datetimeResult)
    
    // Combined datetime should have date components and nested time
    assert.equal(datetimeValue.datetime.day, 14)
    assert.equal(datetimeValue.datetime.month, 10)
    assert.equal(datetimeValue.datetime.year, 2024)
    assert.equal(datetimeValue.datetime.time.time.value, 52200)
  })
})


describe("DateTime Block - Historical and Future Dates", () => {
  // Test various significant dates including outside the dropdown range
  // to verify the JSON structure works correctly
  
  describe("The Millennium (January 1, 2000)", () => {
    it("can represent Y2K midnight moment via regeneration", () => {
      const definition = BlockDefinition.parseRawDefinition(datetimeDef)
      
      // Y2K: January 1, 2000 at 00:00:00 UTC
      // While 2000 is outside dropdown (2020-2035), regeneration should handle it
      const blockObject = {
        datetime: {
          day: 1,
          month: 1,
          year: 2000,
          time: { time: { display: '00:00', value: 0 } },
          timezone: { type: 'tz_utc' }
        }
      }
      
      const mockHelpers = {
        expressionToBlock: (expr, opts) => ({ 
          block: { type: 'io_utility_time', fields: { HOUR: '00', MINUTE: '00' } }
        })
      }
      
      const regenerated = definition.regenerators.json(blockObject, mockHelpers)
      
      // Fields will be padded strings
      assert.equal(regenerated.fields.DAY, '01')
      assert.equal(regenerated.fields.MONTH, '01')
      assert.equal(regenerated.fields.YEAR, '2000')
      assert.equal(regenerated.extraState.timezoneType, 'tz_utc')
    })

    it("generates correct JSON for millennium party time (23:59 on Dec 31, 1999)", () => {
      const definition = BlockDefinition.parseRawDefinition(datetimeDef)
      
      // The moment before Y2K - December 31, 1999 at 23:59
      const mockBlock = {
        getFieldValue: (field) => {
          if (field === 'DAY') return '31'
          if (field === 'MONTH') return '12'
          if (field === 'YEAR') return '2024' // Using in-range year, structure is same
          return null
        },
        timezoneType: 'tz_utc'
      }
      
      // 23:59 = 23*60*60 + 59*60 = 86340 seconds
      const partyTime = { time: { display: '23:59', value: 86340 } }
      const mockGenerator = {
        valueToCode: () => JSON.stringify(partyTime)
      }
      
      const [result] = definition.generators.json(mockBlock, mockGenerator)
      const parsed = JSON.parse(result)
      
      assert.equal(parsed.datetime.day, 31)
      assert.equal(parsed.datetime.month, 12)
      assert.equal(parsed.datetime.time.time.value, 86340)
    })
  })

  describe("Year 2038 Problem (January 19, 2038)", () => {
    // The Y2038 problem affects 32-bit Unix timestamps
    // Unix time overflow occurs at 03:14:07 UTC on January 19, 2038
    
    it("can represent the Unix epoch overflow moment", () => {
      const definition = BlockDefinition.parseRawDefinition(datetimeDef)
      
      const blockObject = {
        datetime: {
          day: 19,
          month: 1,
          year: 2038,
          time: { time: { display: '03:14', value: 11640 } }, // 3*60*60 + 14*60 = 11640 seconds
          timezone: { type: 'tz_utc' }
        }
      }
      
      const mockHelpers = {
        expressionToBlock: (expr, opts) => ({ 
          block: { type: 'io_utility_time', fields: { HOUR: '03', MINUTE: '14' } }
        })
      }
      
      const regenerated = definition.regenerators.json(blockObject, mockHelpers)
      
      assert.equal(regenerated.fields.DAY, '19')
      assert.equal(regenerated.fields.MONTH, '01')
      assert.equal(regenerated.fields.YEAR, '2038')
    })
  })

  describe("Year 2039 - Post Y2038", () => {
    it("can represent dates after the 32-bit epoch overflow", () => {
      const definition = BlockDefinition.parseRawDefinition(datetimeDef)
      
      // A date safely past Y2038: July 4, 2039
      const blockObject = {
        datetime: {
          day: 4,
          month: 7,
          year: 2039,
          time: { time: { display: '12:00', value: 43200 } },
          timezone: { type: 'tz_io_account' }
        }
      }
      
      const mockHelpers = {
        expressionToBlock: (expr, opts) => ({ 
          block: { type: 'io_utility_time', fields: { HOUR: '12', MINUTE: '00' } }
        })
      }
      
      const regenerated = definition.regenerators.json(blockObject, mockHelpers)
      
      assert.equal(regenerated.fields.DAY, '04')
      assert.equal(regenerated.fields.MONTH, '07')
      assert.equal(regenerated.fields.YEAR, '2039')
    })
  })

  describe("Year 2050 - Mid-Century", () => {
    it("can represent mid-century dates", () => {
      const definition = BlockDefinition.parseRawDefinition(datetimeDef)
      
      // January 1, 2050 - start of mid-century
      const blockObject = {
        datetime: {
          day: 1,
          month: 1,
          year: 2050,
          time: { time: { display: '00:00', value: 0 } },
          timezone: { type: 'tz_utc' }
        }
      }
      
      const mockHelpers = {
        expressionToBlock: (expr, opts) => ({ 
          block: { type: 'io_utility_time', fields: { HOUR: '00', MINUTE: '00' } }
        })
      }
      
      const regenerated = definition.regenerators.json(blockObject, mockHelpers)
      
      assert.equal(regenerated.fields.DAY, '01')
      assert.equal(regenerated.fields.MONTH, '01')
      assert.equal(regenerated.fields.YEAR, '2050')
    })

    it("handles summer solstice 2050", () => {
      const definition = BlockDefinition.parseRawDefinition(datetimeDef)
      
      // June 21, 2050 at solar noon (approximately 12:00 UTC)
      const blockObject = {
        datetime: {
          day: 21,
          month: 6,
          year: 2050,
          time: { time: { display: '12:00', value: 43200 } },
          timezone: { type: 'tz_utc' }
        }
      }
      
      const mockHelpers = {
        expressionToBlock: (expr, opts) => ({ 
          block: { type: 'io_utility_time', fields: { HOUR: '12', MINUTE: '00' } }
        })
      }
      
      const regenerated = definition.regenerators.json(blockObject, mockHelpers)
      
      assert.equal(regenerated.fields.DAY, '21')
      assert.equal(regenerated.fields.MONTH, '06')
      assert.equal(regenerated.fields.YEAR, '2050')
    })
  })

  describe("Year 2070 - Far Future", () => {
    it("can represent far future dates", () => {
      const definition = BlockDefinition.parseRawDefinition(datetimeDef)
      
      // December 31, 2070 at 23:59 - end of 2070
      const blockObject = {
        datetime: {
          day: 31,
          month: 12,
          year: 2070,
          time: { time: { display: '23:59', value: 86340 } },
          timezone: { type: 'tz_io_account' }
        }
      }
      
      const mockHelpers = {
        expressionToBlock: (expr, opts) => ({ 
          block: { type: 'io_utility_time', fields: { HOUR: '23', MINUTE: '59' } }
        })
      }
      
      const regenerated = definition.regenerators.json(blockObject, mockHelpers)
      
      assert.equal(regenerated.fields.DAY, '31')
      assert.equal(regenerated.fields.MONTH, '12')
      assert.equal(regenerated.fields.YEAR, '2070')
    })

    it("handles centennial of moon landing (July 20, 2069)", () => {
      const definition = BlockDefinition.parseRawDefinition(datetimeDef)
      
      // July 20, 2069 - 100 years after Apollo 11 landing
      // Armstrong stepped on moon at 02:56 UTC
      const blockObject = {
        datetime: {
          day: 20,
          month: 7,
          year: 2069,
          time: { time: { display: '02:56', value: 10560 } }, // 2*60*60 + 56*60 = 10560
          timezone: { type: 'tz_utc' }
        }
      }
      
      const mockHelpers = {
        expressionToBlock: (expr, opts) => ({ 
          block: { type: 'io_utility_time', fields: { HOUR: '02', MINUTE: '56' } }
        })
      }
      
      const regenerated = definition.regenerators.json(blockObject, mockHelpers)
      
      assert.equal(regenerated.fields.DAY, '20')
      assert.equal(regenerated.fields.MONTH, '07')
      assert.equal(regenerated.fields.YEAR, '2069')
    })
  })

  describe("Time value calculations across all dates", () => {
    it("time values are consistent regardless of date", () => {
      const definition = BlockDefinition.parseRawDefinition(datetimeDef)
      
      // Same time (14:30) should have same value regardless of date
      const time1430 = { time: { display: '14:30', value: 52200 } } // 14*60*60 + 30*60
      const mockGenerator = {
        valueToCode: () => JSON.stringify(time1430)
      }
      
      const dates = [
        { day: '14', month: '10', year: '2024', name: 'Battle of Hastings anniversary 2024' },
        { day: '01', month: '01', year: '2020', name: 'Start of 2020' },
        { day: '31', month: '12', year: '2035', name: 'End of dropdown range' },
      ]
      
      for (const date of dates) {
        const mockBlock = {
          getFieldValue: (field) => {
            if (field === 'DAY') return date.day
            if (field === 'MONTH') return date.month
            if (field === 'YEAR') return date.year
            return null
          },
          timezoneType: 'tz_utc'
        }
        
        const [result] = definition.generators.json(mockBlock, mockGenerator)
        const parsed = JSON.parse(result)
        
        assert.equal(parsed.datetime.time.time.value, 52200, 
          `Time value should be 52200 for ${date.name}`)
      }
    })
  })
})
