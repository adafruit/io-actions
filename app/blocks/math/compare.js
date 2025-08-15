/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_logic_compare',
  bytecodeKey: "",
  name: "Compare Numbers",
  colour: 120,
  inputsInline: true,
  primaryCategory: "Math",
  description: "Build mathematical conditions by comparing any two numerical values in your Action logic. Perfect for creating if/then statements like 'if temperature is greater than target temp', 'if battery level equals low threshold', or 'if sensor reading is between two values'. Works with feed data, variables, calculations, or any numerical inputs.",
  connections: {
    mode: "value",
    output: "expression",
  },
  template: `%A %OP %B`,
  inputs: {
    A: {
      description: "The first number to compare (left side). Can be sensor data, variable values, calculation results, or any numerical input. Text and other data types will be automatically converted to numbers where possible.",
      check: "expression",
      shadow: 'io_math_number'
    },
    B: {
      description: "The second number to compare (right side). Can be threshold values, target numbers, other sensor readings, or any numerical data you want to compare against the first input. Also automatically converted to numbers.",
      check: "expression",
      shadow: 'io_math_number'
    },
  },
  fields: {
    OP: {
      description: "Choose the mathematical relationship to test between your two numbers:",
      options: [
        ['=', 'EQ', "Exactly equal: True when both numbers are precisely the same (e.g., temperature = 72.0, useful for exact target matching or digital sensor states like 0/1)."],
        ['\u2260', 'NEQ', "Not equal: True when the numbers are different by any amount (e.g., sensor reading ≠ error value, useful for detecting changes or valid readings)."],
        ['\u200F<', 'LT', "Less than: True when first number is smaller (e.g., temperature < comfort threshold, battery < critical level for alerts)."],
        ['\u200F\u2264', 'LTE', "Less than or equal: True when first number is smaller or exactly equal (e.g., humidity ≤ 40% for dry conditions, speed ≤ 0 for stopped state)."],
        ['\u200F>', 'GT', "Greater than: True when first number is larger (e.g., pressure > storm threshold, light level > daylight minimum for automation)."],
        ['\u200F\u2265', 'GTE', "Greater than or equal: True when first number is larger or exactly equal (e.g., temperature ≥ 75°F for cooling, count ≥ 10 for bulk processing)."],
      ]
    }
  },
  generators: {
    json: (block, generator) => {
      const
        comparator = block.getFieldValue('OP'),
        leftExp = generator.valueToCode(block, 'A', 0) || 'null',
        rightExp = generator.valueToCode(block, 'B', 0) || 'null',
        blockPayload = JSON.stringify({
          compare: {
            left: JSON.parse(leftExp),
            comparator: comparator?.toLowerCase() || null,
            right: JSON.parse(rightExp),
          },
        })
      return [ blockPayload, 0 ]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      const
        { comparator, left, right } = blockObject.compare,
        fields = {
          OP: comparator?.toUpperCase()
        },
        inputs = {
          A: helpers.expressionToBlock(left, { shadow: 'io_math_number' }),
          B: helpers.expressionToBlock(right, { shadow: 'io_math_number' }),
        }
      return { type: 'io_logic_compare', fields, inputs }
    }
  }
}
