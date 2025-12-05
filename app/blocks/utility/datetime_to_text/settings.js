/** Mutator settings block for datetime_to_text - timezone and format slots */

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "datetime_to_text_settings",
  name: "DateTime to Text Settings",
  colour: 20,
  description: "Settings container for Convert to Text block with timezone and format options.",

  connections: {},

  template: `
    Settings |CENTER
    Timezone: %TIMEZONE
    Format: %FORMAT
  `,

  inputs: {
    TIMEZONE: {
      check: 'timezone',
      shadow: 'tz_io_account'
    },
    FORMAT: {
      check: 'datetime_format',
      shadow: 'fmt_iso8601'
    }
  },

  generators: {
    json: () => { }
  }
}
