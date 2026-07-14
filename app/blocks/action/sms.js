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
    %ICON SMS |CENTER
    Message: %BODY
  `,

  fields: {
    ICON: {
      image: {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.7A8 8 0 1 1 21 11.5z'/></svg>",
        width: 22,
        height: 22,
        alt: "SMS",
      }
    }
  },

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
