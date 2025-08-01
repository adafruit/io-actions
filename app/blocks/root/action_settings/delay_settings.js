/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "delay_settings",
  name: "Delay Settings",
  colour: '0',
  description: "Causes a delay between this Action's trigger and its execution",

  connections: { },

  template: `
    Delay Settings |CENTER
    Delay: %DELAY_PERIOD
    and %DELAY_MODE
    existing delays
  `,

  inputs: {
    DELAY_PERIOD: {
      description: "how long to delay, from 1 second to 1 day",
      check: 'delay_period',
      shadow: 'delay_none',
    }
  },

  fields: {
    DELAY_MODE: {
      description: "how to proceed if another action is already on delay",
      options: [
        ['reset', 'extend', "deletes the existing delay and start a new one"],
        ['keep', 'static', "keeps the existing delay and ignore new triggers"],
      ],
    }
  },

  generators: {
    json: () => [ {}, 0 ]
  }
}
