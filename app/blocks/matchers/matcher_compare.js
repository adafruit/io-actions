/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'matcher_compare',
  bytecodeKey: "matcherCompare",
  name: "Compare Numbers Matcher",
  colour: 224,
  inputsInline: true,
  description: "Create smart triggers based on numerical sensor data and thresholds. Perfect for temperature alerts ('notify when above 80°F'), battery monitoring ('warn when below 20%'), humidity control ('turn on fan when over 60%'), or any sensor-based automation that depends on numerical comparisons.",
  connections: { mode: 'value', output: 'matcher' },
  template: "%OP %B",
  fields: {
    OP: {
      description: "Choose how to compare your feed's numerical data:",
      options: [
        ['=', 'EQ', "Exactly equal: Triggers when feed value equals your number (e.g., button state = 1, exact temperature reading = 72.5°F). Best for digital switches and precise measurements."],
        ['\u2260', 'NEQ', "Not equal: Triggers when feed value is anything other than your number (e.g., not zero, sensor reading changed from baseline). Useful for detecting changes or non-specific states."],
        ['\u200F<', 'LT', "Less than: Triggers when feed value drops below your threshold (e.g., temperature < 60°F for heating alerts, battery < 15% for low power warnings)."],
        ['\u200F\u2264', 'LTE', "Less than or equal: Triggers when feed value is at or below threshold (e.g., humidity ≤ 30% for dry air alerts, speed ≤ 0 for stopped condition)."],
        ['\u200F>', 'GT', "Greater than: Triggers when feed value exceeds your threshold (e.g., temperature > 85°F for cooling alerts, motion count > 10 for high activity)."],
        ['\u200F\u2265', 'GTE', "Greater than or equal: Triggers when feed value meets or exceeds threshold (e.g., pressure ≥ 1000 hPa for weather tracking, light level ≥ 500 for daylight detection)."],
      ]
    }
  },
  inputs: {
    B: {
      description: "Set your comparison threshold or target value. Examples: 80 for temperature alerts, 20 for battery percentage warnings, 1000 for pressure readings, or any numerical value that's meaningful for your sensor data.",
      check: "expression",
      shadow: 'io_math_number'
    }
  },
  generators: {
    json: (block, generator) => {
      const
        comparator = block.getFieldValue('OP'),
        rightExp = generator.valueToCode(block, 'B', 0) || 'null',
        blockPayload = JSON.stringify({
          matcherCompare: {
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
        { comparator, right } = blockObject.matcherCompare,
        fields = {
          OP: comparator?.toUpperCase()
        },
        inputs = {
          B: helpers.expressionToBlock(right, { shadow: 'io_math_number' }),
        }
      return { type: 'matcher_compare', fields, inputs }
    }
  }
}
