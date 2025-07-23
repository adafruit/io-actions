export default {
  type: "feed_get_value",
  bytecodeKey: "getFeedValue",
  name: "Get Feed Value",
  colour: 300,
  description: "Resolves to the last value of this feed or component, always a String",

  mixins: ['replaceDropdownOptions'],
  extensions: ['populateFeedDropdown'],

  connections: {
    mode: "value",
    output: "expression",
  },

  template: `Get %FEED_KEY`,

  fields: {
    FEED_KEY: {
      description: "Select the Feed you'd like to fetch data from",
      // TODO: a way to override select options documentation because
      // this block selector field is dynamically populated
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
          getFeedValue: { key }
        })

      return [ payload, 0 ]
    }
  },

  regenerators: {
    json: blockObject => {
      const payload = blockObject.getFeedValue

      return {
        type: "feed_get_value",
        fields: {
          FEED_KEY: payload.key
        }
      }
    }
  }
}
