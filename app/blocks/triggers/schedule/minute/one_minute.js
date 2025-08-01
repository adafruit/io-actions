import { makeOptions } from "#app/util/fields.js"
import mutator from './minute_mutator.js'


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "one_minute",
  name: "One Minute",
  colour: 30,
  description: "Runs at a particular minute of the hour.",

  connections: {
    mode: 'value',
    output: 'cron_minute'
  },

  mutator,

  template: "At minute: %MINUTE",

  fields: {
    MINUTE: {
      options: makeOptions({ upTo: 60 })
    }
  },

  generators: {
    json: block => {
      const minute = block.getFieldValue('MINUTE')

      return [ minute, 0 ]
    }
  }
}
