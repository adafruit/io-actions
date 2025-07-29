import { writeFileSync } from 'fs'
import { isString, invokeMap } from 'lodash-es'


export default class WorkspaceExporter {
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
      allBlocks = invokeMap(this.definitionSet.blocks, "toBlocklyInstanceJSON"),
      workspaceObject = {
        blocks: {
          languageVersion: 0,
          blocks: allBlocks.map((block, index) => ({
            ...block,
            x: 50,
            y: 50*index
          }))
        }
      }

    if(!options.toFile) {
      return workspaceObject
    }

    const filename = isString(options.toFile)
      ? options.toFile
      : `workspace_all_blocks.json`

    writeFileSync(`${this.destination}/${filename}`, JSON.stringify(workspaceObject, null, 2))
  }

  exportToFile = (toFile=true) => {
    this.export({ toFile })
  }

  static export() {

  }
}
