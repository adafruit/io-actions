/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_variables_get',
  bytecodeKey: "getVariable",
  name: "Get Variable",
  colour: 240,
  description: "Retrieve the value stored in a variable that was previously set using a Set Variable block. Use this to access stored feed values, calculation results, or any data saved earlier in your Action.",
  connections: {
    mode: 'value',
    output: "expression",
  },
  template: "Get variable %VAR",
  fields: {
    VAR: {
      description: "Select the variable name whose value you want to retrieve. The variable must have been created and assigned a value earlier in your Action using a Set Variable block.",
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
