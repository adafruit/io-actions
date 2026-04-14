import mutator from './extract_time_segment/mutator.js'
import { TIME_ICON } from '#app/util/time_icon.js'

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_utility_extract_time_segment',
  bytecodeKey: "extractTimeSegment",
  name: "Extract Time Segment",
  color: 360,
  description: "Extract a specific time component (hour, minute, or second) from a time value in seconds. Similar to JSONPath but for time data. Use the settings cog to configure which timezone the input time should be interpreted in. Perfect for extracting just the hour from a timestamp for time-based conditions.",

  connections: {
    mode: "value",
    output: "expression",
  },

  mutator,

  template: `
    %ICON Extract %SEGMENT |CENTER
    from %TIME
  `,

  fields: {
    ICON: { image: TIME_ICON, width: 16, height: 16, alt: "Extract Time" },
    SEGMENT: {
      description: "Which time component to extract from the input value.",
      options: [
        ['Hour (0-23)', 'hour'],
        ['Minute (0-59)', 'minute'],
        ['Second (0-59)', 'second'],
      ]
    }
  },

  inputs: {
    TIME: {
      description: "The time value in seconds to extract from. This can come from feed timestamps, the Current Time block, or any expression that evaluates to seconds.",
      check: ["expression", "time"],
      shadow: 'io_utility_current_time'
    }
  },

  generators: {
    json: (block, generator) => {
      const 
        segment = block.getFieldValue('SEGMENT'),
        time = generator.valueToCode(block, 'TIME', 0) || 'null',
        timezoneType = block.timezoneType || 'tz_io_account'
      
      return [JSON.stringify({
        extractTimeSegment: {
          segment,
          time: JSON.parse(time),
          timezone: { type: timezoneType }
        }
      }), 0]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { extractTimeSegment } = blockObject
      if (!extractTimeSegment) {
        throw new Error("No extractTimeSegment data for io_utility_extract_time_segment regenerator")
      }
      
      const { segment, time, timezone } = extractTimeSegment
      
      return {
        type: 'io_utility_extract_time_segment',
        fields: {
          SEGMENT: segment
        },
        inputs: {
          TIME: helpers.expressionToBlock(time, { shadow: 'io_utility_current_time' })
        },
        extraState: {
          timezoneType: timezone?.type || 'tz_io_account'
        }
      }
    }
  }
}
