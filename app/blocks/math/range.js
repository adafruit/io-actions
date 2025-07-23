export default {
  type: "math_range",
  bytecodeKey: "range",
  name: "Range",
  color: 120,
  inputsInline: true,

  description: "A range of numbers specified by a lower and upper bound.",

  connections: {
    mode: "value",
    output: "range",
  },

  template: `(%FROM,%TO)`,

  inputs: {
    FROM: {
      description: "The lower bound of the range.",
      check: "expression",
      bytecodeProperty: "from",
      shadow: "io_math_number"
    },

    TO: {
      description: "The upper bound of the range.",
      check: "expression",
      bytecodeProperty: "to",
      shadow: "io_math_number"
    },
  },

  generators: {
    json: (block, generator) => {
      const
        from = JSON.parse(generator.valueToCode(block, 'FROM', 0)),
        to = JSON.parse(generator.valueToCode(block, 'TO', 0)),
        payload = { range: { from, to } }

      return [ JSON.stringify(payload), 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        { from, to } = blockObject.range,
        inputs = {
          FROM: helpers.expressionToBlock(from, { shadow: 'io_math_number' }),
          TO: helpers.expressionToBlock(to, { shadow: 'io_math_number' }),
        }

      return { type: 'math_range', inputs }
    }
  }
}
