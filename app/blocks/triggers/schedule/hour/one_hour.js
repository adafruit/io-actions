import { makeOptions } from "#app/util/fields.js"
import mutator from "./hour_mutator.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "one_hour",
  name: "One Hour",
  colour: 30,
  description: "Runs during a particular hour of the day.",

  connections: {
    mode: 'value',
    output: 'cron_hour'
  },

  mutator,

  template: "During hour: %HOUR",

  fields: {
    HOUR: {
      options: makeOptions({ upTo: 24 })
    }
  },

  generators: {
    json: block => {
      const hour = block.getFieldValue('HOUR')

      return [ hour, 0 ]
    }
  }
}
