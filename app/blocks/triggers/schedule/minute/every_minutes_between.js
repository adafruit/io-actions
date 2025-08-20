import { makeOptions } from "#app/util/fields.js"
import mutator from './minute_mutator.js'


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "every_minutes_between",
  name: "Every X Minutes",
  colour: 30,
  description: "Runs every X minutes, between minutes Y and Z.",

  connections: {
    mode: 'value',
    output: 'cron_minute'
  },

  mutator,

  template: "Every %FREQUENCY minutes between %START and %END",

  fields: {
    FREQUENCY: { options: makeOptions({ factorsOf: 60 }) },

    START: { options: makeOptions({ upTo: 60 }) },

    END: { options: makeOptions({ upTo: 60, reverse: true }) }
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
