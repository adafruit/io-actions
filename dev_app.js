// Use 2 terminals to auto-watch and auto-serve the base Blockly tester while you're working:
//   npm run dev:app:watch   # rebuild export/ on any app/ or src/ change
//   npm run dev:app:serve   # serve index.html at http://localhost:5173 (Vite)


import { mkdirSync } from 'node:fs'
import DefinitionSet from '#src/definitions/definition_set.js'
import { exportTo } from '#src/exporters/index.js'

const destination = 'export'
const definitions = await DefinitionSet.load()

mkdirSync(destination, { recursive: true })
await exportTo(destination, definitions, exportItem => {
  // NOTE: we deliberately do NOT clean/delete the export dir between builds.
  // Deleting the directory breaks Vite's file watcher (it loses the inode it's
  // watching) and Vite then serves a stale bundle forever. Overwriting the files
  // in place keeps HMR working.
  exportItem.toolbox("toolbox.json")
  exportItem.workspace("workspace.json")
  exportItem.blocks("blocks.json")
  exportItem.script("blockly_app.js")
})

console.log(`[dev_app] exported standalone app -> ${destination}/  (${new Date().toLocaleTimeString()})`)
