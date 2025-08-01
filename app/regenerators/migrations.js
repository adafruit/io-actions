// These are for blocks that have been replaced with new blocks, but still
// exist in the database. The block definition gets removed, but a new
// regenerator is written here to catch those legacy blocks and "port" them
// to the new block when they are loaded.


export default {
  // becomes feed_set_value
  action_publish: {
    /** @type {import('#types').BlockRegenerator} */
    json: (blockObject, helpers) => {
      const payload = blockObject.publishAction

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
  },

  // becomes feed_get_value
  feed_selector: {
    /** @type {import('#types').BlockRegenerator} */
    json: blockObject => {
      const payload = blockObject.feed

      return {
        type: "feed_get_value",
        fields: {
          FEED_KEY: payload.key
        }
      }
    }
  }
}
