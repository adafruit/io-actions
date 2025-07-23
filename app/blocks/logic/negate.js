export default {
  type: 'io_logic_negate',
  bytecodeKey: "negate",
  name: "Negate",
  colour: 60,
  description: "Swaps a truthy value to `false`, or a falsy value to `true`.",

  connections: {
    mode: "value",
    output: "expression",
  },

  template: "not %EXPRESSION",

  inputs: {
    EXPRESSION: {
      description: "Block diagram that will be resolved, then have its truthiness flipped.",
      check: "expression",
      shadow: 'io_logic_boolean'
    }
  },

  generators: {
    json: (block, generator) => {
      const
        operand = generator.valueToCode(block, 'EXPRESSION', 0) || null,
        payload = {
          negate: {
            target: JSON.parse(operand)
          }
        }

      return [ JSON.stringify(payload), 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const payload = blockObject.negate

      return {
        type: 'io_logic_negate',
        inputs: {
          EXPRESSION: helpers.expressionToBlock(payload.target, { shadow: 'io_logic_boolean' })
        }
      }
    }
  }
}
