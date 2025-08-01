/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_logic_compare',
  bytecodeKey: "",
  name: "Compare Numbers",
  colour: 120,
  inputsInline: true,
  primaryCategory: "Math",
  description: "Numerically compare two given values using the selected math operation.",

  connections: {
    mode: "value",
    output: "expression",
  },

  template: `%A %OP %B`,

  inputs: {
    A: {
      description: "The left side of the comparison. Will be coerced to a number",
      check: "expression",
      shadow: 'io_math_number'
    },

    B: {
      description: "The right side of the comparison. Will be coerced to a number",
      check: "expression",
      shadow: 'io_math_number'
    },
  },

  fields: {
    OP: {
      description: "The mathematical comparison to use.",
      options: [
        ['=', 'EQ', "True if the two numbers are equal"],
        ['\u2260', 'NEQ', "True if the two numbers are not equal"],
        ['\u200F<', 'LT', "True if number A is less than number B"],
        ['\u200F\u2264', 'LTE', "True if number A is less than or equal to number B"],
        ['\u200F>', 'GT', "True if number A is greater than number B"],
        ['\u200F\u2265', 'GTE', "True if number A is greater than or equal to number B"],
      ]
    }
  },

  generators: {
    json: (block, generator) => {
      const
        comparator = block.getFieldValue('OP'),
        leftExp = generator.valueToCode(block, 'A', 0) || 'null',
        rightExp = generator.valueToCode(block, 'B', 0) || 'null',

        blockPayload = JSON.stringify({
          compare: {
            left: JSON.parse(leftExp),
            comparator: comparator?.toLowerCase() || null,
            right: JSON.parse(rightExp),
          },
        })

      return [ blockPayload, 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        { comparator, left, right } = blockObject.compare,
        fields = {
          OP: comparator?.toUpperCase()
        },
        inputs = {
          A: helpers.expressionToBlock(left, { shadow: 'io_math_number' }),
          B: helpers.expressionToBlock(right, { shadow: 'io_math_number' }),
        }

      return { type: 'io_logic_compare', fields, inputs }
    }
  }
}
