/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'text_compare',
  bytecodeKey: 'textCompare',
  name: "Text Compare",

  colour: 180,
  inputsInline: true,
  primaryCategory: "Logic",

  connections: {
    mode: "value",
    output: "expression",
  },

  template: "%A %OP %B",

  inputs: {
    A: {
      description: "Left text value to compare",
      check: "expression",
      shadow: "io_text"
    },
    B: {
      description: "Right text value to compare",
      check: "expression",
      shadow: "io_text"
    }
  },

  fields: {
    OP: {
      description: "Choose how to compare the two text inputs:",
      options: [
        ['=', 'EQ', "Exact match: Returns true only if both inputs are identical (e.g., 'online' = 'online' is true, but 'Online' = 'online' is false due to case sensitivity)."],
        ['\u2260', 'NEQ', "Not equal: Returns true if the inputs are different in any way (e.g., useful for 'if status is not offline' or 'if username is not empty' conditions)."],
        ['includes', 'INC', "Contains: Returns true if the first input contains the second input anywhere within it (e.g., 'sensor error timeout' includes 'error' would be true)."],
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
