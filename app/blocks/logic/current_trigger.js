
/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "current_trigger",
  name: "Trigger Compare",
  bytecodeKey: "current_trigger",
  colour: 60,
  description: "Returns a boolean expression indicating whether the Action was triggered by the same trigger as this block.",

  connections: {
    mode: "value",
    output: "expression",
  },

  template: "Current Trigger: %INPUT_A",

  inputs: {
    INPUT_A: {
      description: "The trigger block to compare with the Actions triggers, returning true if the action was triggered by the same trigger.",
      check: "trigger",
      type: "statement",
      shadow: {
        type: 'when_data',
        fields: { FEED_KEY: "" }
      }
    }
  },

  generators: {
    json: (block, generator) => {
      const payload = {
        current_trigger: {
          trigger: JSON.parse(generator.statementToCode(block, 'INPUT_A') || null)
        }
      }

      return JSON.stringify(payload)
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const payload = blockObject.current_trigger
      return {  
        type: 'current_trigger',
        inputs: {
          INPUT_A: helpers.expressionToBlock(payload.trigger, { shadow: 'when_data' })
        }
      }
    }
  }
}
