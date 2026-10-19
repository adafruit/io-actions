// Builds the e2e harness: exports the Blockly app into tmp/e2e_app alongside
// the harness page, then bundles it into tmp/e2e_dist for `vite preview`.
// Run by the Playwright webServer before every test run.
import { copyFileSync, cpSync } from 'node:fs'
import { build } from 'vite'

import { cleanDir } from '../../export_util.js'
import DefinitionSet from '#src/definitions/definition_set.js'
import { exportTo } from '#src/exporters/index.js'


const
  appDir = 'tmp/e2e_app',
  distDir = 'tmp/e2e_dist'

cleanDir(appDir)

const definitions = await DefinitionSet.load()

await exportTo(appDir, definitions, exportItem => {
  exportItem.toolbox("toolbox.json")
  exportItem.workspace("workspace.json")
  exportItem.workspaceAllBlocks("workspace_all_blocks.json")
  exportItem.blocks("blocks.json")
  exportItem.script("blockly_app.js")
})

copyFileSync('e2e/fixture/index.html', `${appDir}/index.html`)
copyFileSync('e2e/fixture/harness.js', `${appDir}/harness.js`)
// serve Blockly's sprites and sounds locally rather than from its default CDN
cpSync('node_modules/blockly/media', `${appDir}/public/media`, { recursive: true })

await build({
  root: appDir,
  configFile: false,
  logLevel: 'warn',
  build: {
    outDir: '../e2e_dist',
    emptyOutDir: true,
    // the bundle is large and that's fine for a test harness
    chunkSizeWarningLimit: 10_000,
  },
})

console.log(`e2e harness built -> ${distDir}/`)
