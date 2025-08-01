/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_variables_get',
  bytecodeKey: "getVariable",
  name: "Get Variable",
  colour: 240,
  description: "Get the value previously assigned to a variable.",

  connections: {
    mode: 'value',
    output: "expression",
  },

  template: "Get variable %VAR",

  fields: {
    VAR: {
      type: 'field_variable'
    }
  },

  generators: {
    json: block => {
      const
        name = block.getField('VAR').getText(),
        blockPayload = JSON.stringify({
          getVariable: {
            name
          }
        })

      return [ blockPayload, 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        { name } = blockObject.getVariable,
        id = helpers.registerVariable(name)

      return {
        type: "io_variables_get",
        fields: {
          VAR: { id }
        },
      }
    }
  }
}
