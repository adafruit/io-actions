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
    🔗 Webhook |CENTER
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
