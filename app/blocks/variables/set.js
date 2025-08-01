/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_variables_set',
  bytecodeKey: "setVariable",
  name: "Set Variable",
  inputsInline: true,
  colour: 240,
  description: "Set a variable to a value",

  connections: {
    mode: 'statement',
    output: "expression",
    next: "expression",
  },

  template: "Set variable %VAR = %VALUE",

  inputs: {
    VALUE: {
      check: "expression",
      shadow: "io_text",
    }
  },

  fields: {
    VAR: {
      type: 'field_variable'
    }
  },

  generators: {
    json: (block, generator) => {
      const
        variableName = block.getField('VAR').getText(),
        value = generator.valueToCode(block, 'VALUE', 0)

      const
        // TODO: this is suspect, try valueToCode() || null, above
        defaultedValue = value
          ? JSON.parse(value)
          // @ts-ignore
          : (value !== 0 && value !== null) && null,
        blockPayload = JSON.stringify({
          setVariable: {
            name: variableName,
            value: defaultedValue
          }
        })

      return blockPayload
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        { name, value } = blockObject.setVariable,
        id = helpers.registerVariable(name)

      return {
        type: "io_variables_set",
        fields: {
          VAR: { id }
        },
        inputs: {
          VALUE: helpers.expressionToBlock(value, { shadow: "io_text" })
        }
      }
    }
  }
}
