import mutator from './if/mutator.js'
/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_controls_if',
  bytecodeKey: "conditional",
  name: "Conditional",
  description: "Create smart decision-making logic for your IoT Actions using if/then/else statements. Perfect for building automation like 'if temperature > 80°F then turn on fan, else if temperature < 60°F then turn on heater, else turn off both'. Essential for creating intelligent responses based on sensor data, time conditions, or any combination of factors.",
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
      This condition will always be checked first. Connect comparison blocks, sensor checks, or any logic that results in true/false. If it evaluates to \`true\`, the actions in the corresponding 'do' section will execute, and the rest of the conditional block will be skipped. If \`false\`, execution moves to the next "else if" (if present), or the final "else" (if present).

      **Examples:**
      - \`temperature > 80\` - Check if it's hot
      - \`motion detected AND time after sunset\` - Security logic
      - \`battery level < 15%\` - Low power warning

      ### \`Do\`
      The actions to execute when the preceding "if" or "else if" condition is \`true\`. Connect any action blocks like sending emails, controlling devices, publishing to feeds, or logging data. These actions only run if their corresponding condition evaluates to true.

      **Examples:**
      - Send alert email + turn on cooling fan
      - Log warning message + publish backup data
      - Turn on lights + send notification

      ### \`Else if\`
      **Optional:** Add additional conditions to test if the main "if" was false. Click the gear icon and select "+ else if" to add more branches. Each "else if" is only checked if all previous conditions were false. Perfect for handling multiple scenarios like different temperature ranges, various alert levels, or time-based alternatives.

      **Examples:**
      - \`else if temperature < 60\` → turn on heater
      - \`else if battery < 50%\` → reduce power consumption  
      - \`else if motion detected\` → different security response

      ### \`Else\`
      **Optional:** The fallback section that executes when ALL "if" and "else if" conditions are false. Click the gear icon and select "+ else" to add this section. Perfect for default actions, error handling, or "normal operation" behavior.

      **Examples:**
      - Turn off all climate control (temperature is in normal range)
      - Send "all systems normal" status update
      - Resume regular power consumption mode
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
