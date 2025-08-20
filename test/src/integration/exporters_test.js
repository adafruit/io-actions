import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { describe, it, beforeEach, afterEach } from 'node:test'
import { assert } from 'chai'
import { find, map } from 'lodash-es'

import DefinitionSet from "#src/definitions/definition_set.js"
import BlockExporter from "#src/exporters/block_exporter.js"
import ToolboxExporter from "#src/exporters/toolbox_exporter.js"
import WorkspaceExporter from "#src/exporters/workspace_exporter.js"
import ScriptExporter from "#src/exporters/script_exporter.js"


const
  EXPORTS_DIR = `${import.meta.dirname}/export`,

  clearExportsDir = () => {
    if(existsSync(EXPORTS_DIR)) {
      rmSync(EXPORTS_DIR, { recursive: true })
    }

    mkdirSync(EXPORTS_DIR)
  },

  exportExists = filename => {
    const completePath = `${EXPORTS_DIR}/${filename}`
    assert(existsSync(completePath), `Expected file "${filename}" to be exported to path: ${completePath}`)
  },

  // load the fixture app once
  defSet = await DefinitionSet.load("test/src/integration/app_fixture")

defSet.exportDirectory = EXPORTS_DIR

describe("Exporting Blockly Files", () => {
  // ensure exports dir is cleared before and after each test
  beforeEach(clearExportsDir)
  afterEach(clearExportsDir) // comment to inspect a test's output

  describe("exporting Blocks", () => {
    it("export a block definition as a Blockly object", async () => {
      const blockExporter = new BlockExporter(defSet, EXPORTS_DIR)

      const sentenceObject = blockExporter.exportBlockByType("sentence", { toFile: false }) // default, returns the object
      assert.equal(sentenceObject.type, "sentence")

      const noReturn = blockExporter.exportBlockByType("sentence", { toFile: true }) // use default filename for block (sentence.json)
      assert.notExists(noReturn)
      exportExists(`sentence.json`)

      const stillNoReturn = blockExporter.exportBlockByType("sentence", { toFile: `my_block.json` }) // use given name
      assert.notExists(stillNoReturn)
      exportExists(`my_block.json`)
    })

    it("export all block definitions as Blockly objects", () => {
      const blockExporter = new BlockExporter(defSet, EXPORTS_DIR)

      const allBlocks = blockExporter.export({ toFile: false }) // default, returns the object
      assert.exists(find(allBlocks, { type: "sentence" }))
      assert.exists(find(allBlocks, { type: "subject" }))
      assert.exists(find(allBlocks, { type: "predicate" }))

      const noReturn = blockExporter.export({ toFile: true }) // writes blocks.json
      assert.notExists(noReturn)
      exportExists(`blocks.json`)

      const stillNoReturn = blockExporter.export({ toFile: "all_blocks.json" }) // writes all_blocks.json
      assert.notExists(stillNoReturn)
      exportExists(`all_blocks.json`)
    })

    // "trunk" refers to the base form of a block, with:
    // - fields defaulted
    // - unremovable shadows attached to inputs
    // - optional sub-blocks, as warranted
    it("export the special 'trunk' form of a block", () => {
      const blockExporter = new BlockExporter(defSet, EXPORTS_DIR)

      const trunkObject = blockExporter.exportBlockTrunk("sentence") // returns the trunk form of the sentence block
      // const trunkObject = defSet.exportBlockTrunk("sentence") // returns the trunk form of the sentence block
      assert.exists(trunkObject)
      assert.hasAllKeys(trunkObject, ["type", "inputs"])
      assert.hasAllKeys(trunkObject.inputs, ["SUBJECT", "PREDICATE"])
      assert.hasAllKeys(trunkObject.inputs.SUBJECT, ["shadow", "block"])
      assert.hasAllKeys(trunkObject.inputs.PREDICATE, ["shadow", "block"])
    })

    it("export other block trees by name", { skip: true }, () => {
      // aspirational for now
      defSet.exportBlockTree("sentence", "simple") // exports the sentence block tree identified as "simple"
      defSet.exportBlockTree("sentence", "complex") // exports the sentence block tree identified as "complex"
      defSet.exportBlockTree("sentence", "trunk") // exports the trunk
    })
  })

  describe("exporting mixins")
  describe("exporting extensions")
  describe("exporting mutators")
  describe("exporting validations")
  describe("exporting generators")
  describe("exporting regenerators")
  describe("exporting all scripts: blockly_app.js", { only: true}, () => {
    it("exports all parts with section headings", () => {
      const scriptExporter = new ScriptExporter(defSet, EXPORTS_DIR)

      const jsContents = scriptExporter.export()
      // console.log(jsContents)
      assert.include(jsContents, "\n// Toolbox\n")
      assert.include(jsContents, "\"Callback Category\": workspace => {")
      assert.include(jsContents, "\n// Mixins\n")
      assert.include(jsContents, "const allMixins = {")
      assert.include(jsContents, "\n// Extensions\n")
      assert.include(jsContents, "const allExtensions = {")
      assert.include(jsContents, "\n// Mutators\n")
      assert.include(jsContents, "const allBlockMutators = {")
      assert.include(jsContents, "\n// Generators\n")
      assert.include(jsContents, "const blockGenerators = {")
      assert.include(jsContents, "\n// Regenerators\n")
      assert.include(jsContents, "const blockRegenerators = {")
      assert.include(jsContents, "\n// Blockly API Wrapper\n")
    })
  })

  describe("exporting Toolboxes", () => {
    it("export a Toolbox category Blockly object", () => {
      const toolboxExporter = new ToolboxExporter(defSet, EXPORTS_DIR)

      // the "Sentence Parts" category of the primary toolbox
      const categoryObject = toolboxExporter.exportCategory("Sentence Parts")
      assert.exists(categoryObject)
      assert.hasAllKeys(categoryObject, [ "kind", "name", "colour", "contents" ])
      assert.lengthOf(categoryObject.contents, 2)

      const contentTypes = map(categoryObject.contents, "type")
      assert.include(contentTypes, "subject")
      assert.include(contentTypes, "predicate")
    })

    it("export a Toolbox Blockly object", () => {
      const toolboxExporter = new ToolboxExporter(defSet, EXPORTS_DIR)

      // the entire primary toolbox
      const toolboxObject = toolboxExporter.export({ toFile: false }) // default, returns the toolbox object
      assert.exists(toolboxObject)

      const noReturn = toolboxExporter.export({ toFile: true }) // exports the main toolbox object to toolbox.json
      assert.notExists(noReturn)
      exportExists(`toolbox.json`)

      const stillNoReturn = toolboxExporter.export({ toFile: "other_toolbox.json" }) // exports the main toolbox object to other_toolbox.json
      assert.notExists(stillNoReturn)
      exportExists(`other_toolbox.json`)
    })
  })

  describe("exporting Workspaces", () => {
    it("export a Workspace Blockly object", () => {
      const workspaceExporter = new WorkspaceExporter(defSet, EXPORTS_DIR)

      // the entire primary workspace
      const workspaceObject = workspaceExporter.export({ toFile: false }) // default, returns the workspace object
      assert.exists(workspaceObject)
      assert.hasAllKeys(workspaceObject, ["blocks"])
      assert.hasAllKeys(workspaceObject.blocks, ["languageVersion", "blocks"])

      const noReturn = workspaceExporter.export({ toFile: true }) // writes the workspace to workspace.json
      assert.notExists(noReturn)
      exportExists('workspace.json')

      const stillNoReturn = workspaceExporter.export({ toFile: "other_workspace.json" }) // writes the workspace to other_workspace.json
      assert.notExists(stillNoReturn)
      exportExists('other_workspace.json')
    })
  })

  describe("exporting a standalone Blockly app", { skip: true }, () => {
    it("exports all 4 files correctly", () => {
      const config = {}
      // config can specify export locations, bundling stuff, etc
      defSet.exportApp("io-actions", config) // export the app named "io-actions" to standalone files
      // exports files:
      // - blocks.json
      // - toolbox.json
      // - workspace.json
      // - blockly_app.js
    })
  })

  describe("exporting a documentation site for a Blockly app", { skip: true }, () => {
    it("exports tiny Blockly apps for each block definition", () => {
      const config = {}
      // config can specify export locations, bundling stuff, etc
      defSet.exportDocs("io-actions", config) // export the documentation site for the app named "io-actions" to standalone files
      // exports:
      // - .md files for each block
      // - static .md files already present
      // - smaller collaborator-block bundles for
      // - blockly_app.js
    })
  })
})
