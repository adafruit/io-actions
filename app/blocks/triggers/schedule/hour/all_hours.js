import mutator from "./hour_mutator.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "all_hours",
  name: "All Hours",
  colour: 30,
  description: "Runs during all hours of the day.",

  connections: {
    mode: 'value',
    output: 'cron_hour'
  },

  mutator,

  template: "Every hour",

  generators: {
    json: () => [ '*', 0 ]
  }
}
