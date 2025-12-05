import { describe, it } from 'node:test'
import { assert } from 'chai'

import extractTimeSegmentDef from "#app/blocks/utility/extract_time_segment.js"
import extractDateSegmentDef from "#app/blocks/utility/extract_date_segment.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("Extract Time Segment Block", () => {
  it("works", () => {
    const definition = BlockDefinition.parseRawDefinition(extractTimeSegmentDef)
    assert.equal(definition.type, 'io_utility_extract_time_segment')
  })

  it("exports block JSON with correct structure", () => {
    const definition = BlockDefinition.parseRawDefinition(extractTimeSegmentDef)
    const blockJSON = definition.toBlocklyJSON()

    assert.exists(blockJSON.message0)
    assert.exists(blockJSON.args0)
    assert.equal(blockJSON.output, 'expression')
    assert.equal(blockJSON.colour, 360)
  })

  it("has SEGMENT dropdown with hour, minute, second options", () => {
    const definition = BlockDefinition.parseRawDefinition(extractTimeSegmentDef)
    const blockJSON = definition.toBlocklyJSON()
    
    const segmentArg = blockJSON.args0.find(arg => arg.name === 'SEGMENT')
    assert.exists(segmentArg, 'SEGMENT field should exist')
    assert.equal(segmentArg.type, 'field_dropdown')
    
    const optionValues = segmentArg.options.map(opt => opt[1])
    assert.include(optionValues, 'hour')
    assert.include(optionValues, 'minute')
    assert.include(optionValues, 'second')
  })

  it("has TIME input that accepts time blocks", () => {
    const definition = BlockDefinition.parseRawDefinition(extractTimeSegmentDef)
    const blockJSON = definition.toBlocklyJSON()
    
    // Block may use multiple message lines, check all args arrays
    const allArgs = [...(blockJSON.args0 || []), ...(blockJSON.args1 || [])]
    const timeArg = allArgs.find(arg => arg.name === 'TIME')
    assert.exists(timeArg, 'TIME input should exist')
    assert.equal(timeArg.type, 'input_value')
    assert.deepEqual(timeArg.check, ['expression', 'time'])
  })

  it("generates correct JSON for extracting hour", () => {
    const definition = BlockDefinition.parseRawDefinition(extractTimeSegmentDef)
    
    const mockBlock = {
      getFieldValue: (field) => field === 'SEGMENT' ? 'hour' : null,
      timezoneType: 'tz_io_account'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ currentTime: {} })
    }
    
    const [result, precedence] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.equal(precedence, 0)
    assert.exists(parsed.extractTimeSegment)
    assert.equal(parsed.extractTimeSegment.segment, 'hour')
    assert.deepEqual(parsed.extractTimeSegment.time, { currentTime: {} })
    assert.deepEqual(parsed.extractTimeSegment.timezone, { type: 'tz_io_account' })
  })

  it("regenerates correctly from JSON", () => {
    const definition = BlockDefinition.parseRawDefinition(extractTimeSegmentDef)
    
    const blockObject = {
      extractTimeSegment: {
        segment: 'minute',
        time: { currentTime: {} },
        timezone: { type: 'tz_utc' }
      }
    }
    
    const mockHelpers = {
      expressionToBlock: (expr, opts) => ({ block: { type: 'io_utility_current_time' } })
    }
    
    const regenerated = definition.regenerators.json(blockObject, mockHelpers)
    
    assert.equal(regenerated.type, 'io_utility_extract_time_segment')
    assert.equal(regenerated.fields.SEGMENT, 'minute')
    assert.exists(regenerated.inputs.TIME)
    assert.equal(regenerated.extraState.timezoneType, 'tz_utc')
  })

  it("throws error when regenerating without extractTimeSegment data", () => {
    const definition = BlockDefinition.parseRawDefinition(extractTimeSegmentDef)
    
    assert.throws(() => {
      definition.regenerators.json({}, {})
    }, /No extractTimeSegment data/)
  })

  it("has mutator for timezone configuration", () => {
    const definition = BlockDefinition.parseRawDefinition(extractTimeSegmentDef)
    assert.exists(definition.mutator, 'should have a mutator')
  })
})


