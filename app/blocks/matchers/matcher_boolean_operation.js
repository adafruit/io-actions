export default {
  type: 'matcher_boolean_operation',
  bytecodeKey: "matcherBooleanOperation",
  name: "Compare Matcher",
  colour: 60,
  inputsInline: true,
  description: "Perform a logic operation between the triggering Feed value and a block diagram.",

  connections: { mode: 'value', output: 'matcher' },

  template: `is true %OP %B`,

  fields: {
    OP: {
      options: [
        ['and', 'AND'],
        ['or', 'OR'],
      ]
    }
  },

  inputs: {
    B: {
      check: "expression",
      shadow: 'io_logic_boolean'
    }
  },

  generators: {
    json: (block, generator) => {
      const
        operator = block.getFieldValue('OP'),
        rightExp = generator.valueToCode(block, 'B', 0) || null,

        blockPayload = JSON.stringify({
          matcherBooleanOperation: {
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
        { comparator, right } = blockObject.matcherBooleanOperation,
        fields = {
          OP: comparator?.toUpperCase()
        },
        inputs = {
          B: helpers.expressionToBlock(right, { shadow: 'io_logic_boolean' }),
        }

      return { type: 'matcher_boolean_operation', fields, inputs }
    }
  }
}
