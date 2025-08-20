import { makeOptions } from "#app/util/fields.js"
import mutator from "./day_mutator.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "every_days_between",
  name: "Every X Days",
  colour: 30,
  description: "Runs every X days, between days Y and Z.",

  connections: {
    mode: 'value',
    output: 'cron_day'
  },

  mutator,

  template: "Every %FREQUENCY days between %START and %END",

  fields: {
    FREQUENCY: {
      options: makeOptions({ factorsOf: 30 })
    },

    START: {
      options: makeOptions({ from: 1, upTo: 32 })
    },

    END: {
      options: makeOptions({ from: 1, upTo: 32, reverse: true })
    }
  },

  generators: {
    json: block => {
      const
        frequency = block.getFieldValue('FREQUENCY'),
        start = block.getFieldValue('START'),
        end = block.getFieldValue('END'),
        cronString = `${start}-${end}/${frequency}`

      return [ cronString, 0 ]
    }
  }
}
