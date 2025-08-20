/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "delay_days",
  name: "Delay Days",
  colour: "0",
  description: "1 day is the maximum delay available",

  connections: {
    mode: 'value',
    output: "delay_period",
  },

  template: "1 day",

  generators: {
    json: () => {}
  }
}
