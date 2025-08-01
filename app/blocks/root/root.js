import mutator from './action_settings/mutator.js'


/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "action_root",
  name: "Root",
  colour: "0",
  description: "Add Triggers to determine when this Action runs. Add Actions to determine what this Action does.",

  connections: {},

  mutator,

  template: `
    Triggers: |LEFT
    %TRIGGERS

    Actions: |LEFT
    %EXPRESSIONS
    \u3164
  `,

  inputs: {
    TRIGGERS: {
      type: 'statement',
      check: 'trigger'
    },

    EXPRESSIONS: {
      type: 'statement',
      check: 'expression'
    }
  },

  generators: {
    json: (block, generator) => {
      const parseStatementToCodeAsJson = statementInputName => {
        let expressions = []

        try {
          let expressionsJson = generator.statementToCode(block, statementInputName)

          try {
            expressions = JSON.parse(`[${expressionsJson}]`)
          } catch(e) {
            console.error("Error parsing JSON:", expressionsJson)
            console.error(e)
          }
        } catch(e) {
          console.error(`Error calling statementToCode on root input ${statementInputName}:`)
          console.error(e)
        }

        return expressions
      }

      const
        // @ts-ignore
        seconds = block.delaySeconds,
        // @ts-ignore
        mode = block.delayMode,
        delay = (seconds > 0)
          ? { seconds, mode }
          : undefined

      return JSON.stringify({
        version: "1.0.0-beta.1",
        settings: { delay },
        triggers: parseStatementToCodeAsJson('TRIGGERS'),
        expressions: parseStatementToCodeAsJson('EXPRESSIONS'),
      }, null, 2)
    }
  },

  regenerators: {
    json: (blockObject, helpers) => {
      const { triggers, expressions, settings } = blockObject

      return {
        type: "action_root",
        movable: false,
        deletable: false,
        x: 50,
        y: 50,
        extraState: {
          delaySeconds: settings.delay?.seconds || 0,
          delayMode: settings.delay?.mode || 'extend'
        },
        inputs: {
          "TRIGGERS": helpers.arrayToStatements(triggers),
          "EXPRESSIONS": helpers.arrayToStatements(expressions),
        }
      }
    }
  }
}
