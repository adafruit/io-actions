import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, cpSync } from 'node:fs'

import { cleanDir, write, totalBytesWritten } from "./export_util.js"
import DefinitionSet from '#src/definitions/definition_set.js'
import { exportTo } from '#src/exporters/index.js'


const
  toExport = process.argv[2],
  taskArgs = process.argv.slice(3)

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
      // allow option to skip image generation
      const skipImages = taskArgs.includes("skipImages")
      if(!skipImages) {
        await exporters.blockImages()
        cleanDir("docs/block_images")
        cpSync("tmp/block_images/images", "docs/block_images", { recursive: true })
      }

      await exporters.app("docs/blockly")
      cleanDir("docs/blocks")

      await exportTo("docs", definitions, exportItem => {
        exportItem.sidebar("blocks/_blocks_sidebar.json")
        exportItem.blockIndex("blocks/index.md")
        exportItem.blockPages()
        // exportItem.blockExamples(block => "blocks/${block.definitionPath}/examples.json")
      })
    },

    "blockImages": async () => {
      const destination = "tmp/block_images"
      cleanDir(destination)
      cleanDir(`${destination}/images`)

      // export a special app with no toolbox, all blocks on workspace
      await exportTo(destination, definitions, exportItem => {
        exportItem.workspaceAllBlocks("workspace.json")
        write(`${destination}/toolbox.json`, "null")
        exportItem.blocks("blocks.json")
        exportItem.script("blockly_app.js")
        // TODO: make a DocumentExporter for generating html wrappers
        copyFileSync("src/exporters/document_templates/blockly_workspace.template.html", `${destination}/index.html`)
      })

      // serve it
      console.log('Serving workspace for screenshots...')
      const viteProcess = spawn("npx", ["vite", "serve", destination])

      // extract the screenshots
      console.log('Generating screenshots...')
      spawnSync("npx", ["cypress", "run",
        "--config", `downloadsFolder=${destination}/images`,
        "--config-file", `cypress/cypress.config.js`,
      ])
      console.log('Generation complete.')

      // kill the server
      if(!viteProcess.kill()) {
        console.log("Vite failed to exit gracefully")
        process.exit(1)
      }
      console.log('Server closed.')
    }
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


process.exit(0)
