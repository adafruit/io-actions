/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "io_math_round",
  bytecodeKey: "round",
  name: "Round/Floor/Ceiling",
  color: 120,
  description: "Round a value to the nearest whole number via round, floor, or ceiling functions",

  connections: {
    mode: "value",
    output: "expression",
  },

  inputs: {
    VALUE: {
      description: "A value you'd like to round to a whole number. Will be coerced to a number.",
      bytecodeProperty: "value",
      check: "expression",
      shadow: "io_math_number"
    }
  },

  fields: {
    OPERATION: {
      description: "Select which rounding operation to perform on the input:",
      options: [
        ["Round", "round", "if .5 or higher: round up; otherwise round down"],
        ["Floor", "floor", "rounds down"],
        ["Ceiling", "ceiling", "rounds up"],
      ],
      bytecodeProperty: "operation",
    }
  },

  template: "%OPERATION %VALUE",

  generators: {
    json: (block, generator) => {
      const
        value = JSON.parse(generator.valueToCode(block, 'VALUE', 0)),
        operation = block.getFieldValue('OPERATION'),
        payload = { round: { value, operation } }

      return [ JSON.stringify(payload), 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        { value, operation } = blockObject.round,
        inputs = {
          VALUE: helpers.expressionToBlock(value, { shadow: 'io_math_number' }),
        },
        fields = {
          OPERATION: operation,
        }

      return { type: 'io_math_round', inputs, fields }
    }
  }
}