describe("Extract Date Segment Block", () => {
  it("works", () => {
    const definition = BlockDefinition.parseRawDefinition(extractDateSegmentDef)
    assert.equal(definition.type, 'io_utility_extract_date_segment')
  })

  it("exports block JSON with correct structure", () => {
    const definition = BlockDefinition.parseRawDefinition(extractDateSegmentDef)
    const blockJSON = definition.toBlocklyJSON()

    assert.exists(blockJSON.message0)
    assert.exists(blockJSON.args0)
    assert.equal(blockJSON.output, 'expression')
    assert.equal(blockJSON.colour, 360)
  })

  it("has SEGMENT dropdown with year, month, day, weekday options", () => {
    const definition = BlockDefinition.parseRawDefinition(extractDateSegmentDef)
    const blockJSON = definition.toBlocklyJSON()
    
    const segmentArg = blockJSON.args0.find(arg => arg.name === 'SEGMENT')
    assert.exists(segmentArg, 'SEGMENT field should exist')
    assert.equal(segmentArg.type, 'field_dropdown')
    
    const optionValues = segmentArg.options.map(opt => opt[1])
    assert.include(optionValues, 'year')
    assert.include(optionValues, 'month')
    assert.include(optionValues, 'day')
    assert.include(optionValues, 'weekday')
  })

  it("has DATE input that accepts time blocks", () => {
    const definition = BlockDefinition.parseRawDefinition(extractDateSegmentDef)
    const blockJSON = definition.toBlocklyJSON()
    
    // Block may use multiple message lines, check all args arrays
    const allArgs = [...(blockJSON.args0 || []), ...(blockJSON.args1 || [])]
    const dateArg = allArgs.find(arg => arg.name === 'DATE')
    assert.exists(dateArg, 'DATE input should exist')
    assert.equal(dateArg.type, 'input_value')
    assert.deepEqual(dateArg.check, ['expression', 'time'])
  })

  it("generates correct JSON for extracting year", () => {
    const definition = BlockDefinition.parseRawDefinition(extractDateSegmentDef)
    
    const mockBlock = {
      getFieldValue: (field) => field === 'SEGMENT' ? 'year' : null,
      timezoneType: 'tz_utc'
    }
    const mockGenerator = {
      valueToCode: () => JSON.stringify({ datetime: { day: 14, month: 10, year: 1066 } })
    }
    
    const [result, precedence] = definition.generators.json(mockBlock, mockGenerator)
    const parsed = JSON.parse(result)
    
    assert.equal(precedence, 0)
    assert.exists(parsed.extractDateSegment)
    assert.equal(parsed.extractDateSegment.segment, 'year')
    assert.deepEqual(parsed.extractDateSegment.date, { datetime: { day: 14, month: 10, year: 1066 } })
    assert.deepEqual(parsed.extractDateSegment.timezone, { type: 'tz_utc' })
  })

  it("regenerates correctly from JSON", () => {
    const definition = BlockDefinition.parseRawDefinition(extractDateSegmentDef)
    
    const blockObject = {
      extractDateSegment: {
        segment: 'month',
        date: { currentTime: {} },
        timezone: { type: 'tz_io_account' }
      }
    }
    
    const mockHelpers = {
      expressionToBlock: (expr, opts) => ({ block: { type: 'io_utility_current_time' } })
    }
    
    const regenerated = definition.regenerators.json(blockObject, mockHelpers)
    
    assert.equal(regenerated.type, 'io_utility_extract_date_segment')
    assert.equal(regenerated.fields.SEGMENT, 'month')
    assert.exists(regenerated.inputs.DATE)
    assert.equal(regenerated.extraState.timezoneType, 'tz_io_account')
  })

  it("throws error when regenerating without extractDateSegment data", () => {
    const definition = BlockDefinition.parseRawDefinition(extractDateSegmentDef)
    
    assert.throws(() => {
      definition.regenerators.json({}, {})
    }, /No extractDateSegment data/)
  })

  it("has mutator for timezone configuration", () => {
    const definition = BlockDefinition.parseRawDefinition(extractDateSegmentDef)
    assert.exists(definition.mutator, 'should have a mutator')
  })
})


