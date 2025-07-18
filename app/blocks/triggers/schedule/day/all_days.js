import mutator from "./day_mutator.js"


export default {
  type: "all_days",
  name: "All Days",
  colour: 30,
  description: "Runs during every day of the month.",

  connections: {
    mode: 'value',
    output: 'cron_day'
  },

  mutator,

  template: "Every day",

  generators: {
    json: block => {
      return [ '*', 0 ]
    }
  }
}
