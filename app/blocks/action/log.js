/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "action_log",
  bytecodeKey: "logAction",
  name: "Log",
  colour: "0",
  description: "Executes the block you plug in and reveals its final value or error message.",

  connections: {
    mode: "statement",
    output: "expression",
    next: 'expression'
  },

  template: "Log: %EXPRESSION",

  inputs: {
    EXPRESSION: {
      description: "A Block diagram you'd like to see the resolved value and type of.",
      check: "expression",
      shadow: 'io_text'
    }
  },

  generators: {
    json: (block, generator) => {
      const payload = {
        logAction: {
          line: JSON.parse(generator.valueToCode(block, 'EXPRESSION', 0) || null)
        }
      }

      return JSON.stringify(payload)
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const payload = blockObject.logAction

      if(!payload) {
        throw new Error("No data for action_log regenerator")
      }

      return {
        type: "action_log",
        inputs: {
          EXPRESSION: helpers.expressionToBlock(payload.line, { shadow: 'io_text' })
        }
      }
    }
  }
}
