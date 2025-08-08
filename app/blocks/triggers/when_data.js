/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "when_data",
  bytecodeKey: "whenData",
  name: "Any Data",
  colour: 30,
  inputsInline: true,
  description: "The simplest trigger - runs your Action every single time ANY new data arrives at a feed, regardless of what the value is. Perfect for logging all activity ('record every sensor reading'), acknowledging data receipt ('send confirmation for every message'), or triggering workflows that need to process all incoming data. No conditions, no filtering - just pure data arrival detection.",
  connections: {
    mode: "statement",
    output: "trigger",
    next: "trigger"
  },
  mixins: ['replaceDropdownOptions'],
  extensions: ['populateFeedDropdown'],
  template: "When %FEED_KEY gets any data |LEFT",
  fields: {
    FEED_KEY: {
      description: "Choose which feed to monitor for activity. Every single data point that arrives at this feed will trigger your Action - whether it's a number, text, true/false, or any other value type.",
      options: [
        [ "Loading Feeds...", ""]
      ]
    }
  },
  generators: {
    json: block => {
      const
        feed = block.getFieldValue('FEED_KEY'),
        payload = JSON.stringify({
          whenData: { feed }
        })
      return payload
    }
  },
  regenerators: {
    json: blockObject => {
      const payload = blockObject.whenData
      return {
        type: "when_data",
        fields: {
          FEED_KEY: payload.feed
        }
      }
    }
  }
}
