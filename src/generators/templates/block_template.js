
/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: "block_type",
  name: "Block Name",
  colour: 100,
  description: "general documentation about this block",

  connections: {
    mode: "value",
    output: "expression",
  },

  inputs: {
    INPUT_A: {
      description: "documentation about this input",
      check: "expression"
    }
  },

  fields: {
    FIELD_A: {
      description: "documentation about this field"
    }
  },

  generators: {
    json: (block, generator) => {
      return [ {}, 0 ]
    }
  },

  regenerators: {
    json: () => {
      return {
        type: "block_type",
        inputs: {},
        fields: {}
      }
    }
  }
}
