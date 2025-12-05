/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "duration_tz_settings",
  name: "Duration Timezone Settings",
  colour: 360,
  description: "Configure the timezone for calendar-based duration calculations (days, weeks, months, years)",

  connections: { },

  template: `
    Duration Settings |CENTER
    Timezone: %TIMEZONE
  `,

  inputs: {
    TIMEZONE: {
      description: "The timezone to use for calendar-based duration calculations. This affects how days, weeks, months, and years are calculated around daylight saving time transitions.",
      check: 'timezone',
      shadow: 'tz_io_account',
    }
  },

  generators: {
    json: () => [ {}, 0 ]
  }
}
