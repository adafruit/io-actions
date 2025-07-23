import mutator from './if/mutator.js'


export default {
  type: 'io_controls_if',
  bytecodeKey: "conditional",
  name: "Conditional",
  description: "Execute different block diagrams based on the outcome of conditional checks.",
  colour: 60,

      // "if - the first value to check for truthiness",
      // "do - the commands to execute if the first check was true",
      // "else if - (optional, repeating) an extra value to check for truthiness",
      // "do - the commands to execute if the previous check was true",
      // "else - (optional) the commands to execute if no checks were true",

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

  // TODO: open a way to send raw documentation for the inputs section
  // the conditional block has a lot of dynamic behavior that is harder to
  // document plainly alongside the data definitions

  inputs: {
    IF0: {
      description: "Runs the given block tree and checks whether it resolve true or false. If true, executes the 'do' branch, otherwise moves onto the next if (if present), or the final else (if present.)",
      check: "expression",
      shadow: 'io_logic_boolean'
    },

    THEN0: {
      description: "The block diagram to execute when the preceding 'if' clause resolves to true",
      check: "expression",
      type: 'statement',
    },

    ELSE_IF_LABEL: {
      type: 'label',
    },

    ELSE_LABEL: {
      type: 'label',
    }
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
