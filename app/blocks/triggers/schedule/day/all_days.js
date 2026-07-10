import mutator from "./day_mutator.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "all_days",
  name: "All Days",
  colour: '#8A2E52',
  description: "Runs during every day of the month.",

  connections: {
    mode: 'value',
    output: 'cron_day'
  },

  mutator,

  template: "Every day",

  generators: {
    json: () => [ '*', 0 ]
  }
}
