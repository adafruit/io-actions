import { assign, find, forEach, isArray, isObject, isString, reject, filter } from 'lodash-es'

import DefinitionLoader from '#src/loaders/definition_loader.js'
import WorkspaceDefinition from "#src/definitions/workspace_definition.js"
import ToolboxDefinition from "#src/definitions/toolbox_definition.js"
import BlockDefinition from "#src/definitions/block_definition.js"


export class DefinitionSet {
  exportDirectory = "export"
  /** @type WorkspaceDefinition[] */
  workspaces = []

  /** @type ToolboxDefinition[] */
  toolboxes = []

  /** @type BlockDefinition[] */
  blocks = []

  mixins = {}
  extensions = {}
  mutators = {}
  generators = {}
  regenerators = {}

  findBlock(query) {
    const blockQuery = isString(query) ? { type: query } : query
    const found = find(this.blocks, blockQuery)

    if(!found) {
      console.log(`No block found for query: ${JSON.stringify(blockQuery)}`)
      return
    }

    return found
  }

  findBlocks(query) {
    return filter(this.blocks, query)
  }

  primaryWorkspace() {
    return this.workspaces[0]
  }

  primaryToolbox() {
    return this.toolboxes[0]
  }

  getCategories() {
    return this.primaryToolbox().categories
  }
}

export default DefinitionSet

DefinitionSet.load = async function(appLocation) {
  // locate all files for all definition types
  //   verify shape of each raw definition type (required and optional keys -> value types)
  // hydrate interlinked definition instances
  //   de-sugar raw definitions
  //   verify referenced definitions exist

  const
    rawDefinitions = await DefinitionLoader.loadAll({ source: appLocation }),
    enabledBlocks = reject(rawDefinitions.blocks, "definition.disabled"),
    definitionSet = new DefinitionSet()

  // TODO: process fields
  // TODO: process shadows
  // TODO: process inputs

  // process mixins
  definitionSet.mixins = rawDefinitions.mixins
  // process extensions
  definitionSet.extensions = rawDefinitions.extensions
  // process mutators
  definitionSet.mutators = rawDefinitions.mutators

  // process standalone regenerators
  forEach(rawDefinitions.regenerators, (regenerators, blockType) => {
    definitionSet.regenerators[blockType] = regenerators
  })

  // process blocks
  forEach(enabledBlocks, ({ definition, path }) => {
    const blockDef = BlockDefinition.parseRawDefinition(definition, path, definitionSet)
    definitionSet.blocks.push(blockDef)

    // process inline mixins:
    const { mixins } = definition
    // could be a list of mixin names and objects
    if(isArray(mixins)) {
      // step through each mixin
      forEach(mixins, mixin => {
        if(isString(mixin)){
          // TODO: validate named mixins actually exist

        } else {
          // objects get assigned up into the definition set's mixins
          // TODO: error if any keys exist
          assign(definitionSet.mixins, mixin)
        }
      })

    // could be a single mixin
    } else if(isObject(mixins)) {
      // TODO: error if any keys exist
      assign(definitionSet.mixins, mixins)
    }

    // process inline extensions:
    const { extensions } = definition
    if(isArray(extensions)) {
      // TODO: check named extensions actually exist

    } else if(isObject(extensions)) {
      // TODO: error if any keys exist
      assign(definitionSet.extensions, extensions)
    }

    // process mutator
    const { mutator } = definition
    if(isObject(mutator)) {
      definitionSet.mutators[blockDef.type] = mutator
    }

    if(definitionSet.generators[blockDef.type]) {
      throw new Error(`Generator already present for block: ${blockDef.type}`)
    }
    definitionSet.generators[blockDef.type] = blockDef.generators

    if(definitionSet.regenerators[blockDef.type]) {
      throw new Error(`Regenerator already present for block: ${blockDef.type}`)
    }
    definitionSet.regenerators[blockDef.type] = blockDef.regenerators
  })

  // process toolbox
  forEach(rawDefinitions.toolboxes, rawToolboxDef => {
    const toolboxDef = ToolboxDefinition.parseRawDefinition(rawToolboxDef, definitionSet)
    definitionSet.toolboxes.push(toolboxDef)
  })

  // process workspace
  forEach(rawDefinitions.workspaces, rawWorkspaceDef => {
    const workspaceDef = WorkspaceDefinition.parseRawDefinition(rawWorkspaceDef, definitionSet)
    definitionSet.workspaces.push(workspaceDef)
  })

  return definitionSet
}
