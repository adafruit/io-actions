/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'text_template',
  bytecodeKey: "textTemplate",
  name: "Text Template",

  colour: 180,
  inputsInline: true,

  connections: {
    mode: "value",
    output: [ "expression", "string" ],
  },

  template: "{{ %TEMPLATE",

  inputs: {
    TEMPLATE: {
      description: `
        ::: v-pre
        Create your template text with static content and dynamic {{ variable }} placeholders.

        Examples:
        - 'Alert: {{ feeds['temp.kitchen'].value }}°F detected'
        - 'Daily Report for {{ user.name }}: Battery at {{ vars.battery_level }}%'

        Use {{ }} to insert live data into your message.
        :::
      `,
      check: "expression",
      shadow: 'io_text_multiline'
    }
  },

  generators: {
    json: (block, generator) => {
      const
        template = generator.valueToCode(block, 'TEMPLATE', 0) || null,
        blockPayload = JSON.stringify({
          textTemplate: {
            template: JSON.parse(template)
          },
        })
      return [ blockPayload, 0 ]
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const
        { template } = blockObject.textTemplate,
        inputs = {
          TEMPLATE: helpers.expressionToBlock(template, { shadow: "io_text" })
        }
      return { type: 'text_template', inputs }
    }
  }
}
