/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "when_data_matching",
  bytecodeKey: "whenDataMatching",
  name: "Data Matching",
  colour: 30,
  inputsInline: true,
  description: "The most common trigger type - runs your Action immediately whenever new data arrives at a feed that meets your specified condition. Perfect for real-time responses like 'send alert when temperature exceeds 85°F', 'turn on lights when motion detected', or 'notify me when battery drops below 20%'. This trigger fires every single time the condition is met.",
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
      description: "Define the condition that incoming data must meet to trigger this Action. Examples: 'equals 1' (for button presses), 'greater than 80' (for temperature alerts), 'contains \"motion\"' (for text matching), or 'any value' (triggers on every data point regardless of value).",
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
      description: "Choose which feed to monitor for new incoming data. Every time fresh data arrives at this feed, it will be tested against your matcher condition.",
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
