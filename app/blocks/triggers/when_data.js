/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "when_data",
  bytecodeKey: "whenData",
  name: "Any Data",
  colour: 30,
  inputsInline: true,
  description: "Run this action when a Feed receives a new data point.",

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
      description: "the Feed to watch for new data points",
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
