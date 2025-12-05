/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'tz_io_account',
  name: "IO Account Timezone",
  color: 360,
  description: "Use your Adafruit IO account's configured timezone. This automatically adjusts for daylight saving time based on your account settings (e.g., Europe/London, America/New_York). This is the default timezone for user-derived time values.",

  connections: {
    mode: "value",
    output: "timezone",
  },

  template: "IO Account Timezone",

  generators: {
    json: () => {
      return [JSON.stringify({
        timezone: {
          type: 'account'
        }
      }), 0]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      if (!blockObject.timezone || blockObject.timezone.type !== 'account') {
        throw new Error("No account timezone data for tz_io_account regenerator")
      }
      
      return {
        type: 'tz_io_account'
      }
    }
  }
}
