import { writeFileSync, readFileSync } from "node:fs"
import { isString } from "lodash-es"

import BLOCKLY_CSS from "#src/blockly_css.js"


export default class BlockSaveAsMenuItemExporter {
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
      // determine filename
      filename = isString(options.toFile)
        ? options.toFile
        : `image_exporter.js`,
      APP_CSS = readFileSync('./app/styles/app.css'),
      IMAGE_EXPORT_JS = readFileSync('./src/exporters/script_templates/image_exporter.js'),

      contents = `
const ALL_CSS = \`
${BLOCKLY_CSS}
${APP_CSS}
\`

${IMAGE_EXPORT_JS}
`

    // combine and write to filename
    writeFileSync(`${this.destination}/${filename}`, contents)
  }

  exportToFile = (toFile=true) => {
    this.export({ toFile })
  }
}
