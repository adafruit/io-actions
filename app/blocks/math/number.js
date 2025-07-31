/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_math_number',
  name: "Number",
  color: 120,

  description: "A numeric value, whole or decimal.",

  connections: {
    mode: "value",
    output: [ "expression", "number" ],
  },

  extensions: {
    validateNumbers: ({ block }) => {
      const numField = block.getField("NUM")

      if(!numField) { throw new Error("NUM field missing on io_math_number?") }

      numField.setValidator(newValue => {
        const parsed = Number(newValue)

        if(!parsed && parsed !== 0) {
          return null // failed to parse, signal validation failure

        } else {
          return parsed// parsed fine, use the result
        }
      })
    }
  },

  template: " %NUM",

  fields: {
    NUM: { text: '0' }
  },

  generators: {
    json: block => {
      return [Number(block.getFieldValue('NUM')) || '0', 0]
    }
  }
}
