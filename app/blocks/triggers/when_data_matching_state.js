/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "when_data_matching_state",
  bytecodeKey: "whenDataMatchStateChanged",
  name: "Data Match Changing",
  colour: 30,
  inputsInline: true,
  description: "Advanced trigger that watches for changes in how your feed data matches a condition over time. Unlike basic triggers that just check if data equals a value, this compares the current data point with the previous one to detect when conditions START being true, STOP being true, or CONTINUE being true. Perfect for detecting state changes like 'temperature just went above 80°' or 'door just closed after being open'.",
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
      description: "The condition to test against both the previous and current data points. For example: 'equals 1', 'greater than 80', or 'contains \"open\"'. This same condition is applied to both the old and new values to determine the state change.",
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
      description: "Choose which feed to monitor for incoming data. Each new data point will be compared against the previous one using your matcher condition.",
      align: "LEFT",
      options: [
        [ "Loading Feeds...", ""]
      ]
    },
    MATCH_STATE: {
      description: "Select what kind of change pattern you want to detect between the previous and current data points:",
      options: [
        ["starts", "starts", "Triggers when the condition becomes true for the first time (previous data didn't match, but new data does). Example: temperature was below 80°, now it's above 80°."],
        ["stops", "stops", "Triggers when the condition stops being true (previous data matched, but new data doesn't). Example: door was open, now it's closed."],
        ["keeps", "keeps", "Triggers when the condition remains true (both previous and current data match). Example: temperature stays above 80° for multiple readings."],
        ["keeps not", "avoids", "Triggers when the condition remains false (both previous and current data don't match). Example: temperature stays below 80° for multiple readings."],
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
