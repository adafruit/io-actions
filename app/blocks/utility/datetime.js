import mutator from './datetime/mutator.js'
import { makeOptions } from "#app/util/fields.js"
import { TIME_ICON } from '#app/util/time_icon.js'

// Generate year options from 2020 to 2035
const yearOptions = makeOptions({
  from: 2020,
  upTo: 2036,
  valueFunc: y => y.toString()
})

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_utility_datetime',
  bytecodeKey: "datetime",
  name: "DateTime",
  color: 360,
  description: "Create a specific date and time value. Enter day, month, and year, then attach a Time block to set the time of day. The result is calculated as the date at midnight in the configured timezone, plus the attached time value. Use the settings cog to configure the timezone for the calculation.",

  connections: {
    mode: "value",
    output: ["expression", "time"],
  },

  mutator,

  template: `
    %ICON DateTime |CENTER
    %DAY / %MONTH / %YEAR at %TIME
  `,

  fields: {
    ICON: { image: TIME_ICON, width: 16, height: 16, alt: "DateTime" },
    DAY: {
      description: "Day of the month (1-31). The value will be validated against the selected month.",
      options: makeOptions({
        from: 1,
        upTo: 32,
        valueFunc: d => d.toString().padStart(2, '0')
      })
    },
    MONTH: {
      description: "Month of the year.",
      options: [
        ['January', '01'],
        ['February', '02'],
        ['March', '03'],
        ['April', '04'],
        ['May', '05'],
        ['June', '06'],
        ['July', '07'],
        ['August', '08'],
        ['September', '09'],
        ['October', '10'],
        ['November', '11'],
        ['December', '12'],
      ]
    },
    YEAR: {
      description: "Year (2020-2035).",
      options: yearOptions
    }
  },

  inputs: {
    TIME: {
      description: "The time of day to add to the date. This is added to midnight of the selected date in the configured timezone.",
      check: ["expression", "time"],
      shadow: {
        type: 'io_utility_time',
        fields: {
          HOUR: '12',
          MINUTE: '00'
        }
      }
    }
  },

  generators: {
    json: (block, generator) => {
      const 
        day = block.getFieldValue('DAY'),
        month = block.getFieldValue('MONTH'),
        year = block.getFieldValue('YEAR'),
        time = generator.valueToCode(block, 'TIME', 0) || 'null',
        timezoneType = block.timezoneType || 'tz_io_account'
      
      return [JSON.stringify({
        datetime: {
          day: parseInt(day, 10),
          month: parseInt(month, 10),
          year: parseInt(year, 10),
          time: JSON.parse(time),
          timezone: { type: timezoneType }
        }
      }), 0]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { datetime } = blockObject
      if (!datetime) {
        throw new Error("No datetime data for io_utility_datetime regenerator")
      }
      
      const { day, month, year, time, timezone } = datetime
      
      return {
        type: 'io_utility_datetime',
        fields: {
          DAY: day.toString().padStart(2, '0'),
          MONTH: month.toString().padStart(2, '0'),
          YEAR: year.toString()
        },
        inputs: {
          TIME: helpers.expressionToBlock(time, { 
            shadow: {
              type: 'io_utility_time',
              fields: {
                HOUR: '12',
                MINUTE: '00'
              }
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
