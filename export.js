import { cleanDir, write, totalBytesWritten } from "./export_util.js"
import DefinitionSet from '#src/definitions/definition_set.js'
import { exportTo } from '#src/exporters/index.js'


const toExport = process.argv[2]

if(!toExport) {
  console.error(`Export Error: Missing export name!\nUsage: node export.js [export name]`)
  process.exit(1)
}

const
  // load the definitions
  definitions = await DefinitionSet.load(),

  exporters = {
    "app": async (destination="export") => {

      // clear the export directory
      cleanDir(destination)

      // app export routine
      await exportTo(destination, definitions, exportItem => {
        exportItem.toolbox("toolbox.json")
        exportItem.workspace("workspace.json")
        exportItem.blocks("blocks.json")
        exportItem.script("blockly_app.js")
      })
    },

    "docs": async () => {
      await exporters.app("docs/blockly")

      cleanDir("docs/blocks")

      await exportTo("docs", definitions, exportItem => {
        exportItem.sidebar("blocks/_blocks_sidebar.json")
        exportItem.blockPages()
        // exportItem.blockExamples(block => "blocks/${block.definitionPath}/examples.json")
      })
    },
  },
  exporterNames = Object.keys(exporters)

if(!exporterNames.includes(toExport)) {
  console.error(`Export Error: No exporter found for: "${toExport}"\nValid exporters: "${exporterNames.join('", "')}"`)
  process.exit(1)
}

const startTime = Date.now()
console.log(`\nStarting Export: ${toExport}`)
console.log("=======================")

const exporter = exporters[toExport]
await exporter()

const elapsed = Date.now() - startTime
console.log("=======================")
console.log(`🏁 Done. Wrote ${totalBytesWritten.toFixed(3)}k in ${elapsed}ms 🏁`)