describe("Extract Blocks - Battle of Hastings (October 14, 1066)", () => {
  // The Battle of Hastings was fought on October 14, 1066
  // This is a fun historical test case and also verifies the blocks work with specific dates
  
  it("Extract Date Segment can represent the Battle of Hastings date components", () => {
    const definition = BlockDefinition.parseRawDefinition(extractDateSegmentDef)
    
    // Test extracting year = 1066
    const yearBlock = {
      getFieldValue: () => 'year',
      timezoneType: 'tz_utc'
    }
    const hastingsTimestamp = { datetime: { day: 14, month: 10, year: 1066, time: null } }
    const mockGenerator = {
      valueToCode: () => JSON.stringify(hastingsTimestamp)
    }
    
    const [yearResult] = definition.generators.json(yearBlock, mockGenerator)
    const yearParsed = JSON.parse(yearResult)
    assert.equal(yearParsed.extractDateSegment.segment, 'year')
    // The datetime passed in would evaluate to 1066 when the segment is extracted
    assert.equal(yearParsed.extractDateSegment.date.datetime.year, 1066)
    
    // Test extracting month = October (10)
    const monthBlock = {
      getFieldValue: () => 'month',
      timezoneType: 'tz_utc'
    }
    const [monthResult] = definition.generators.json(monthBlock, mockGenerator)
    const monthParsed = JSON.parse(monthResult)
    assert.equal(monthParsed.extractDateSegment.segment, 'month')
    assert.equal(monthParsed.extractDateSegment.date.datetime.month, 10)
    
    // Test extracting day = 14
    const dayBlock = {
      getFieldValue: () => 'day',
      timezoneType: 'tz_utc'
    }
    const [dayResult] = definition.generators.json(dayBlock, mockGenerator)
    const dayParsed = JSON.parse(dayResult)
    assert.equal(dayParsed.extractDateSegment.segment, 'day')
    assert.equal(dayParsed.extractDateSegment.date.datetime.day, 14)
    
    // Test extracting weekday - October 14, 1066 was a Saturday (6 in 0-indexed Sun=0)
    const weekdayBlock = {
      getFieldValue: () => 'weekday',
      timezoneType: 'tz_utc'
    }
    const [weekdayResult] = definition.generators.json(weekdayBlock, mockGenerator)
    const weekdayParsed = JSON.parse(weekdayResult)
    assert.equal(weekdayParsed.extractDateSegment.segment, 'weekday')
    // The actual weekday calculation happens at runtime, but the block structure is correct
  })

  it("Extract Time Segment can work with a morning battle time (e.g., 9:00 AM)", () => {
    const definition = BlockDefinition.parseRawDefinition(extractTimeSegmentDef)
    
    // The battle is said to have started around 9:00 AM
    // 9:00 AM = 9 hours * 60 minutes * 60 seconds = 32400 seconds since midnight
    const battleStartTime = { time: { display: '09:00', value: 32400 } }
    
    const mockGenerator = {
      valueToCode: () => JSON.stringify(battleStartTime)
    }
    
    // Extract hour (should be 9)
    const hourBlock = {
      getFieldValue: () => 'hour',
      timezoneType: 'tz_utc'
    }
    const [hourResult] = definition.generators.json(hourBlock, mockGenerator)
    const hourParsed = JSON.parse(hourResult)
    assert.equal(hourParsed.extractTimeSegment.segment, 'hour')
    assert.equal(hourParsed.extractTimeSegment.time.time.value, 32400)
    
    // Extract minute (should be 0)
    const minuteBlock = {
      getFieldValue: () => 'minute',
      timezoneType: 'tz_utc'
    }
    const [minuteResult] = definition.generators.json(minuteBlock, mockGenerator)
    const minuteParsed = JSON.parse(minuteResult)
    assert.equal(minuteParsed.extractTimeSegment.segment, 'minute')
  })
})
