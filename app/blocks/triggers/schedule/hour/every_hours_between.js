import { makeOptions } from "#app/util/fields.js"
import mutator from "./hour_mutator.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "every_hours_between",
  name: "Every X Hours",
  colour: 30,
  description: "Runs every X hours, between hours Y and Z.",

  connections: {
    mode: 'value',
    output: 'cron_hour'
  },

  mutator,

  template: "Every %FREQUENCY hours between %START and %END",

  fields: {
    FREQUENCY: { options: makeOptions({ factorsOf: 24 }) },

    START: { options: makeOptions({ upTo: 24 }) },

    END: { options: makeOptions({ upTo: 24, reverse: true }) }
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
