/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "io_math_constrain",
  bytecodeKey: "constrain",
  name: "Constrain",
  colour: 120,
  description: "Keep any number within specified minimum and maximum boundaries. If the input value is below the minimum, it becomes the minimum. If above the maximum, it becomes the maximum. Perfect for ensuring values stay within expected ranges, creating percentage bounds, or limiting user input to acceptable values.",
  connections: {
    mode: "value",
    output: "number",
  },
  template: `
    Constrain %VALUE
    to %RANGE
  `,
  inputs: {
    VALUE: {
      description: "The number to limit within your specified boundaries. Examples: user input values, calculation results, sensor readings, or any numerical data that might go outside your desired range.",
      check: "expression",
      shadow: "io_math_number"
    },
    RANGE: {
      description: "The minimum and maximum limits for your value. Examples: (0,100) for percentages, (1,10) for rating scales, (-50,150) for temperature ranges, or any boundaries that make sense for your data. Values outside these limits get automatically adjusted to the nearest boundary.",
      check: 'range',
      shadow: {
        type: "math_range",
        inputs: {
          FROM: { shadow: {
            type: 'io_math_number',
            fields: { NUM: '0' }
          }},
          TO: { shadow: {
            type: 'io_math_number',
            fields: { NUM: '100' }
          }}
        }
      }
    }
  },
  generators: {
    json: (block, generator) => {
      const
        value = JSON.parse(generator.valueToCode(block, 'VALUE', 0)),
        range = JSON.parse(generator.valueToCode(block, 'RANGE', 0)),
        payload = { constrain: { value, range } }
      return [ JSON.stringify(payload), 0 ]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      const
        { value, range } = blockObject.constrain,
        inputs = {
          VALUE: helpers.expressionToBlock(value, { shadow: 'io_math_number' }),
          RANGE: helpers.expressionToBlock(range, {
            shadow: {
              type: "math_range",
              inputs: {
                FROM: { shadow: {
                  type: 'io_math_number',
                  fields: { NUM: '0' }
                }},
                TO: { shadow: {
                  type: 'io_math_number',
                  fields: { NUM: '100' }
                }}
              }
            }
          }),
        }
      return { type: 'io_math_constrain', inputs }
    }
  }
}
