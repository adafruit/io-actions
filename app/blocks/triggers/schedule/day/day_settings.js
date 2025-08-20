/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "day_settings",
  name: "Day Settings",
  colour: 30,
  description: "How would you like to specify days of the month for your schedule?",

  connections: {},

  template: "Day: %DAY_BLOCK",

  inputs: {
    DAY_BLOCK: {
      check: 'cron_day',
      shadow: 'all_days'
    }
  },

  generators: {
    json: () => { }
  }
}
