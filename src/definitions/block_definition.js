import { capitalize, filter, isString, isEmpty, mapValues, forEach, pickBy, identity } from 'lodash-es'
import { basename, sep } from 'node:path'

import { readFileIfPresent } from '#src/util.js'
import BlockExporter from "#src/exporters/block_exporter.js"
import blockToMarkdown, { renderInputsSection, renderFieldsSection } from "#src/docs/render_block.js"
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

  documentationSourcePath(section=null) {
    if(!this.definitionPath) { return }
    // Use path separators correctly - definitionPath may have backslashes on Windows
    let blockMdPeerPath = this.definitionPath.replace(/.js$/, '.md')

    if(section) {
      blockMdPeerPath = blockMdPeerPath.replace(".md", `.${section}.md`)
    }

    // Normalize to forward slashes for consistent file paths
    return `app/blocks/${blockMdPeerPath.replace(/\\/g, '/')}`
  }

  documentationPath() {
    if(!this.definitionPath) { return }
    const
      // Use basename to get filename cross-platform (handles both / and \ separators)
      blockMdFilename = basename(this.definitionPath, '.js') + '.md',
      primaryCategory = this.getPrimaryCategory(),
      rawPath = `blocks/${primaryCategory}/${blockMdFilename}`,
      // lowercase and no whitespace
      urlPath = rawPath.toLowerCase().replaceAll(/\s/g, "_")

    return urlPath
  }

  fullDocumentationFromFile() {
    return readFileIfPresent(this.documentationSourcePath())
  }

  descriptionFromFile() {
    return readFileIfPresent(this.documentationSourcePath("description"))
  }

  inputDescriptionsFromFile() {
    return readFileIfPresent(this.documentationSourcePath("inputs"))
  }

  fieldDescriptionsFromFile() {
    return readFileIfPresent(this.documentationSourcePath("fields"))
  }

  documentationSections() {
    return {
      description: this.descriptionFromFile(),
      inputs: this.inputDescriptionsFromFile(),
      fields:  this.fieldDescriptionsFromFile()
    }
  }

  inputsToMarkdown() {
    // dedicated external file?
    return this.inputDescriptionsFromFile() ||
      // docOverrides?
      this.docOverrides?.inputs ||
      // generate fresh
      renderInputsSection(this)
  }

  fieldsToMarkdown() {
    // dedicated external file?
    return this.fieldDescriptionsFromFile() ||
      // docOverrides?
      this.docOverrides?.fields ||
      // generate fresh
      renderFieldsSection(this)
  }

  toMarkdown() {
    // return the full external mardkown doc if it's present
    return this.fullDocumentationFromFile() ||
      // otherwise render fresh
      blockToMarkdown(this, this.documentationSections())
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
  blockDef.docOverrides = rawBlockDefinition.docOverrides &&
    mapValues(rawBlockDefinition.docOverrides, v => niceTemplate(v))
  blockDef.description = rawBlockDefinition.description
    ? niceTemplate(rawBlockDefinition.description)
    : blockDef.descriptionFromFile() || ""
  blockDef.ioPlus = rawBlockDefinition.ioPlus
  // take the first sentence of the description
  blockDef.tooltip = blockDef.description.split(/\.(\s|$)/)[0] || ""
  // ensure end of sentence punctaution
  if(blockDef.tooltip && !blockDef.tooltip.endsWith("?")) { blockDef.tooltip += "." }
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
