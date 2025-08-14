/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_logic_operation',
  bytecodeKey: "logic",
  name: "Logic Operation",
  inputsInline: true,
  colour: 60,
  description: "Combine multiple conditions to create sophisticated decision logic in your Actions. Perfect for complex automation like 'if temperature is high AND humidity is low', 'if motion detected OR door opened', or any scenario where you need multiple criteria to work together. Essential for building smart, multi-factor IoT control systems.",
  connections: {
    mode: "value",
    output: "expression",
  },
  template: `%A %OP %B`,
  inputs: {
    A: {
      description: "The first condition to evaluate (left side). Connect comparison blocks, sensor checks, or any logic that results in true/false. Examples: 'temperature > 80', 'door equals open', or 'battery < 20%'.",
      check: "expression",
      shadow: 'io_logic_boolean'
    },
    B: {
      description: "The second condition to evaluate (right side). Connect another comparison, sensor check, or boolean logic. Examples: 'humidity > 60%', 'motion detected', or 'time between 9 AM and 5 PM'.",
      check: "expression",
      shadow: 'io_logic_boolean'
    }
  },
  fields: {
    OP: {
      description: "Choose how to combine your two conditions:",
      options: [
        ['and', 'AND', "Both conditions must be true: Returns true only when BOTH inputs are true (e.g., 'temperature > 80 AND humidity < 30' for hot and dry conditions requiring both criteria simultaneously)."],
        ['or', 'OR', "Either condition can be true: Returns true when AT LEAST ONE input is true (e.g., 'motion detected OR door opened' triggers on any activity, 'battery < 10% OR offline > 1 hour' for multiple alert conditions)."],
      ]
    }
  },
  generators: {
    json: (block, generator) => {
      const
        operator = block.getFieldValue('OP'),
        leftExp = generator.valueToCode(block, 'A', 0) || null,
        rightExp = generator.valueToCode(block, 'B', 0) || null,
        blockPayload = JSON.stringify({
          logic: {
            left: JSON.parse(leftExp),
            comparator: operator?.toLowerCase() || null,
            right: JSON.parse(rightExp),
          },
        })
      return [ blockPayload, 0 ]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      const
        { comparator, left, right } = blockObject.logic,
        fields = {
          OP: comparator?.toUpperCase()
        },
        inputs: {
          A: helpers.expressionToBlock(left, { shadow: 'io_logic_boolean' }),
          B: helpers.expressionToBlock(right, { shadow: 'io_logic_boolean' }),
        }
      return { type: 'io_logic_operation', fields, inputs }
    }
  }
}
