/** Mutator settings block for text_to_datetime - timezone and format slots */

/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "text_to_datetime_settings",
  name: "Text to DateTime Settings",
  colour: 20,
  description: "Settings container for Convert from Text block with timezone and format options.",

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
