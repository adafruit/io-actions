/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_text_multiline',
  name: "Multiline Text",
  colour: 180,
  description: "Create formatted text content with multiple lines, paragraphs, and line breaks. Perfect for composing detailed email messages, creating formatted reports with sensor data, writing multi-paragraph notifications, or building structured text content that needs proper formatting and readability across multiple lines.",
  connections: {
    mode: "value",
    output: [ "expression", "string" ],
  },
  template: "¶ %TEXT",
  fields: {
    TEXT: {
      description: "Enter your multi-line text content here. Use Enter/Return to create new lines and paragraphs. Perfect for email templates ('Dear User,\\n\\nYour temperature reading is...\\n\\nBest regards'), formatted reports, detailed notifications, or any text that needs structure and readability.",
      multiline_text: ''
    }
  },
  generators: {
    json: block => {
      const text = block.getFieldValue('TEXT')
      return [ JSON.stringify(text), 0 ]
    }
  }
}
