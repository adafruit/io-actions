import { capitalize, filter, isString, isEmpty, mapValues, forEach, pickBy, identity } from 'lodash-es'

import BlockExporter from "#src/exporters/block_exporter.js"
import { niceTemplate } from '#src/util.js'


const UNCATEGORIZED_PATH = "uncategorized"

class BlockDefinition {
  definitionSet = null

  definitionPath = null

  definitionJS = null

  type = null

  name = null

  description = ''
  docOverrides = {}
  ioPlus = false

  colour = null
  color = null

  inputsInline = false

  connections = null

  template = null

  inputs = []
  fields = []

  mixins = []
  extensions = []
  mutator = null

  generators = {}

  regenerators = {}

  disabled = false

  primaryCategory = null


  getCategories() {
    return (this.definitionSet
      ? filter(this.definitionSet.getCategories(), ({ contents=[], usesBlocks=[]}) =>
          contents.includes(this) || usesBlocks.includes(this.type)
        )
      : [])
  }

  getPrimaryCategory() {
    const categories = this.getCategories()

    // doesn't appear in a category
    if(!categories.length) {
      // why specify a primary? warn
      if(this.primaryCategory) {
        console.warn(`Warning [${this.type}]: No category found, but did have "primaryCategory" key: "${this.primaryCategory}"`)
      }

      return UNCATEGORIZED_PATH
    }

    const firstCategoryName = categories[0].name

    // appears in multiple categories
    if(categories.length > 1) {
      // doesn't specify a primary! this is bad, unsure what menu and URL it will fall under, warn
      if(!this.primaryCategory) {
        console.warn(`Warning [${this.type}]: Multiple categories but no "primaryCategory" declaration, using "${firstCategoryName}"`)
      } else {
        return this.primaryCategory
      }
    }

    return firstCategoryName
  }

  documentationPath() {
    const
      blockMdFilename = this.definitionPath.split("/").at(-1).replace(/.js$/, '.md'),
      primaryCategory = this.getPrimaryCategory()

    return `blocks/${primaryCategory}/${blockMdFilename}`.toLowerCase()
  }

  toBlocklyJSON() {
    return BlockExporter.export(this)
  }

  toBlocklyJSONString() {
    return JSON.stringify(this.toBlocklyJSON(), null, 2) + "\n"
  }

  toBlocklyInstanceJSON() {
    return pickBy({
      type: this.type,
      inputs: this.getInstanceInputs(),
      fields: this.getInstanceFields(),
    }, identity)
  }

  getInstanceInputs() {
    const { inputs } = this
    if(!inputs) { return }

    const inputValues = mapValues(inputs, definitionPropsToInputs)
    return isEmpty(inputValues) ? undefined : inputValues
  }

  getInstanceFields() {
    const { fields } = this
    if (!fields) { return }

    const defaultFields = pickBy(mapValues(fields, "value"), identity)
    return isEmpty(defaultFields) ? undefined : defaultFields
  }
}

const
  definitionPropsToInputs = input => {
    const { block, shadow, type } = input

    // bail unless this is a statement or value input
    // (undefined implies value, for now)
    if(![undefined, 'statement', 'value'].includes(type)) {
      return
    }

    if(!block && !shadow) {
      console.warn("Warning: no block or shadow specified for input:", input)
      return
    }

    if(block) {
      const
        blockJson = blockToInput(block),
        shadowJson = shadowToInput(shadow || block)

      return {
        ...blockJson,
        ...shadowJson
      }

    } else if(shadow) {
      const shadowJson = shadowToInput(shadow)

      return {
        // also copy the shadow into a real block
        // TODO: nested shadow blocks
        block: shadowJson.shadow,
        ...shadowJson
      }
    }
  },

  blockToInput = block => isString(block) // is shorthand?
    ? { block: { type: block }} // expand to full object
    : { block }, // set as shadow value

  shadowToInput = shadow => isString(shadow) // is shorthand?
    ? { shadow: { type: shadow }} // expand to full object
    : { shadow } // set as shadow value

export default BlockDefinition


/** @returns BlockDefinition */
BlockDefinition.parseRawDefinition = function(rawBlockDefinition, definitionPath, definitionSet) {
  // throw on any problems
  if(!rawBlockDefinition.type) {
    throw new Error('BlockDefinition: A unique `type` property is required for block definitions.')
  }

  // defaults, desugars, localizations, transformations, assignments
  const blockDef = new BlockDefinition()
  blockDef.definitionPath = definitionPath
  blockDef.definitionSet = definitionSet
  blockDef.definitionJS = rawBlockDefinition
  blockDef.type = rawBlockDefinition.type
  blockDef.name = rawBlockDefinition.name
  blockDef.primaryCategory = rawBlockDefinition.primaryCategory
  blockDef.docOverrides = rawBlockDefinition.docOverrides
  blockDef.description = rawBlockDefinition.description
    ? niceTemplate(rawBlockDefinition.description)
    : ""
  blockDef.ioPlus = rawBlockDefinition.ioPlus
  blockDef.tooltip = blockDef.description.split("\n")[0]
  blockDef.disabled = !!rawBlockDefinition.disabled
  blockDef.connections = rawBlockDefinition.connections
  blockDef.template = rawBlockDefinition.template
  blockDef.inputs = rawBlockDefinition.inputs
  blockDef.fields = rawBlockDefinition.fields
  blockDef.mixins = rawBlockDefinition.mixins
  blockDef.extensions = rawBlockDefinition.extensions
  blockDef.mutator = rawBlockDefinition.mutator
  blockDef.generators = rawBlockDefinition.generators
  blockDef.regenerators = rawBlockDefinition.regenerators
  blockDef.colour = rawBlockDefinition.color || rawBlockDefinition.colour || "0"
  blockDef.color = blockDef.colour
  blockDef.inputsInline = rawBlockDefinition.inputsInline || false

  // warnings on any data that's missing, ugly, etc
  if(!blockDef.name) {
    // if no name given, humanize the type property as a default
    blockDef.name = rawBlockDefinition.type.split(/[\W_]+/).map(capitalize).join(" ").replace(/^io /i, "")
    console.warn(`Warning: [${blockDef.type}] No "name" property provided, defaulted to: "${blockDef.name}"`)
  }

  if(!blockDef.connections) {
    console.warn(`Warning: [${blockDef.type}] No "connections" property provided, no defaults.`)
  }

  forEach(blockDef.inputs, (input, inputName) => {
    if(!input.check && input.type !== 'label') {
      console.warn(`Warning: [${blockDef.type}] Input is unchecked: ${inputName} ${input.type}`)
    }
  })

  return blockDef
}
