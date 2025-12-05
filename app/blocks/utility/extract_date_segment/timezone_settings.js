/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "extract_date_timezone_settings",
  name: "Timezone Settings",
  colour: 360,
  description: "Configure the timezone for date value interpretation",

  connections: { },

  template: `
    Timezone Settings |CENTER
    Input Timezone: %TIMEZONE
  `,

  inputs: {
    TIMEZONE: {
      description: "The timezone to use for interpreting the input date value",
      check: 'timezone',
      shadow: 'tz_io_account',
    }
  },

  generators: {
    json: () => [ {}, 0 ]
  }
}
