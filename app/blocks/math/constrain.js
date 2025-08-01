/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "io_math_constrain",
  bytecodeKey: "constrain",
  name: "Constrain",
  colour: 120,
  description: "Constrain a given number to fall within a given range.",

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
      check: "expression",
      shadow: "io_math_number"
    },

    RANGE: {
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
