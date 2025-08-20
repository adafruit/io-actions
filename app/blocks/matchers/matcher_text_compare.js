/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'matcher_text_compare',
  bytecodeKey: "matcherTextCompare",
  name: "Compare Text Matcher",
  colour: 180,
  inputsInline: true,
  description: "Compare text-based feed data using smart text matching. Perfect for triggers based on status messages ('door opened', 'motion detected'), device states ('online', 'offline'), or any text-based sensor data. Works with exact matches, exclusions, or partial text detection within longer messages.",
  connections: { mode: 'value', output: 'matcher' },
  template: "%OP %B",
  inputs: {
    B: {
      description: "The text to compare against your feed data. Examples: 'open' to detect door status, 'motion' for PIR sensors, 'online' for device connectivity, or any specific word/phrase you're monitoring for.",
      check: "expression",
      shadow: 'io_text'
    }
  },
  fields: {
    OP: {
      description: "Choose how to compare the incoming feed data with your text:",
      options: [
        ['=', 'EQ', "Exact match: Feed value must be exactly the same as your text (e.g., feed='online' matches text='online', but 'ONLINE' or 'device online' would not match)."],
        ['\u2260', 'NEQ', "Not equal: Feed value must be different from your text (e.g., useful for 'not offline' conditions or excluding specific status messages)."],
        ['includes', 'INC', "Contains: Feed value includes your text anywhere within it (e.g., feed='motion detected at 3pm' would match text='motion', perfect for parsing longer status messages)."],
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
