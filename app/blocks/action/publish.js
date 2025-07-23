// deprecated: use feeds/set_value
export default {
  type: "action_publish",
  bytecodeKey: "publishAction",
  name: "Publish to Feed",
  colour: "0",
  description: "Sends the given value to the specified Feed.",

  connections: {
    mode: "statement",
    output: "expression",
    next: 'expression'
  },

  template: `
    📈 Publish |CENTER
    ...value: %VALUE
    ...to: %FEED
  `,

  inputs: {
    VALUE: {
      description: "The value to write to the Feed.",
      check: "expression",
      shadow: 'io_text'
    },

    FEED: {
      description: "The Feed to write to.",
      check: "expression",
      shadow: 'feed_selector'
    },
  },

  generators: {
    json: (block, generator) => {
      const payload = {
        publishAction: {
          feed: JSON.parse(generator.valueToCode(block, 'FEED', 0) || null),
          value: JSON.parse(generator.valueToCode(block, 'VALUE', 0) || null)
        }
      }

      return JSON.stringify(payload)
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const payload = blockObject.publishAction

      // migrating to a new block
      return {
        type: "feed_set_value",
        fields: {
          FEED_KEY: payload.feed.feed.key,
        },
        inputs: {
          VALUE: helpers.expressionToBlock(payload.value, { shadow: 'io_text' }),
        }
      }
    }
  }
}
