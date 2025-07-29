import { writeFileSync } from 'fs'
import { isString, without } from 'lodash-es'

import { renderBlockImage } from '../docs/render_block.js'


export default class BlockIndexExporter {
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
        filenameFunc: blockDef => blockDef.documentationPath(),
        ...givenOptions
      },
      categories = this.definitionSet.getCategories(),
      categorized = [],
      index = []

    index.push(`---
title: "Block List"
editLink: false
---

# Block List`)
    index.push(`${this.definitionSet.blocks.length} blocks and counting`)

    categories.forEach(category => {
      index.push(`## ${category.name}`)

      index.push(
        this.definitionSet.blocks.reduce((acc, def) => {
          if(category.contents?.includes(def) || category.usesBlocks?.includes(def.type)) {
            acc.push(definitionToIndexLines(def))
            categorized.push(def)
          }

          return acc
        }, []).join("\n")
      )
    })

    // Special "Uncategorized" category
    const uncategorized = without(this.definitionSet.blocks, ...categorized)
    index.push(`## Uncategorized`)
    index.push("These blocks do not appear in the toolbox directly. They may appear in gear menus, as sub-blocks, etc.")

    index.push(
      uncategorized.map(def => definitionToIndexLines(def)).join("\n")
    )

    const finalMarkdown = index.join("\n\n")

    if(!options.toFile) {
      return finalMarkdown
    }

    const filename = isString(options.toFile)
      ? options.toFile
      : `index.md`

    writeFileSync(`${this.destination}/${filename}`, finalMarkdown)
  }

  exportToFile = (toFile=true) => {
    this.export({ toFile })
  }
}

const definitionToIndexLines = def => {
  const indexLines = []

  // block name and link
  indexLines.push(`### [${ def.name }](/${ def.documentationPath() })`)

  // block short description
  indexLines.push(`_${def.tooltip}_`)

  // block image
  indexLines.push(renderBlockImage(def))

  return indexLines.join("\n")
}
