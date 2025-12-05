import mutator from './datetime_to_text/mutator.js'

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "io_utility_datetime_to_text",
  name: "Convert to Text",
  colour: 20,
  description: "Convert a datetime or seconds value to a formatted text string. Configure timezone and output format (ISO 8601, RFC 2822, custom strftime patterns, etc.) using the settings cog.",

  connections: {
    mode: 'value',
    output: 'String'
  },

  mutator,

  template: "format %INPUT as text",

  inputs: {
    INPUT: {
      description: "The datetime or seconds value to format as text",
      check: ['expression', 'time'],
      shadow: 'io_utility_current_time'
    }
  },

  generators: {
    json: (block, generator) => {
      const input = generator.valueToCode(block, 'INPUT')
      return {
        datetimeToText: {
          input,
          timezone: { type: block.timezoneType || 'tz_io_account' },
          format: { type: block.formatType || 'fmt_iso8601' }
        }
      }
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { datetimeToText } = blockObject
      if (!datetimeToText) {
        throw new Error("No datetimeToText data for io_utility_datetime_to_text regenerator")
      }
      
      const { input, timezone, format } = datetimeToText
      
      return {
        type: 'io_utility_datetime_to_text',
        inputs: {
          INPUT: helpers.expressionToBlock(input, { shadow: 'io_utility_current_time' })
        },
        extraState: {
          timezoneType: timezone?.type || 'tz_io_account',
          formatType: format?.type || 'fmt_iso8601'
        }
      }
    }
  }
}
