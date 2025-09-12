/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_utility_current_time',
  name: "Current Time",
  color: 360,
  description: "Get the current system time in 24-hour format for use in time comparisons and conditions. Returns the current hour and minute as a time value that can be compared with Time blocks. Perfect for creating time-based automation logic like 'if current time > 14:30' or 'if current time is between 9:00 and 17:00'. Found in the Time category alongside Time block.",
  connections: {
    mode: "value",
    output: ["expression", "time"],
  },
  template: "Current Time",
  generators: {
    json: () => {
      return [JSON.stringify({
        currentTime: {}
      }), 0]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      if (!blockObject.currentTime) {
        throw new Error("No currentTime data for io_utility_current_time regenerator")
      }
      
      return {
        type: 'io_utility_current_time'
      }
    }
  }
}