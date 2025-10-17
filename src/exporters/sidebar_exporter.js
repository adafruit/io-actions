import { find, forEach, isString, map, sortBy } from 'lodash-es'

import { writeFileIfDifferent } from '#src/util.js'


export default class SidebarExporter {
  definitionSet = null
  destination = null

  constructor(definitionSet, destination) {
    this.definitionSet = definitionSet
    this.destination = destination
  }

  export(givenOptions = {}) {
    const
      options = {
        toFile: false,
        ...givenOptions
      },
      categories = this.definitionSet.getCategories(),
      blockSidebar = {
        text: 'Blocks',
        link: '/blocks/',  // Absolute path from base - works from any subfolder
        items: map(categories, ({ name }) => ({
          text: name,
          collapsed: true,
          items: []
        }))
      },
      uncategorizedCategory = {
        text: "Uncategorized",
        collapsed: true,
        items: []
      }

    blockSidebar.items.push(uncategorizedCategory)

    // Track which blocks have been categorized
    const categorized = []

    // Iterate through categories in order, adding blocks as they appear in category.contents
    forEach(categories, category => {
      const sidebarCategory = find(blockSidebar.items, { text: category.name })

      if(!sidebarCategory) {
        throw new Error(`Block category (${ category.name }) not present in sidebar!`)
      }

      // Add blocks in the exact order they appear in the toolbox category
      if(category.contents) {
        forEach(category.contents, blockDefinition => {
          const sidebarEntry = {
            text: blockDefinition.name,
            link: blockDefinition.documentationPath()
          }
          sidebarCategory.items.push(sidebarEntry)
          categorized.push(blockDefinition)
        })
      }

      // Also add blocks referenced by usesBlocks (in the order they appear there)
      if(category.usesBlocks) {
        forEach(category.usesBlocks, blockType => {
          const blockDefinition = this.definitionSet.findBlock({ type: blockType })
          if(!categorized.includes(blockDefinition)) {
            const sidebarEntry = {
              text: blockDefinition.name,
              link: blockDefinition.documentationPath()
            }
            sidebarCategory.items.push(sidebarEntry)
            categorized.push(blockDefinition)
          }
        })
      }
    })

    // Add uncategorized blocks (sorted by type for consistency)
    forEach(sortBy(this.definitionSet.blocks, 'type'), blockDefinition => {
      if(!categorized.includes(blockDefinition)) {
        const sidebarEntry = {
          text: blockDefinition.name,
          link: blockDefinition.documentationPath()
        }
        uncategorizedCategory.items.push(sidebarEntry)
      }
    })

    if(!options.toFile) {
      return blockSidebar
    }

    const filename = isString(options.toFile)
      ? options.toFile
      : `_blocks_sidebar.json`

    writeFileIfDifferent(`${this.destination}/${filename}`, JSON.stringify(blockSidebar, null, 2))
  }

  exportToFile = (toFile=true) => {
    this.export({ toFile })
  }
}
