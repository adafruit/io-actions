import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { forEach, identity, pickBy } from 'lodash-es'

import toBlockMarkdown from "#src/docs/render_block.js"


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

      mkdirSync(dirname(fullPath), { recursive: true })
      writeFileSync(fullPath, toBlockMarkdown(blockDefinition))
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
