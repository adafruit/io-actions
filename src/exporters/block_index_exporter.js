import { writeFileSync } from 'fs'
import { forEach, isString } from 'lodash-es'


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
      index = []

    index.push(`---
title: "Block List"
editLink: false
---

# Block List`)
    // index.push(`All available blocks`)

    categories.forEach(category => {
      index.push(`## ${category.name}`)

      index.push(
        this.definitionSet.blocks.reduce((acc, def) => {
          if(category.contents?.includes(def) || category.usesBlocks?.includes(def.type)) {
            // block name and link
            acc.push(`### [${ def.name }](/${ def.documentationPath() })`)
            // block image
            // acc.push(``) // TODO
            // block short description
            acc.push(`_${def.tooltip}_`)
          }

          return acc
        }, []).join("\n")
      )
    })

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
