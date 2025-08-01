import mutator from './minute_mutator.js'


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "all_minutes",
  name: "All Minutes",
  colour: 30,
  description: "Runs every minute of the hour.",

  connections: {
    mode: 'value',
    output: 'cron_minute'
  },

  mutator,

  template: "Every minute",

  generators: {
    json: () => [ '*', 0 ]
  }
}
