export default {
  type: 'matcher_compare',
  bytecodeKey: "matcherCompare",
  name: "Compare Numbers Matcher",
  colour: 224,
  inputsInline: true,
  description: "Numerically compare the new Feed value with another number.",

  connections: { mode: 'value', output: 'matcher' },

  template: "%OP %B",

  fields: {
    OP: {
      description: "Select a comparison to perform",
      options: [
        ['=', 'EQ', "True if the two numbers are equal"],
        ['\u2260', 'NEQ', "True if the two numbers are not equal"],
        ['\u200F<', 'LT', "True if the Feed value is less than number B"],
        ['\u200F\u2264', 'LTE', "True if the Feed value is less than or equal to number B"],
        ['\u200F>', 'GT', "True if the Feed value is greater than number B"],
        ['\u200F\u2265', 'GTE', "True if the Feed value is greater than or equal to number B"],
      ]
    }
  },

  inputs: {
    B: {
      description: "The value to compare with the Feed value.",
      check: "expression",
      shadow: 'io_math_number'
    }
  },

  generators: {
    json: (block, generator) => {
      const
        comparator = block.getFieldValue('OP'),
        rightExp = generator.valueToCode(block, 'B', 0) || 'null',

        blockPayload = JSON.stringify({
          matcherCompare: {
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
        { comparator, right } = blockObject.matcherCompare,
        fields = {
          OP: comparator?.toUpperCase()
        },
        inputs = {
          B: helpers.expressionToBlock(right, { shadow: 'io_math_number' }),
        }

      return { type: 'matcher_compare', fields, inputs }
    }
  }
}
