/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "math_map",
  bytecodeKey: "mapValue",
  name: "Map",
  colour: 120,
  description: "Transform sensor readings and data values by scaling them from one number range to another. Essential for IoT projects that need to convert raw sensor data (like 0-1023 from Arduino analog pins) into meaningful units (like 0-100% humidity), or translate between different measurement systems. Perfect for normalizing data, creating percentage values, or adapting sensor outputs to match your specific needs.",
  connections: {
    mode: "value",
    output: "number",
  },
  template: `
    Map
    Value: %VALUE
    From: %FROM_RANGE
    To: %TO_RANGE
  `,
  inputs: {
    VALUE: {
      description: "The raw number you want to convert to a different scale. Examples: sensor reading of 512 (from 0-1023 analog range), temperature of 25°C (for Fahrenheit conversion), or any numerical data that needs scaling to a new range.",
      check: "expression",
      bytecodeProperty: "value",
      shadow: 'io_math_number'
    },
    FROM_RANGE: {
      description: "The original scale that your input value currently represents. Examples: (0,1023) for Arduino analog sensors, (0,255) for RGB color values, (-40,125) for temperature sensor ranges, or (0,100) for percentage data that needs different scaling.",
      check: 'range',
      bytecodeProperty: "from",
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
    },
    TO_RANGE: {
      description: "The new scale you want to convert your value to. Examples: (0,100) for percentage displays, (0.0,1.0) for normalized values, (32,212) for Fahrenheit conversion, or any target range that matches your display needs or system requirements.",
      check: 'range',
      bytecodeProperty: "to",
      shadow: {
        type: "math_range",
        inputs: {
          FROM: { shadow: {
            type: 'io_math_number',
            fields: { NUM: '0.0' }
          }},
          TO: { shadow: {
            type: 'io_math_number',
            fields: { NUM: '1.0' }
          }}
        }
      }
    },
  },
  generators: {
    json: (block, generator) => {
      const
        value = JSON.parse(generator.valueToCode(block, 'VALUE', 0) || null),
        from = JSON.parse(generator.valueToCode(block, 'FROM_RANGE', 0)),
        to = JSON.parse(generator.valueToCode(block, 'TO_RANGE', 0)),
        payload = { mapValue: { value, from, to }}
      return [ JSON.stringify(payload), 0 ]
    }
  },
  regenerators: {
    json: (blockObject, helpers) => {
      const
        { value, to, from } = blockObject.mapValue,
        inputs = {
          VALUE: helpers.expressionToBlock(value, { shadow: 'io_math_number' }),
          FROM_RANGE: helpers.expressionToBlock(from, {
            shadow: {
              type: 'math_range',
              inputs: {
                FROM: { shadow: {
                  type: 'io_math_number',
                  fields: { NUM: '0' }
                } },
                TO: { shadow: {
                  type: 'io_math_number',
                  fields: { NUM: '100' }
                } },
              }
            }
          }),
          TO_RANGE: helpers.expressionToBlock(to, {
            shadow: {
              type: 'math_range',
              inputs: {
                FROM: { shadow: {
                  type: 'io_math_number',
                  fields: { NUM: '0' }
                } },
                TO: { shadow: {
                  type: 'io_math_number',
                  fields: { NUM: '1' }
                } },
              }
            }
          }),
        }
      return { type: 'math_map', inputs }
    }
  }
}
