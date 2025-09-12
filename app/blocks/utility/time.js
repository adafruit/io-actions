import { makeOptions } from "#app/util/fields.js"

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_utility_time',
  name: "Time",
  color: 360,
  description: "Create a time value in 24-hour format for use in comparisons and conditions. Perfect for building time-based logic like 'if current time > 14:30' or 'if time equals 09:00'. Hours range from 00-23, minutes from 00-59. The time value can be compared with other times or used in mathematical operations. Found in the Time category alongside Current Time block.",
  connections: {
    mode: "value",
    output: ["expression", "time"],
  },
  template: "%HOUR : %MINUTE",
  fields: {
    HOUR: {
      description: "Select the hour in 24-hour format (00-23). Examples: 00 for midnight, 12 for noon, 14 for 2 PM, 23 for 11 PM. This military time format ensures precise time comparisons without AM/PM confusion.",
      options: makeOptions({ 
        upTo: 24,
        valueFunc: hour => hour.toString().padStart(2, '0')
      })
    },
    MINUTE: {
      description: "Select the minute (00-59). Examples: 00 for on the hour, 15 for quarter past, 30 for half past, 45 for quarter to. Combined with hours, creates precise time values for your automation logic.",
      options: makeOptions({ 
        upTo: 60,
        valueFunc: minute => minute.toString().padStart(2, '0')
      })
    }
  },
  generators: {
    json: block => {
      const 
        hour = block.getFieldValue('HOUR'),
        minute = block.getFieldValue('MINUTE'),
        timeValue = `${hour}:${minute}`,
        // Convert to minutes since midnight for numeric comparison
        totalMinutes = parseInt(hour, 10) * 60 + parseInt(minute, 10)
      
      return [JSON.stringify({
        time: {
          display: timeValue,
          value: totalMinutes
        }
      }), 0]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      const timeData = blockObject.time
      if (!timeData) {
        throw new Error("No time data for io_utility_time regenerator")
      }
      
      const totalMinutes = timeData.value
      const hour = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
      const minute = (totalMinutes % 60).toString().padStart(2, '0')
      
      return {
        type: 'io_utility_time',
        fields: {
          HOUR: hour,
          MINUTE: minute
        }
      }
    }
  }
}