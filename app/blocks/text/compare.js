export default {
  type: 'text_compare',
  bytecodeKey: 'textCompare',
  name: "Compare Text",
  colour: 180,
  inputsInline: true,
  description: "Compare two chunks of text for equality, inequality, or inclusion.",

  connections: {
    mode: "value",
    output: "expression",
  },

  template: `%A %OP %B`,

  inputs: {
    A: {
      description: "The left side of the comparison. Will be coerced to a string",
      check: "expression",
      shadow: 'io_text'
    },

    B: {
      description: "The right side of the comparison. Will be coerced to a string",
      check: "expression",
      shadow: 'io_text'
    },
  },

  fields: {
    OP: {
      description: "Select what kind of comparison to do:",
      options: [
        ['=', 'EQ', "Returns true if the the inputs are the same."],
        ['\u2260', 'NEQ', "Returns true if the inputs not the same."],
        ['includes', 'INC', "Returns true if input A includes input B."],
      ]
    }
  },

  generators: {
    json: (block, generator) => {
      const
        comparator = block.getFieldValue('OP'),
        leftExp = generator.valueToCode(block, 'A', 0) || null,
        rightExp = generator.valueToCode(block, 'B', 0) || null,

        blockPayload = JSON.stringify({
          textCompare: {
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
        { comparator, left, right } = blockObject.textCompare,
        fields = {
          OP: comparator?.toUpperCase()
        },
        inputs = {
          A: helpers.expressionToBlock(left, { shadow: "io_text" }),
          B: helpers.expressionToBlock(right, { shadow: "io_text" }),
        }

      return { type: 'text_compare', fields, inputs }
    }
  }
}
