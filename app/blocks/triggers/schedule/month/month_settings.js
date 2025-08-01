/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "month_settings",
  name: "Month Settings",
  colour: 30,
  description: "How would you like to specify the months portion of your schedule?",

  connections: {},

  template: "Month: %MONTH_BLOCK",

  inputs: {
    MONTH_BLOCK: {
      check: 'cron_month',
      shadow: 'all_months'
    }
  },

  generators: {
    json: () => { }
  }
}
