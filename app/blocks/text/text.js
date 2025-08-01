/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "io_text",
  name: "Text",
  colour: 180,
  description: "A String of text",

  connections: {
    mode: "value",
    output: [ "expression", "string" ],
  },

  template: `"%TEXT`,

  fields: {
    TEXT: {
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
