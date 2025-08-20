/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "io_text",
  name: "Text",
  colour: 180,
  description: "Enter any text content for use in your Actions - words, phrases, device commands, or messages. Perfect for setting device states ('on', 'off'), creating notification messages ('Alert: High temperature detected'), defining comparison values ('motion detected'), or sending commands to connected systems. The building block for all text-based automation and communication.",
  connections: {
    mode: "value",
    output: [ "expression", "string" ],
  },
  template: `"%TEXT`,
  fields: {
    TEXT: {
      description: "Type your text content here. Examples: 'on' for device commands, 'High temperature alert!' for notifications, 'motion' for sensor state matching, email subjects like 'Daily Report', or any words/phrases your automation needs. Single line text only - use Multiline Text block for paragraphs.",
      text: ''
    }
  },
  generators: {
    json: block => {
      const text = block.getFieldValue('TEXT')
      return [ JSON.stringify(text), 0 ]
    }
  }
}
