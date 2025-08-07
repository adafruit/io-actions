/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "math_map",
  bytecodeKey: "mapValue",
  name: "Map",
  colour: 120,
  description: "Scale a value from one range of numbers to another",
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
      description: "The number to scale from the original range to the target range.",
      check: "expression",
      bytecodeProperty: "value",
      shadow: 'io_math_number'
    },
    FROM_RANGE: {
      description: "The original range that the input value comes from (e.g., sensor readings from 0 to 1023).",
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
      description: "The target range to scale the value to (e.g., convert to 0.0-1.0 for percentages).",
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
