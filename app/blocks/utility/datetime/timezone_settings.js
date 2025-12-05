/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "datetime_tz_settings",
  name: "DateTime Timezone Settings",
  colour: 360,
  description: "Configure the timezone for the datetime calculation",

  connections: { },

  template: `
    DateTime Settings |CENTER
    Timezone: %TIMEZONE
  `,

  inputs: {
    TIMEZONE: {
      description: "The timezone to use when calculating the datetime value",
      check: 'timezone',
      shadow: 'tz_io_account',
    }
  },

  generators: {
    json: () => [ {}, 0 ]
  }
}
