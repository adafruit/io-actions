import mutator from './duration/mutator.js'

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_utility_duration',
  bytecodeKey: "duration",
  name: "Create Duration",
  color: 360,
  description: "Create a duration value that can be added to or subtracted from datetime values. Select a unit (seconds, minutes, hours, days, weeks, months, or years) and enter a numeric amount. Use the settings cog to configure timezone for calendar-based units (days, weeks, months, years) which may vary based on daylight saving time. Perfect for calculations like 'sunset - 2 hours' or 'next week'.",

  connections: {
    mode: "value",
    output: ["expression", "duration"],
  },

  mutator,

  template: `
    Duration: %AMOUNT %UNIT
  `,

  fields: {
    UNIT: {
      description: "The unit of time for the duration.",
      options: [
        ['Seconds', 'seconds'],
        ['Minutes', 'minutes'],
        ['Hours', 'hours'],
        ['Days', 'days'],
        ['Weeks', 'weeks'],
        ['Months', 'months'],
        ['Years', 'years'],
      ]
    }
  },

  inputs: {
    AMOUNT: {
      description: "The numeric amount for the duration. Can be positive (to add) or negative (to subtract).",
      check: ["expression", "number"],
      shadow: {
        type: 'io_math_number',
        fields: {
          NUM: '1'
        }
      }
    }
  },

  generators: {
    json: (block, generator) => {
      const 
        amountCode = generator.valueToCode(block, 'AMOUNT', 0) || '{"number":1}',
        unit = block.getFieldValue('UNIT'),
        timezoneType = block.timezoneType || 'tz_io_account'
      
      return [JSON.stringify({
        duration: {
          amount: JSON.parse(amountCode),
          unit,
          timezone: { type: timezoneType }
        }
      }), 0]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { duration } = blockObject
      if (!duration) {
        throw new Error("No duration data for io_utility_duration regenerator")
      }
      
      const { amount, unit, timezone } = duration
      
      return {
        type: 'io_utility_duration',
        fields: {
          UNIT: unit
        },
        inputs: {
          AMOUNT: helpers.expressionToBlock(amount, { 
            shadow: {
              type: 'io_math_number',
              fields: { NUM: '1' }
            }
          })
        },
        extraState: {
          timezoneType: timezone?.type || 'tz_io_account'
        }
      }
    }
  }
}
