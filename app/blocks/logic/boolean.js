/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_logic_boolean',
  name: "Boolean",
  colour: 60,
  description: "A true or false value.",

  connections: {
    mode: "value",
    output: [ "expression", "boolean" ],
  },

  template: "%BOOL",

  fields: {
    BOOL: {
      options: [
        ['true', 'TRUE'],
        ['false', 'FALSE'],
      ]
    }
  },

  generators: {
    json: block => {
      const bool = block.getFieldValue('BOOL') === 'TRUE'

      return [ JSON.stringify(bool), 0 ]
    }
  }
}
