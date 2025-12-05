/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'tz_io_server',
  name: "IO Server Time",
  color: 360,
  description: "Use Adafruit IO server time (Eastern Standard Time / EST). This is the default timezone for feed properties like 'updated_at' and other template-related timestamp values.",

  connections: {
    mode: "value",
    output: "timezone",
  },

  template: "IO Server Time (EST)",

  generators: {
    json: () => {
      return [JSON.stringify({
        timezone: {
          type: 'server',
          iana: 'America/New_York'
        }
      }), 0]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      if (!blockObject.timezone || blockObject.timezone.type !== 'server') {
        throw new Error("No server timezone data for tz_io_server regenerator")
      }
      
      return {
        type: 'tz_io_server'
      }
    }
  }
}
