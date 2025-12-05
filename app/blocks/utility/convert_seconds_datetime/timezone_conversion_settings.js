/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "convert_tz_settings",
  name: "Timezone Conversion Settings",
  colour: 360,
  description: "Configure both input and output timezones for datetime conversion",

  connections: { },

  template: `
    Timezone Conversion |CENTER
    Input Timezone: %INPUT_TIMEZONE
    Output Timezone: %OUTPUT_TIMEZONE
  `,

  inputs: {
    INPUT_TIMEZONE: {
      description: "The timezone the input value is currently in",
      check: 'timezone',
      shadow: 'tz_io_server',
    },
    OUTPUT_TIMEZONE: {
      description: "The timezone to convert the value to",
      check: 'timezone',
      shadow: 'tz_io_account',
    }
  },

  generators: {
    json: () => [ {}, 0 ]
  }
}
