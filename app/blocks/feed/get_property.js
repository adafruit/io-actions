/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "feed_get_property",
  bytecodeKey: "getFeedProperty",
  name: "Get Feed Property",
  colour: 300,
  description: "Get a specific property from a feed such as its key, name, last value, previous value, timestamps, unit information, or status. Use this to access feed metadata beyond just the current value.",

  mixins: ['replaceDropdownOptions'],
  extensions: ['populateFeedDropdown'],

  connections: {
    mode: "value",
    output: "expression",
  },

  template: `
    Get property: %PROPERTY |CENTER
    from: %FEED_KEY
  `,

  fields: {
    PROPERTY: {
      description: "Which property to retrieve from the feed.",
      options: [
        ['Feed Key', 'key'],
        ['Name', 'name'],
        ['Description', 'description'],
        ['Current Value', 'current_value'],
        ['Previous/Last Value', 'last_value'],
        ['Updated At (UTC)', 'updated_at'],
        ['Created At (UTC)', 'created_at'],
        ['Unit Type', 'unit_type'],
        ['Unit Symbol', 'unit_symbol'],
        ['Status', 'status'],
        ['Visibility', 'visibility'],
      ]
    },
    FEED_KEY: {
      description: "Select the Feed to get the property from",
      options: [
        [ "Loading Feeds...", "" ],
      ]
    }
  },

  generators: {
    json: block => {
      const
        property = block.getFieldValue('PROPERTY'),
        key = block.getFieldValue('FEED_KEY'),
        payload = JSON.stringify({
          getFeedProperty: { key, property }
        })

      return [ payload, 0 ]
    }
  },

  regenerators: {
    json: blockObject => {
      const payload = blockObject.getFeedProperty

      if (!payload) {
        throw new Error("No getFeedProperty data for feed_get_property regenerator")
      }

      return {
        type: "feed_get_property",
        fields: {
          PROPERTY: payload.property,
          FEED_KEY: payload.key
        }
      }
    }
  }
}
