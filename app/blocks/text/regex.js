/** @type {import('#types').BlockDefinitionRaw} */
export default {
  disabled: true,

  type: 'text_regex',
  bytecodeKey: "textRegex",
  name: "Regular Expression",
  colour: 180,
  description: "Apply the given regular expression to the given text, returning the first match.",

  template: `
    Regex: %REGEX
    Matches? %TARGET
  `,

  inputs: {
    REGEX: {
      description: "The regular expression to apply to the target text.",
      shadow: "io_text"
    },

    TARGET: {
      description: "The target text that the regular expression will be applied to",
      shadow: "io_text"
    },
  },

  generators: {
    json: (block, generator) => {
      const
        regexExp = generator.valueToCode(block, 'REGEX', 0) || null,
        targetExp = generator.valueToCode(block, 'TARGET', 0) || null,

        blockPayload = JSON.stringify({
          textRegex: {
            regex: JSON.parse(regexExp),
            target: JSON.parse(targetExp),
          },
        })

      return [ blockPayload, 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        { regex, target } = blockObject.textRegex,
        inputs = {
          REGEX: helpers.expressionToBlock(regex, { shadow: "io_text" }),
          TARGET: helpers.expressionToBlock(target, { shadow: "io_text" }),
        }

      return { type: 'text_regex', inputs }
    }
  }
}
