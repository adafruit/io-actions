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

    forEach(sortBy(this.definitionSet.blocks, 'type'), blockDefinition => {
      const
        sidebarEntry = {
          text: blockDefinition.name,
          link: blockDefinition.documentationPath()
        },
        blockCategories = blockDefinition.getCategories()

      // put into Uncategorized if no category
      if(!blockCategories.length) {
        uncategorizedCategory.items.push(sidebarEntry)
      }

      // add links to each sidebar category we're a part of
      forEach(blockCategories, category => {
        // if category contains this block, add to its sidebar
        const sidebarCategory = find(blockSidebar.items, { text: category.name })

        if(!sidebarCategory) {
          throw new Error(`Block category (${ category.name }) not present in sidebar!`)
        }

        // ADD TO SIDEBAR
        sidebarCategory.items.push(sidebarEntry)
      })
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
