/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "feed_set_value",
  bytecodeKey: "setFeedValue",
  name: "Set Feed Value",
  inputsInline: true,
  colour: 300,
  description: "Publish the specified data point to the specified Feed.",

  mixins: ['replaceDropdownOptions'],
  extensions: ['populateFeedDropdown'],

  connections: {
    mode: "statement",
    output: "expression",
    next: 'expression'
  },

  template: "Set %FEED_KEY to: %VALUE",

  inputs: {
    VALUE: {
      description: "The value to publish to the Feed.",
      check: "expression",
      shadow: 'io_text'
    }
  },

  fields: {
    FEED_KEY: {
      description: "Select the Feed you wish to publish to",
      options: [
        [ "Loading Feeds...", "" ],
      ]
    }
  },

  generators: {
    json: (block, generator) => {
      const
        value = generator.valueToCode(block, 'VALUE', 0) || null,
        payload = {
          setFeedValue: {
            key: block.getFieldValue('FEED_KEY'),
            value: JSON.parse(value)
          }
        }

      return JSON.stringify(payload)
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const payload = blockObject.setFeedValue

      return {
        type: "feed_set_value",
        fields: {
          FEED_KEY: payload.key,
        },
        inputs: {
          VALUE: helpers.expressionToBlock(payload.value, { shadow: 'io_text' }),
        }
      }
    }
  }
}
