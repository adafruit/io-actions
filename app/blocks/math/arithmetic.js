/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_math_arithmetic',
  bytecodeKey: "arithmetic",
  name: "Arithmetic",
  colour: 120,
  inputsInline: true,
  description: "Perform the specified arithmetic operation on two specified operands.",

  connections: {
    mode: "value",
    output: "expression",
  },

  template: `%A %OP %B`,

  inputs: {
    A: {
      description: "The left side of the operation. Will be coerced to a number",
      check: "expression",
      shadow: 'io_math_number'
    },

    B: {
      description: "The right side of the operation. Will be coerced to a number",
      check: "expression",
      shadow: 'io_math_number'
    },
  },

  fields: {
    OP: {
      description: "The mathematical operation to perform.",
      options: [
        ['+', 'ADD', "add two numbers"],
        ['-', 'MINUS', "subtract number B from number A"],
        ['x', 'MULTIPLY', "multiply two numbers"],
        ['/', 'DIVIDE', "divide number A by number B"],
        ['^', 'POWER', "raise number A to the power of number B"],
      ]
    }
  },

  generators: {
    json: (block, generator) => {
      const
        operatorMap = {
          ADD: '+',
          MINUS: '-',
          MULTIPLY: '*',
          DIVIDE: '/',
          POWER: '^'
        },
        operator = block.getFieldValue('OP'),
        leftExp = generator.valueToCode(block, 'A', 0) || 'null',
        rightExp = generator.valueToCode(block, 'B', 0) || 'null',

        blockPayload = JSON.stringify({
          arithmetic: {
            left: JSON.parse(leftExp),
            operator: operator
              ? operatorMap[operator]
              : null,
            right: JSON.parse(rightExp)
          }
        })

      return [ blockPayload, 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        payload = blockObject.arithmetic,
        operatorMap = {
          '+': 'ADD',
          '-': 'MINUS',
          '*': 'MULTIPLY',
          '/': 'DIVIDE',
          '^': 'POWER',
        },
        fields = {
          OP: operatorMap[payload.operator]
        },
        inputs = {
          A: helpers.expressionToBlock(payload.left, { shadow: 'io_math_number' }),
          B: helpers.expressionToBlock(payload.right, { shadow: 'io_math_number' }),
        }

      return { type: 'io_math_arithmetic', fields, inputs }
    }
  }
}
