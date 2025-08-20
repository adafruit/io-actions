import { makeOptions } from "#app/util/fields.js"
import mutator from './month_mutator.js'


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "every_months_between",
  name: "Every X Months",
  colour: 30,
  description: "Runs every X months, between months Y and Z.",

  connections: {
    mode: 'value',
    output: 'cron_month'
  },

  mutator,

  template: "Every %FREQUENCY months between %START and %END",

  fields: {
    FREQUENCY: { options: makeOptions({ factorsOf: 12 }) },

    START: { options: makeOptions({ from: 1, upTo: 13 }) },

    END: { options: makeOptions({ from: 1, upTo: 13, reverse: true }) }
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
