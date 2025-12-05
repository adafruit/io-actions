/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "current_time_tz_settings",
  name: "Current Time Timezone Settings",
  colour: 360,
  description: "Configure the timezone for the current time output",

  connections: { },

  template: `
    Current Time Settings |CENTER
    Timezone: %TIMEZONE
  `,

  inputs: {
    TIMEZONE: {
      description: "The timezone to use for the current time value",
      check: 'timezone',
      shadow: 'tz_io_account',
    }
  },

  generators: {
    json: () => [ {}, 0 ]
  }
}
