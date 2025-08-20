/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "hour_settings",
  name: "Hour Settings",
  colour: 30,
  description: "How would you like to specify hours of the day for your schedule?",

  connections: {},

  template: "Hour: %HOUR_BLOCK",

  inputs: {
    HOUR_BLOCK: {
      check: 'cron_hour',
      shadow: 'all_hours'
    }
  },

  generators: {
    json: () => { }
  }
}
