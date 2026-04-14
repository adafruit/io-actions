import mutator from './extract_date_segment/mutator.js'
import { TIME_ICON } from '#app/util/time_icon.js'

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_utility_extract_date_segment',
  bytecodeKey: "extractDateSegment",
  name: "Extract Date Segment",
  color: 360,
  description: "Extract a specific date component (year, month, day, or day of week) from a timestamp in seconds. Use the settings cog to configure which timezone the input timestamp should be interpreted in. Perfect for extracting the month or day from a timestamp for date-based conditions.",

  connections: {
    mode: "value",
    output: "expression",
  },

  mutator,

  template: `
    %ICON Extract %SEGMENT |CENTER
    from %DATE
  `,

  fields: {
    ICON: { image: TIME_ICON, width: 16, height: 16, alt: "Extract Date" },
    SEGMENT: {
      description: "Which date component to extract from the input timestamp.",
      options: [
        ['Year', 'year'],
        ['Month (1-12)', 'month'],
        ['Day of Month (1-31)', 'day'],
        ['Day of Week (0-6, Sun=0)', 'weekday'],
      ]
    }
  },

  inputs: {
    DATE: {
      description: "The timestamp value in seconds to extract from. This can come from feed timestamps, datetime blocks, or any expression that evaluates to seconds since epoch.",
      check: ["expression", "time"],
      shadow: 'io_utility_current_time'
    }
  },

  generators: {
    json: (block, generator) => {
      const 
        segment = block.getFieldValue('SEGMENT'),
        date = generator.valueToCode(block, 'DATE', 0) || 'null',
        timezoneType = block.timezoneType || 'tz_io_account'
      
      return [JSON.stringify({
        extractDateSegment: {
          segment,
          date: JSON.parse(date),
          timezone: { type: timezoneType }
        }
      }), 0]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { extractDateSegment } = blockObject
      if (!extractDateSegment) {
        throw new Error("No extractDateSegment data for io_utility_extract_date_segment regenerator")
      }
      
      const { segment, date, timezone } = extractDateSegment
      
      return {
        type: 'io_utility_extract_date_segment',
        fields: {
          SEGMENT: segment
        },
        inputs: {
          DATE: helpers.expressionToBlock(date, { shadow: 'io_utility_current_time' })
        },
        extraState: {
          timezoneType: timezone?.type || 'tz_io_account'
        }
      }
    }
  }
}
