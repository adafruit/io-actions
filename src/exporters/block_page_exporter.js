import { existsSync, readFileSync } from "node:fs"
import { forEach, identity, mapValues, pickBy } from 'lodash-es'

import { writeFileIfDifferent } from '#src/util.js'


export default class BlockPageExporter {
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
      }

    forEach(this.definitionSet.blocks, blockDefinition => {
      const
        docPath = options.filenameFunc(blockDefinition),
        fullPath = `${this.destination}/${docPath}`

      writeFileIfDifferent(fullPath, blockDefinition.toMarkdown())
    })
  }

  exportToFile = (filenameFunc, toFile=true) => {
    const exportOptions = {
      toFile,
      // no filenameFunc if absent/falsy
      ...pickBy({ filenameFunc }, identity)
    }
    this.export(exportOptions)
  }
}
