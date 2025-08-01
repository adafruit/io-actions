import mutator from './if/mutator.js'


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_controls_if',
  bytecodeKey: "conditional",
  name: "Conditional",
  description: "Execute different block diagrams based on the outcome of conditional checks.",
  colour: 60,

  connections: {
    mode: "statement",
    output: "expression",
    next: 'expression'
  },

  mutator,

  template: `
    if %IF0
    do %THEN0
    else if %ELSE_IF_LABEL
    else %ELSE_LABEL
  `,

  inputs: {
    IF0: {
      check: "expression",
      shadow: 'io_logic_boolean'
    },

    THEN0: {
      check: "expression",
      type: 'statement',
      shadow: {
        type:'action_log',
        inputs: {
          EXPRESSION: {
            shadow: {
              type: 'io_text',
              fields: {
                TEXT: 'conditional was true!'
              }
            }
          }
        }
      }
    },

    ELSE_IF_LABEL: {
      type: 'label',
    },

    ELSE_LABEL: {
      type: 'label',
    }
  },

  docOverrides: {
    inputs: `
      ### \`If\`
      This block tree will always be run. If it resolve to \`true\`, the blocks
      under the next 'do' section will be executed. Otherwise, execution moves
      to the next "else if" (if present), or the final "else" (if present.)

      ### \`Do\`
      The block diagram to execute when the preceding "if" or "else if" clause
      resolves to \`true\`.

      ### \`Else if\`
      **Optional:** "else if" only appears after clicking "+ else if", and can be
      removed by clicking the "-" next to it.

      Another "if" to check, only if every prior if has executed and none
      resolved to \`true\`.

      ### \`Else\`
      **Optional:** "else" only appears after clicking "+ else", and can be removed
      by clicking "-" next to it.

      This section will execute if all "if"s and "else-if"s have been executed and
      all resolved to \`false\`.
    `
  },

  generators: {
    json: (block, generator) => {
      const payload = {
        conditional: {}
      }

      let index = 0
      while(block.getInput(`IF${index}`)) {
        const
          ifClause = generator.valueToCode(block, `IF${index}`, 0) || 'null',
          thenClause = generator.statementToCode(block, `THEN${index}`) || ''

        payload.conditional[`if${index}`] = JSON.parse(ifClause)
        payload.conditional[`then${index}`] = JSON.parse(`[ ${thenClause} ]`)

        index += 1
      }

      if(block.getInput('ELSE')) {
        const elseClause = generator.statementToCode(block, 'ELSE') || ''

        payload.conditional.else = JSON.parse(`[${ elseClause }]`)
      }

      return JSON.stringify(payload)
    }
  },

  regenerators: {
    json: (bytecode, helpers) => {
      const payload = bytecode.conditional

      if(!payload) {
        throw new Error("No data for io_controls_if regenerator")
      }

      const inputs = {}

      let index = 0
      while(payload[`if${index}`] || payload[`then${index}`]) {
        inputs[`IF${index}`] = helpers.expressionToBlock(payload[`if${index}`], { shadow: 'io_logic_boolean' })
        inputs[`THEN${index}`] = helpers.arrayToStatements(payload[`then${index}`])

        index += 1
      }

      if(payload.else) {
        inputs.ELSE = helpers.arrayToStatements(payload.else)
      }

      return {
        type: "io_controls_if",
        inputs,
        extraState: {
          elseIfCount: index-1, // only count else-ifs, don't count initial if
          elsePresent: !!payload.else
        }
      }
    }
  }
}
