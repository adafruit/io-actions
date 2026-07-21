import { writeFileSync, readFileSync } from "node:fs"
import { isString } from "lodash-es"

import renderTemplate from '#src/renderers/template_renderer.js'
import BLOCKLY_CSS from "#src/blockly_css.js"


// creates a script that provides a method of doing right-click->save-as
// needs to be exported because it must inject all blockly and custom
// CSS into the screenshot, so it has to build all of that separately
// from the main app export
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

      renderedCss = `const ALL_CSS = \`
${BLOCKLY_CSS}
${APP_CSS}
\`
`

    // combine and write to filename
    writeFileSync(`${this.destination}/${filename}`, renderTemplate(renderedCss, './src/exporters/script_templates/image_exporter.template.js'))
  }

  exportToFile = (toFile=true) => {
    this.export({ toFile })
  }
}
