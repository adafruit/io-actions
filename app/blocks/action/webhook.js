import { multilineLineTemplate } from "#app/blocks/shadows.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "action_webhook",
  bytecodeKey: "webhookAction",
  name: "Webhook",
  colour: "0",
  description: "Sends an HTTP POST request to a given URL, with a BODY template using FEED data.",

  connections: {
    mode: "statement",
    output: "expression",
    next: 'expression'
  },


  template: `
    %ICON Webhook |CENTER
    URL: %URL
    Form Encode? %FORM_ENCODE
    POST Body: %BODY
  `,

  inputs: {
    URL: {
      description:  "A valid web location to send a POST request to.",
      check: "expression",
      shadow: {
        type: 'io_text',
        fields: { TEXT: 'https://...' }
      }
    },

    BODY: {
      description: "A JSON template to render and POST",
      check: "expression",
      shadow: multilineLineTemplate
    }
  },

  fields: {
    ICON: {
      image: {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9.5 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2'/><path d='M14.5 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2'/></svg>",
        width: 22,
        height: 22,
        alt: "Webhook",
      }
    },
    FORM_ENCODE: {
      description: "Encode as an HTML form input",
      checked: false
    }
  },

  generators: {
    json: (block, generator) => {
      const payload = {
        webhookAction: {
          url: JSON.parse(generator.valueToCode(block, 'URL', 0) || null),
          bodyTemplate: JSON.parse(generator.valueToCode(block, 'BODY', 0) || null),
          formEncoded: block.getFieldValue('FORM_ENCODE') === 'TRUE'
        }
      }

      return JSON.stringify(payload)
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const payload = blockObject.webhookAction

      return {
        type: "action_webhook",
        inputs: {
          URL: helpers.expressionToBlock(payload.url, { shadow: 'io_text' }),
          BODY: helpers.expressionToBlock(payload.bodyTemplate, { shadow: 'io_text_multiline' }),
        },
        fields: {
          FORM_ENCODE: payload.formEncoded ? 'TRUE' : 'FALSE'
        }
      }
    }
  }
}
