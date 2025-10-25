/* LOCAL->> */
const blockRegenerators = {}
/* <<-LOCAL */

const BYTECODE_BLOCK_TYPE_MAP = {
  onSchedule: 'on_schedule',
  everyMonth: 'on_schedule',
  everyDay: 'on_schedule',
  everyHour: 'on_schedule',
  everyMinute: 'on_schedule',
  whenData: 'when_data',
  whenDataMatching: 'when_data_matching',
  whenDataMatchStateChanged: 'when_data_matching_state',
  matcherCompare: 'matcher_compare',
  matcherTextCompare: 'matcher_text_compare',
  logAction: 'action_log',
  conditional: 'io_controls_if',
  compare: 'io_logic_compare',
  textCompare: 'text_compare',
  textTemplate: 'text_template',
  textJoin: 'io_text_join',
  // textRegex: 'text_regex',
  arithmetic: 'io_math_arithmetic',
  mapValue: 'math_map',
  round: 'io_math_round',
  constrain: 'io_math_constrain',
  range: 'math_range',
  logic: 'io_logic_operation',
  negate: 'io_logic_negate',
  setVariable: 'io_variables_set',
  getVariable: 'io_variables_get',
  getFeedValue: 'feed_get_value',
  setFeedValue: 'feed_set_value',
  airQuality: 'air_quality',
  webhookAction: 'action_webhook',
  emailAction: 'action_email',
  smsAction: 'action_sms',
  // removed blocks that have migration regenerators
  // see: app/regenerators/migrations.js
  feed: 'feed_selector',
  publishAction: 'action_publish',
  jsonPathQuery: 'advanced_json_path_query',
}

const lookupRegenerator = expressionName => {
  return blockRegenerators[expressionName] ||
    blockRegenerators[BYTECODE_BLOCK_TYPE_MAP[expressionName]]
}

const lookupRootRegenerator = () => blockRegenerators.action_root.json

const makeBlockType = (type, attrs={}) => {
  return { block: { type, ...attrs }}
}

let variableRegistry = []
const helpers = {
  objectExpressionToBlock: expressionBytecode => {
    const expKeys = Object.keys(expressionBytecode)

    if(expKeys.length !== 1) {
      throw new Error(`Block bytecode must have exactly 1 key, got: ${expKeys}`)
    }

    const
      expType = expKeys[0],
      blockRegenerator = lookupRegenerator(expType)

    if(!blockRegenerator) {
      throw new Error(`No regenerator defined for block type: ${expType}`)
    }

    const
      blockJson = blockRegenerator.json(expressionBytecode, helpers),
      collectionNames = ['inputs', 'fields']

    // remove any fields or inputs with null or undefined values
    collectionNames.forEach(collectionName => {
      const collection = blockJson[collectionName]
      if(!collection) { return }
      for (const [name, value] of Object.entries(collection)) {
        if(value === null || value === undefined) {
          console.warn(`Block type "${blockJson.type}" has null ${collectionName}: "${name}"`)
          delete collection[name]
        }
      }
    })

    return { block: blockJson }
  },

  parseShadow: shadowOption => {
    if(typeof shadowOption === 'string') {
      return { shadow: { type: shadowOption }}
    }

    return { shadow: shadowOption }
  },

  expressionToBlock: (expressionBytecode, options={}) => {
    if(expressionBytecode === null || expressionBytecode === undefined) {
      return options.shadow
        ? helpers.parseShadow(options.shadow)
        : null
    }

    const expressionType = typeof expressionBytecode

    let expressionBlock
    switch(expressionType) {
      case 'string':
        expressionBlock = (expressionBytecode.includes("\n") || options.shadow === 'io_text_multiline')
          ? makeBlockType("io_text_multiline", { fields: { "TEXT": expressionBytecode }})
          : makeBlockType("io_text", { fields: { "TEXT": expressionBytecode }})
        break

      case 'number':
        expressionBlock = makeBlockType("io_math_number", { fields: { "NUM": expressionBytecode }})
        break

      case 'boolean':
        expressionBlock = makeBlockType("io_logic_boolean", { fields: { "BOOL": expressionBytecode ? 'TRUE' : 'FALSE' }})
        break

      case 'object':
        expressionBlock = helpers.objectExpressionToBlock(expressionBytecode)
        break

      default: throw new Error(`Unrecognized expression type: ${expressionType}`)
    }

    return options.shadow
      ? { ...expressionBlock, ...helpers.parseShadow(options.shadow)}
      : expressionBlock
  },

  arrayToStatements: (array=[]) => {
    return array.reduce((blocksDef, exp) => {
      const blockDef = helpers.objectExpressionToBlock(exp)

      // return this block if it's our first
      let diggingBlock = blocksDef.block
      if(!diggingBlock) {
        return blockDef
      }

      // dig down until we find a block without a next
      while(diggingBlock.next) {
        diggingBlock = diggingBlock.next.block
      }
      diggingBlock.next = blockDef

      return blocksDef
    }, {})
  },

  registerVariable: variableName => {
    // make a namespace for our variables, use name as uid
    const variableId = `io_variables:${variableName}`

    // detect id collisions
    if(!variableRegistry.find(variable => variable.id === variableId)) {
      // this is the final format used by Blockly variables deserializer
      variableRegistry.push({ name: variableName, id: variableId})
    }

    return variableId
  },

  dumpVariables: () => {
    // make a copy
    const variables = [ ...variableRegistry ]
    // clear the variables
    variableRegistry = []
    // return the copy
    return variables
  }
}

export const regenerators = {
  json: {
    codeToWorkspace: (bytecode) => {
      // TODO:
      // - check bytecode version
      // - build workspace wrapper

      const
        // find the root block's regenerator
        rootRegenerator = lookupRootRegenerator(),
        // generate the block diagram from the bytecode
        generatedBlocks = rootRegenerator(bytecode, helpers),
        // dump the variables that were registered during block generation
        generatedVariables = helpers.dumpVariables(),
        // TODO: generate procedures (functions, meta-blocks)
        generatedProcedures = []

      // output the Blockly JSON serialization format
      return {
        blocks: {
          languageVersion: 0,
          blocks: [ generatedBlocks ]
        },
        variables: generatedVariables,
        procedures: generatedProcedures
      }
    }
  }
}
