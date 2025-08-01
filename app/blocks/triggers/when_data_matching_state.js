/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "when_data_matching_state",
  bytecodeKey: "whenDataMatchStateChanged",
  name: "Data Match Changing",
  colour: 30,
  inputsInline: true,
  description: "Run this Action when the specified Feed receives a data point that compares to its previous data point in the specified way.",

  connections: {
    mode: "statement",
    output: "trigger",
    next: "trigger"
  },

  mixins: [ 'replaceDropdownOptions' ],
  extensions: [ "populateFeedDropdown" ],

  template: "When %FEED_KEY gets data that %MATCH_STATE matching %MATCHER",

  inputs: {
    MATCHER: {
      description: "Attach a Matcher block to apply to both data points to make the specified comparison",
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
      description: "Select a Feed to watch for new data",
      align: "LEFT",
      options: [
        [ "Loading Feeds...", ""]
      ]
    },

    MATCH_STATE: {
      description: "Select the kind of change to watch for:",
      options: [
        ["starts", "starts", "the last data point DID NOT match, but this one DOES"],
        ["stops", "stops", "the last data point DID match, but this one DOES NOT"],
        ["keeps", "keeps", "both data points DO match"],
        ["keeps not", "avoids", "both data points DO NOT match"],
      ]
    }
  },

  generators: {
    json: (block, generator) => {
      const
        feed = block.getFieldValue('FEED_KEY'),
        state = block.getFieldValue('MATCH_STATE'),
        matcher = JSON.parse(generator.valueToCode(block, 'MATCHER', 0) || null),
        payload = JSON.stringify({
          whenDataMatchStateChanged: {
            feed, matcher, state
          }
        })

      return payload
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { feed, matcher, state } = blockObject.whenDataMatchStateChanged

      return {
        type: "when_data_matching_state",
        fields: {
          FEED_KEY: feed,
          MATCH_STATE: state,
        },
        inputs: {
          MATCHER: helpers.expressionToBlock(matcher)
        }
      }
    }
  }
}
