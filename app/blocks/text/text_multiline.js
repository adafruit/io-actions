export default {
  type: 'io_text_multiline',
  name: "Multiline Text",
  colour: 180,
  description: "A String of longer-form text with newlines.",

  connections: {
    mode: "value",
    output: "String",
  },

  template: "¶ %TEXT",

  fields: {
    TEXT: {
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
