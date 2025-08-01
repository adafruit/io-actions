import { multilineLineTemplate } from "#app/blocks/shadows.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "action_sms",
  bytecodeKey: "smsAction",
  name: "SMS",
  colour: "0",
  description: "Sends a text message with a given body template.",
  ioPlus: true,

  connections: {
    mode: "statement",
    output: "expression",
    next: 'expression'
  },

  template: `
    📲 SMS |CENTER
    Message: %BODY
  `,

  inputs: {
    BODY: {
      description: "A template for generating the SMS body",
      check: "expression",
      shadow: multilineLineTemplate
    }
  },

  generators: {
    json: (block, generator) => {
      const payload = {
        smsAction: {
          bodyTemplate: JSON.parse(generator.valueToCode(block, 'BODY', 0) || null)
        }
      }

      return JSON.stringify(payload)
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const payload = blockObject.smsAction

      return {
        type: "action_sms",
        inputs: {
          // TODO: regenerators need to support nested shadow blocks
          BODY: helpers.expressionToBlock(payload.bodyTemplate, { shadow: 'text_template' })
        }
      }
    }
  }
}
