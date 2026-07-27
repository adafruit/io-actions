import { singleLineTemplate, multilineLineTemplate } from "#app/blocks/shadows.js"


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "action_email",
  bytecodeKey: "emailAction",
  name: "Email",
  description: `Sends an email with given subject and body templates`,
  primaryCategory: 'Actions',
  color: "0",

  connections: {
    mode: "statement",
    output: "expression",
    next: 'expression'
  },

  inputs: {
    SUBJECT: {
      description: "a template for generating the email subject",
      check: "expression",
      bytecodeProperty: "subjectTemplate",
      shadow: singleLineTemplate,
    },

    BODY: {
      description: "a multi-line template for generating the email body",
      check: "expression",
      bytecodeProperty: "bodyTemplate",
      shadow: multilineLineTemplate,
    }
  },

  template: `
    %ICON Email |CENTER
    Subject: %SUBJECT
    Body: %BODY
  `,

  fields: {
    ICON: {
      image: {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='5' width='18' height='14' rx='2.5'/><path d='M3.5 7.5l8.5 6 8.5-6'/></svg>",
        width: 22,
        height: 22,
        alt: "Email",
      }
    }
  },

  generators: {
    json: (block, generator) => {
      const payload = {
        emailAction: {
          subjectTemplate: JSON.parse(generator.valueToCode(block, 'SUBJECT', 0) || null),
          bodyTemplate: JSON.parse(generator.valueToCode(block, 'BODY', 0) || null)
        }
      }

      return JSON.stringify(payload)
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const payload = blockObject.emailAction

      return {
        type: "action_email",
        inputs: {
          // TODO: regenerators need to support nested shadow blocks
          SUBJECT: helpers.expressionToBlock(payload.subjectTemplate, { shadow: 'text_template' }),
          BODY: helpers.expressionToBlock(payload.bodyTemplate, { shadow: 'text_template' })
        }
      }
    }
  }
}
