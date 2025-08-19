/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_math_number',
  name: "Number",
  color: 120,
  description: "Enter any numerical value for use in your IoT Actions - whole numbers, decimals, positive, or negative. Perfect for setting thresholds (like 75 for temperature alerts), target values (like 50% for humidity control), timer durations (like 300 seconds), or any numerical data your automation needs. The foundation for all mathematical operations and comparisons.",
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
    NUM: { 
      description: "Enter your numerical value here. Examples: 75 (temperature threshold), 3.14159 (mathematical constant), -10 (negative temperature), 0.5 (percentage as decimal), or any number your automation requires. Validates input to ensure it's a proper number.",
      text: '0' 
    }
  },
  generators: {
    json: block => {
      return [Number(block.getFieldValue('NUM')) || '0', 0]
    }
  }
}
