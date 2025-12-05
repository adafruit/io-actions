import mutator from './convert_seconds_datetime/mutator.js'

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_utility_convert_seconds_datetime',
  bytecodeKey: "convertSecondsDatetime",
  name: "Convert Timezone",
  color: 360,
  description: "Convert a timestamp from one timezone to another. Takes seconds as input and outputs seconds adjusted for the timezone difference. Use the settings cog to configure both the input timezone (what the timestamp is currently in) and output timezone (what you want to convert it to). Essential for working with feed data from different time sources.",

  connections: {
    mode: "value",
    output: ["expression", "time"],
  },

  mutator,

  template: `
    Convert Timezone |CENTER
    %SECONDS
  `,

  inputs: {
    SECONDS: {
      description: "The timestamp in seconds to convert between timezones. This can come from feed timestamps, datetime blocks, or any expression that evaluates to seconds.",
      check: ["expression", "time"],
      shadow: 'io_utility_current_time'
    }
  },

  generators: {
    json: (block, generator) => {
      const 
        seconds = generator.valueToCode(block, 'SECONDS', 0) || 'null',
        inputTimezoneType = block.inputTimezoneType || 'tz_io_server',
        outputTimezoneType = block.outputTimezoneType || 'tz_io_account'
      
      return [JSON.stringify({
        convertSecondsDatetime: {
          seconds: JSON.parse(seconds),
          inputTimezone: { type: inputTimezoneType },
          outputTimezone: { type: outputTimezoneType }
        }
      }), 0]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { convertSecondsDatetime } = blockObject
      if (!convertSecondsDatetime) {
        throw new Error("No convertSecondsDatetime data for io_utility_convert_seconds_datetime regenerator")
      }
      
      const { seconds, inputTimezone, outputTimezone } = convertSecondsDatetime
      
      return {
        type: 'io_utility_convert_seconds_datetime',
        inputs: {
          SECONDS: helpers.expressionToBlock(seconds, { shadow: 'io_utility_current_time' })
        },
        extraState: {
          inputTimezoneType: inputTimezone?.type || 'tz_io_server',
          outputTimezoneType: outputTimezone?.type || 'tz_io_account'
        }
      }
    }
  }
}
