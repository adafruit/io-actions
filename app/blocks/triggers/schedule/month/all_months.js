import mutator from './month_mutator.js'


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "all_months",
  name: "All Months",
  colour: '#8A2E52',
  description: "Runs during all months.",

  connections: {
    mode: 'value',
    output: 'cron_month'
  },

  mutator,

  template: "Every month",

  generators: {
    json: () => [ '*', 0 ]
  }
}
