import { existsSync, readFileSync } from "node:fs"
import { forEach, identity, mapValues, pickBy } from 'lodash-es'

import { writeFileIfDifferent } from '#src/util.js'
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
        fullPath = `${this.destination}/${docPath}`,
        fullDoc = readFileIfPresent(blockDefinition.documentationSourcePath())

      // full block doc already exists, just use it
      if(fullDoc) {
        writeFileIfDifferent(fullPath, fullDoc)

      } else {
        const sections = {
          description: readFileIfPresent(blockDefinition.documentationSourcePath("description")),
          inputs: readFileIfPresent(blockDefinition.documentationSourcePath("inputs")),
          fields: readFileIfPresent(blockDefinition.documentationSourcePath("fields")),
        }

        writeFileIfDifferent(fullPath, toBlockMarkdown(blockDefinition, sections))
      }
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

const readFileIfPresent = filename => {
  try {
    return readFileSync(filename).toString()
  } catch(error) {
    // no file? no problem, return falsy
    if(error.code === "ENOENT") { return }
    // otherwise we need to see the error
    throw error
  }
}
