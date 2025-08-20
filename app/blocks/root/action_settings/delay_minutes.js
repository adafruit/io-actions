import { makeOptions } from "#app/util/fields.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "delay_minutes",
  name: "Delay Minutes",
  colour: "0",
  description: "Set a delay between 1 and 59 minutes",

  connections: {
    mode: 'value',
    output: "delay_period",
  },

  template: "%SECONDS minutes",

  fields: {
    SECONDS: {
      options: makeOptions({ from: 1, upTo: 60, valueFunc: sec => sec * 60 })
      // options: [
      //   ['1', '60'],
      //   ['2', '120'],
      //   ...
      //   ['58', '3480'],
      //   ['59', '3540'],
      // ]
    }
  },

  generators: {
    json: () => {}
  }
}
