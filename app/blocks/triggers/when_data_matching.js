/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "when_data_matching",
  bytecodeKey: "whenDataMatching",
  name: "Data Matching",
  colour: 30,
  inputsInline: true,
  description: "Run this Action when the specified Feed receives data that matches the specified condition.",

  connections: {
    mode: "statement",
    output: "trigger",
    next: "trigger"
  },

  mixins: ['replaceDropdownOptions'],
  extensions: [ "populateFeedDropdown" ],

  template: "When %FEED_KEY gets data matching: %MATCHER",

  inputs: {
    MATCHER: {
      description: "Attach a Matcher block to compare against new Feed values",
      check: 'matcher',
      shadow: {
        type: 'matcher_compare',
        inputs: {
          B: { shadow: { type: 'io_math_number' } },
        }
      }
    }
  },

  fields: {
    FEED_KEY: {
      description: "Select the Feed to watch for new data.",
      options: [
        [ "Loading Feeds...", ""]
      ]
    }
  },

  generators: {
    json: (block, generator) => {
      const
        feed = block.getFieldValue('FEED_KEY'),
        matcher = JSON.parse(generator.valueToCode(block, 'MATCHER', 0) || null),
        payload = JSON.stringify({
          whenDataMatching: {
            feed, matcher
          }
        })

      return payload
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const payload = blockObject.whenDataMatching

      return {
        type: "when_data_matching",
        fields: {
          FEED_KEY: payload.feed
        },
        inputs: {
          MATCHER: helpers.expressionToBlock(payload.matcher)
        }
      }
    }
  }
}
