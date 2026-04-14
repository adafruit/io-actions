import mutator from './current_time/mutator.js'
import { TIME_ICON } from '#app/util/time_icon.js'

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_utility_current_time',
  name: "Current Time",
  color: 360,
  description: "Get the current system time in 24-hour format for use in time comparisons and conditions. Returns the current hour and minute as a time value that can be compared with Time blocks. Perfect for creating time-based automation logic like 'if current time > 14:30' or 'if current time is between 9:00 and 17:00'. Use the settings cog to select a different timezone (defaults to your IO Account timezone). Found in the Time category alongside Time block.",
  connections: {
    mode: "value",
    output: ["expression", "time"],
  },
  mutator,
  template: "%ICON Current Time",
  fields: {
    ICON: { image: TIME_ICON, width: 16, height: 16, alt: "Time" }
  },
  generators: {
    json: (block) => {
      const timezoneType = block.timezoneType || 'tz_io_account'
      
      return [JSON.stringify({
        currentTime: {
          timezone: { type: timezoneType }
        }
      }), 0]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      if (!blockObject.currentTime) {
        throw new Error("No currentTime data for io_utility_current_time regenerator")
      }
      
      const { timezone } = blockObject.currentTime
      
      return {
        type: 'io_utility_current_time',
        extraState: {
          timezoneType: timezone?.type || 'tz_io_account'
        }
      }
    }
  }
}