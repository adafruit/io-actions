import mutator from './action_settings/mutator.js'
/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "action_root",
  name: "Root",
  colour: "0",
  description: "The Root block is the foundation of every Adafruit IO Action. Connect Triggers (like 'when temperature > 80°F' or 'every morning at 8 AM') to define when your Action runs, then attach Action blocks (like 'send email', 'publish to feed', or 'if/then logic') to define what happens when triggered.",
  connections: {},
  mutator,
  template: `
    Triggers: |LEFT
    %TRIGGERS
    Actions: |LEFT
    %ACTIONS
    \u00A0
  `,
  inputs: {
    TRIGGERS: {
      description: "Connect trigger blocks here to define WHEN your Action should run. Choose from Reactive triggers (respond to feed updates), Scheduled triggers (run at specific times), or Timer triggers (delayed responses). Multiple triggers can be added, and any of the trigger conditions being true will cause the action to run (after an optional delay).",
      type: 'statement',
      check: 'trigger'
    },
    ACTIONS: {
      description: "Connect action blocks here to define WHAT happens when your triggers activate. This can include sending emails, publishing values to feeds, conditional if/then logic, mathematical operations, or webhook calls. Actions execute in sequence from top to bottom.",
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
        expressions: parseStatementToCodeAsJson('ACTIONS'),
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
          "ACTIONS": helpers.arrayToStatements(expressions),
        }
      }
    }
  }
}
