import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, cpSync, existsSync } from 'node:fs'

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
    // Build the Blockly application itself
    "app": async (destination="export") => {

      // clear the export directory
      cleanDir(destination)

      // app export routine
      await exportTo(destination, definitions, exportItem => {
        exportItem.toolbox("toolbox.json")
        exportItem.workspace("workspace.json")
        exportItem.blocks("blocks.json")
        exportItem.script("blockly.js")
      })
    },

    // Build the documentation for the Blockly application
    "docs": async () => {
      // TODO: check and warn if block images haven't been generated
      if(!existsSync("docs/block_images/action_root.png")) {
        console.log("Block images missing from docs/block_images!")
        console.log("Run: `npm run export:block-images` before exporting the docs")
        process.exit(1)
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

    // Build the documentation but only touch files that have changed
    // This is good to pair with a process that watches files for changes
    "docs-incremental": async () => {
      await exportTo("docs", definitions, exportItem => {
        exportItem.blockIndex("blocks/index.md")
        exportItem.blockPages()
        exportItem.sidebar("blocks/_blocks_sidebar.json")
      })
    },

    "blockMdPages": async () => {
      await exportTo(".", definitions, exportItem => {
        exportItem.blockPages(blockDef => {
          return blockDef.documentationSourcePath()
        })
      })
    },

    // Create png images of all blocks by:
    // - creating a temporary app with no toolbox and all blocks on the workspace
    // - serving that application
    // - driving a browser to it with Cypress
    // - right clicking on each block and clicking "download image"
    "blockImages": async (imageDestination="docs/block_images") => {
      const tmpAppDestination = "tmp/block_images_app"
      cleanDir(tmpAppDestination)

      // export a special app with no toolbox, all blocks on workspace
      await exportTo(tmpAppDestination, definitions, exportItem => {
        exportItem.workspaceAllBlocks("workspace.json")
        write(`${tmpAppDestination}/toolbox.json`, "null")
        exportItem.blocks("blocks.json")
        exportItem.script("blockly_app.js")
        // TODO: make a DocumentExporter for generating html wrappers
        copyFileSync("src/exporters/document_templates/blockly_workspace.template.html", `${tmpAppDestination}/index.html`)
      })

      // serve the screenshot app
      console.log('Serving workspace for screenshots...')
      const viteProcess = spawn("npx", ["vite", "serve", tmpAppDestination])

      // prepare the image location
      cleanDir(imageDestination)

      // extract the screenshots
      console.log('Generating screenshots...')
      await spawnSync("npx", ["cypress", "run",
        "--config", `downloadsFolder=${imageDestination}`,
        "--config-file", `cypress/cypress.config.js`,
        "--browser", "chromium",
        "--spec", "cypress/e2e/block_images.cy.js",
      ], { stdio: 'inherit', shell: true })
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

// Look up the requested exporter
if(!exporterNames.includes(toExport)) {
  console.error(`Export Error: No exporter found for: "${toExport}"\nValid exporters: "${exporterNames.join('", "')}"`)
  process.exit(1)
}

// Execute the export
const startTime = Date.now()
console.log(`\nStarting Export: ${toExport}`)
console.log("=======================")

const exporter = exporters[toExport]
await exporter()

const elapsed = Date.now() - startTime
console.log("=======================")
console.log(`🏁 Done (${elapsed}ms) 🏁`)


// Bye!
process.exit(0)
