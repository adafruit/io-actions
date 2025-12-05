import mutator from './text_to_datetime/mutator.js'

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "io_utility_text_to_datetime",
  name: "Convert from Text",
  colour: 20,
  description: "Parse a text string into a datetime value. Configure the expected timezone and input format (ISO 8601, RFC 2822, custom strftime patterns, etc.) using the settings cog.",

  connections: {
    mode: 'value',
    output: ['expression', 'time']
  },

  mutator,

  template: "parse %INPUT as datetime",

  inputs: {
    INPUT: {
      description: "The text string to parse as a datetime",
      check: ['expression', 'string'],
      shadow: {
        type: 'io_text',
        fields: { TEXT: '2024-01-01T12:00:00Z' }
      }
    }
  },

  generators: {
    json: (block, generator) => {
      const input = generator.valueToCode(block, 'INPUT')
      return {
        textToDatetime: {
          input,
          timezone: { type: block.timezoneType || 'tz_io_account' },
          format: { type: block.formatType || 'fmt_iso8601' }
        }
      }
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { textToDatetime } = blockObject
      if (!textToDatetime) {
        throw new Error("No textToDatetime data for io_utility_text_to_datetime regenerator")
      }
      
      const { input, timezone, format } = textToDatetime
      
      return {
        type: 'io_utility_text_to_datetime',
        inputs: {
          INPUT: helpers.expressionToBlock(input, { shadow: { type: 'io_text', fields: { TEXT: '2024-01-01T12:00:00Z' } } })
        },
        extraState: {
          timezoneType: timezone?.type || 'tz_io_account',
          formatType: format?.type || 'fmt_iso8601'
        }
      }
    }
  }
}
