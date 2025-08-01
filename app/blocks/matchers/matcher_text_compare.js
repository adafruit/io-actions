/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'matcher_text_compare',
  bytecodeKey: "matcherTextCompare",
  name: "Compare Text Matcher",
  colour: 180,
  inputsInline: true,
  description: "Compare the new feed value with text for equality, inequality, or inclusion.",

  connections: { mode: 'value', output: 'matcher' },

  template: "%OP %B",

  inputs: {
    B: {
      description: "The string to compare with the Feed value.",
      check: "expression",
      shadow: 'io_text'
    }
  },

  fields: {
    OP: {
      description: "Select what kind of comparison to do:",
      options: [
        ['=', 'EQ', "Returns true if the Feed value and text are the same."],
        ['\u2260', 'NEQ', "Returns true if the Feed value and text are not the same."],
        ['includes', 'INC', "Returns true if the Feed value includes the text."],
      ]
    }
  },

  generators: {
    json: (block, generator) => {
      const
        comparator = block.getFieldValue('OP'),
        rightExp = generator.valueToCode(block, 'B', 0) || null,

        blockPayload = JSON.stringify({
          matcherTextCompare: {
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
        { comparator, right } = blockObject.matcherTextCompare,
        fields = {
          OP: comparator?.toUpperCase()
        },
        inputs = {
          B: helpers.expressionToBlock(right, { shadow: "io_text" }),
        }

      return { type: 'matcher_text_compare', fields, inputs }
    }
  }
}
