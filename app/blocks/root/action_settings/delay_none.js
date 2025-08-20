/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "delay_none",
  name: "No Delay",
  colour: "0",
  description: "No delay: Actions run immediately when triggered.",

  connections: {
    mode: 'value',
    output: "delay_period",
  },

  template: "No Delay",

  generators: {
    json: () => {}
  }
}
