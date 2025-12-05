/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'tz_preset',
  name: "Timezone Preset",
  color: 360,
  description: "Select from common timezone presets including UTC, Europe/London, America/New_York, and America/Los_Angeles (Pacific). These automatically handle daylight saving time adjustments.",

  connections: {
    mode: "value",
    output: "timezone",
  },

  template: "Timezone: %TIMEZONE",

  fields: {
    TIMEZONE: {
      description: "Select a timezone from the preset list. UTC is the universal coordinated time with no daylight saving. Other options adjust automatically for their regional daylight saving rules.",
      options: [
        ['UTC', 'UTC'],
        ['Europe/London', 'Europe/London'],
        ['America/New York', 'America/New_York'],
        ['America/Los Angeles (Pacific)', 'America/Los_Angeles'],
      ]
    }
  },

  generators: {
    json: (block) => {
      const timezone = block.getFieldValue('TIMEZONE')
      
      return [JSON.stringify({
        timezone: {
          type: 'iana',
          iana: timezone
        }
      }), 0]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { timezone } = blockObject
      if (!timezone || timezone.type !== 'iana') {
        throw new Error("No IANA timezone data for tz_preset regenerator")
      }
      
      return {
        type: 'tz_preset',
        fields: {
          TIMEZONE: timezone.iana
        }
      }
    }
  }
}
