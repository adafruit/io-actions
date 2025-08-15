/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_logic_negate',
  bytecodeKey: "negate",
  name: "Negate",
  colour: 60,
  description: "Flip any condition to its opposite - turns true into false and false into true. Essential for creating inverse logic like 'if NOT raining', 'if door is NOT open', or 'if temperature is NOT above 75°F'. Perfect for building exception handling, safety conditions, and reverse automation logic in your IoT Actions.",
  connections: {
    mode: "value",
    output: "expression",
  },
  template: "not %EXPRESSION",
  inputs: {
    EXPRESSION: {
      description: "Connect any condition or comparison that you want to reverse. Examples: attach 'temperature > 80' to create 'NOT temperature > 80' (meaning temperature ≤ 80), or 'motion detected' to create 'NOT motion detected' (meaning no motion).",
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
