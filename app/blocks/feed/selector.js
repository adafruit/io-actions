// deprecated: use feeds/get_value
export default {
  type: "feed_selector",
  bytecodeKey: "feed",
  name: "Feed",
  colour: 300,
  description: "The last value of this feed or component, always a String",

  mixins: ['replaceDropdownOptions'],
  extensions: ['populateFeedDropdown'],

  connections: {
    mode: "value",
    output: "expression",
  },

  template: "Feed: %FEED_KEY",

  fields: {
    FEED_KEY: {
      description: "A listing of the User's Feeds to select from.",
      options: [
        [ "Loading Feeds...", "" ],
      ]
    }
  },

  generators: {
    json: block => {
      const
        key = block.getFieldValue('FEED_KEY'),
        payload = JSON.stringify({
          feed: { key }
        })

      return [ payload, 0 ]
    }
  },

  regenerators: {
    json: blockObject => {
      const payload = blockObject.feed

      // migrating to a new block
      return {
        type: "feed_get_value",
        fields: {
          FEED_KEY: payload.key
        }
      }
    }
  }
}
