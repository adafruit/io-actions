/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_text_join',
  bytecodeKey: "textJoin",
  name: "Join Text",
  colour: 180,
  inputsInline: true,
  description: "Join two pieces of text into one.",

  connections: {
    mode: "value",
    output: "expression",
  },

  template: "%A + %B",

  inputs: {
    A: {
      description: "The first string of text",
      check: "expression",
      shadow: "io_text"
    },

    B: {
      description: "The last string of text",
      check: "expression",
      shadow: "io_text"
    },
  },

  generators: {
    json: (block, generator) => {
      const
        leftExp = generator.valueToCode(block, 'A', 0) || null,
        rightExp = generator.valueToCode(block, 'B', 0) || null,

        blockPayload = JSON.stringify({
          textJoin: {
            left: JSON.parse(leftExp),
            right: JSON.parse(rightExp),
          },
        })

      return [ blockPayload, 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        { left, right } = blockObject.textJoin,
        inputs = {
          A: helpers.expressionToBlock(left, { shadow: "io_text" }),
          B: helpers.expressionToBlock(right, { shadow: "io_text" }),
        }

      return { type: 'io_text_join', inputs }
    }
  }
}
