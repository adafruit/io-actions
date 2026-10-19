import { forEach, filter, map } from 'lodash-es'


class ToolboxDefinition {
  definitionPath = null

  definitionJS = null

  // all contents in the toolbox
  contents = []
  // just the categories
  categories = []

  toBlocklyJSON = function() {
    return ToolboxExporter.exportBlocklyJSON(this)
  }

  toBlocklyJSONString = function() {
    return JSON.stringify(this.toBlocklyJSON(), null, 2) + "\n"
  }
}

export default ToolboxDefinition


ToolboxDefinition.parseRawDefinition = function(definition, definitionSet) {
  const toolboxDefinition = new ToolboxDefinition()
  toolboxDefinition.definitionJS = definition

  forEach(definition, item => {
    // copy the item before we start modifying it
    item = { ...item }
    // all items go into contents
    toolboxDefinition.contents.push(item)

    // only categories have names, and get special processing
    if (!item.name) { return }

    // for static category contents...
    if(item.contents) {
      // replace block types (strings) with block definitions
      item.contents = item.contents.map(blockType =>
        (typeof blockType === 'string')
          ? definitionSet.findBlock({ type: blockType })
          : blockType
      )
    }

    toolboxDefinition.categories.push(item)
  })

  return toolboxDefinition
}


const ToolboxExporter = {
  exportBlocklyJSON: toolboxDefinition => {
    const contents = ToolboxExporter.generateToolboxContents(toolboxDefinition.contents)

    return {
      kind: 'categoryToolbox',
      contents
    }
  },

  generateToolboxContents: rawContents => map(rawContents, category => {
    if(category.name) {
      return ToolboxExporter.generateCategoryFromDefinition(category)
    }

    return category
  }),

  generateCategoryFromDefinition: category => {
    // log(`- "${category.name}"`)

    // validateCategoryDefinition(category)

    const
      contents = ToolboxExporter.generateCategoryContents(category),
      contentKinds = map(contents, "kind"),
      blockCount = filter(contentKinds, kind => kind == "block").length,
      labelCount = filter(contentKinds, kind => kind == "label").length

    // log(`  - ${blockCount} blocks added`)
    if(labelCount) {
      // log(`  - ${labelCount} labels added`)
    }

    if(!contents.length && !category.callback) {
      // warn(`  - Warning: no blocks generated for category without callback "${category.name}"!`)
    }

    // inject other kinds of toolbox objects here
    const categoryItem = {
      kind: 'category',
      name: category.name,
      colour: (category.colour === 0) ? "0" : category.colour,
      contents
    }

    if(category.callback) {
      categoryItem.custom = category.name
    }

    // Pass through an optional category icon (presentation-only). The `icon`
    // shorthand becomes a CSS class on the category's icon element, styled in
    // blockly_api.js (.io-cat-icon-<name>).
    if(category.icon) {
      categoryItem.cssconfig = { icon: `io-cat-icon io-cat-icon-${category.icon}` }
    }

    return categoryItem
  },

  generateCategoryContents: ({ name, contents, callback }) => {
    // no contents?
    if (!contents) {
      // better have a callback
      if(callback) { return [] }
      // otherwise we have a problem
      throw new Error(`No contents found for category "${name}"`)
    }

    const toolboxContents = map(contents, blockDefinition => ({
      kind: 'block',
      ...blockDefinition.toBlocklyInstanceJSON()
    }))

    // warnOnExtraBlocksSpecifyCategory(name, definitionContents)

    return toolboxContents
  },
}
