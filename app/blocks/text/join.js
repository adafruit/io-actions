/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_text_join',
  bytecodeKey: "textJoin",
  name: "Join Text",

  colour: 180,
  inputsInline: true,

  connections: {
    mode: "value",
    output: "expression",
  },

  template: "%A + %B",

  inputs: {
    A: {
      description: "The first string of text - this will appear first in the combined output. Can be static text like 'Hello' or dynamic data from feeds/variables. Don't forget to add a space at the end if you want separation from the second text!",
      check: "expression",
      shadow: "io_text"
    },
    B: {
      description: "The second string of text - this will appear immediately after the first text with no automatic spacing. Can be static text or dynamic values. Add a space at the beginning if you need separation from the first text.",
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
