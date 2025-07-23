export default {
  type: 'io_logic_operation',
  bytecodeKey: "logic",
  name: "Logic Operation",
  inputsInline: true,
  colour: 60,
  description: "Perform the specifed boolean logic operation on two operands.",

  connections: {
    mode: "value",
    output: "expression",
  },

  template: `%A %OP %B`,

  inputs: {
    A: {
      description: "A block diagram that will be resolved to a truthy/falsy value",
      check: "expression",
      shadow: 'io_logic_boolean'
    },

    B: {
      description: "A block diagram that will be resolved to a truthy/falsy value",
      check: "expression",
      shadow: 'io_logic_boolean'
    }
  },

  fields: {
    OP: {
      description: "Select the logic operation to perform on the inputs:",
      options: [
        ['and', 'AND', "Resolve `true` if both operands are true, otherwise `false`."],
        ['or', 'OR', "Resolve `true` if either or both operands are true, otherwise `false`."],
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
        inputs = {
          A: helpers.expressionToBlock(left, { shadow: 'io_logic_boolean' }),
          B: helpers.expressionToBlock(right, { shadow: 'io_logic_boolean' }),
        }

      return { type: 'io_logic_operation', fields, inputs }
    }
  }
}
