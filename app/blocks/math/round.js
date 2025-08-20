/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "io_math_round",
  bytecodeKey: "round",
  name: "Round/Floor/Ceiling",
  color: 120,
  description: "Convert decimal numbers to whole numbers using different rounding strategies. Perfect for cleaning up sensor readings (23.7°F → 24°F), creating clean display values (3.14159 → 3), or preparing data for systems that only accept integers. Choose round for normal rounding, floor for always rounding down, or ceiling for always rounding up.",
  connections: {
    mode: "value",
    output: "expression",
  },
  inputs: {
    VALUE: {
      description: "The decimal number you want to convert to a whole number. Examples: sensor readings like 72.8°F, calculated values like 3.14159, or any numerical data that needs to be simplified. Non-numeric values will be automatically converted to numbers where possible.",
      bytecodeProperty: "value",
      check: "expression",
      shadow: "io_math_number"
    }
  },
  fields: {
    OPERATION: {
      description: "Choose how to convert your decimal to a whole number:",
      options: [
        ["Round", "round", "Standard rounding: 0.5 or higher rounds up, below 0.5 rounds down (e.g., 23.7 → 24, 23.4 → 23, 23.5 → 24). Best for general use and displaying clean values."],
        ["Floor", "floor", "Always rounds down to the nearest whole number, regardless of decimal value (e.g., 23.9 → 23, 23.1 → 23). Perfect for counting items, time calculations, or when you need conservative estimates."],
        ["Ceiling", "ceiling", "Always rounds up to the nearest whole number, regardless of decimal value (e.g., 23.1 → 24, 23.9 → 24). Great for capacity planning, ensuring minimum values, or safety margins."],
      ],
      bytecodeProperty: "operation",
    }
  },
  template: "%OPERATION %VALUE",
  generators: {
    json: (block, generator) => {
      const
        value = JSON.parse(generator.valueToCode(block, 'VALUE', 0)),
        operation = block.getFieldValue('OPERATION'),
        payload = { round: { value, operation } }
      return [ JSON.stringify(payload), 0 ]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      const
        { value, operation } = blockObject.round,
        inputs = {
          VALUE: helpers.expressionToBlock(value, { shadow: 'io_math_number' }),
        },
        fields = {
          OPERATION: operation,
        }
      return { type: 'io_math_round', inputs, fields }
    }
  }
}
