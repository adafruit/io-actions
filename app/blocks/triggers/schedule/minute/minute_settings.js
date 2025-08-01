/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "minute_settings",
  name: "Minute Settings",
  colour: 30,
  description: "How would you like to specify minutes of the hour for your schedule?",

  connections: {},

  template: "Minute: %MINUTE_BLOCK",

  inputs: {
    MINUTE_BLOCK: {
      check: 'cron_minute',
      shadow: 'all_minutes'
    }
  },

  generators: {
    json: () => { }
  }
}
