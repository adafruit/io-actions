import { describe, it, beforeEach } from 'node:test'
import { filter } from "lodash-es"
import { assert } from 'chai'

import DefinitionSet from "#src/definitions/definition_set.js"
import WorkspaceDefinition from "#src/definitions/workspace_definition.js"
import ToolboxDefinition from "#src/definitions/toolbox_definition.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("DefinitionSet", function() {
  describe("loading/importing definitions", function() {
    it("loads a definition set", async function() {
      const defSet = await DefinitionSet.load()
      assert.instanceOf(defSet, DefinitionSet)
    })
  })

  describe("workspaces, toolboxes, blocks", function() {
    beforeEach(async function() { this.definitionSet = await DefinitionSet.load() })

    it("has a workspace", function() {
      assert.lengthOf(this.definitionSet.workspaces, 1)
      assert.instanceOf(this.definitionSet.workspaces[0], WorkspaceDefinition)
    })

    it("has a toolbox", function() {
      assert.lengthOf(this.definitionSet.toolboxes, 1)
      assert.instanceOf(this.definitionSet.toolboxes[0], ToolboxDefinition)
    })

    it("has blocks, but not disabled blocks", function() {
      assert.isAbove(this.definitionSet.blocks.length, 1)
      assert.instanceOf(this.definitionSet.blocks[0], BlockDefinition)
      assert.isEmpty(filter(this.definitionSet.blocks, "disabled"))
    })

    it("has mixins, including inline mixins from blocks", function() {
      assert.isAbove(Object.keys(this.definitionSet.mixins).length, 1)
      assert.exists(this.definitionSet.mixins.weatherMixin, "Expected an inline mixin to be present")
      assert.exists(this.definitionSet.mixins.airQualityMixin, "Expected air quality inline mixin to be present")
    })

    it("has extensions, including inline extensions from blocks", function() {
      assert.isAbove(Object.keys(this.definitionSet.extensions).length, 1)
      assert.exists(this.definitionSet.extensions.validateNumbers, "Expected an inline extension to be present")
    })

    it("has mutators", function() {
      assert.isAbove(Object.keys(this.definitionSet.mutators).length, 1)
    })

    it("has generators", function() {
      assert.isAbove(Object.keys(this.definitionSet.generators).length, 1)
    })

    it("has regenerators", function() {
      assert.isAbove(Object.keys(this.definitionSet.regenerators).length, 1)
    })
  })
})
