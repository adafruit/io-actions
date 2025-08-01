import { makeOptions } from "#app/util/fields.js"
import mutator from "./day_mutator.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "one_day",
  name: "One Day",
  colour: 30,
  description: `
    Runs during a particular day of the month.

    ::: tip
    Remember: not all months have days after 28!
    :::
  `,

  connections: {
    mode: 'value',
    output: 'cron_day'
  },

  mutator,

  template: "On date: %DAY",

  fields: {
    DAY: {
      options: makeOptions({ from: 1, upTo: 32 })
    }
  },

  generators: {
    json: block => {
      const day = block.getFieldValue('DAY')

      return [ day, 0 ]
    }
  }
}
