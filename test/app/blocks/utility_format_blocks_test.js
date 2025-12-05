import { describe, it } from 'node:test'
import { assert } from 'chai'

import fmtIso8601DefObject from "#app/blocks/utility/format/fmt_iso8601.js"
import fmtRfc2822DefObject from "#app/blocks/utility/format/fmt_rfc2822.js"
import fmtUnixDefObject from "#app/blocks/utility/format/fmt_unix.js"
import fmtPresetDefObject from "#app/blocks/utility/format/fmt_preset.js"
import fmtCustomDefObject from "#app/blocks/utility/format/fmt_custom.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("DateTime Format Blocks", () => {
  describe("ISO 8601 Format Block", () => {
    it("has correct type and output", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtIso8601DefObject)

      assert.equal(definition.type, 'fmt_iso8601')
      assert.equal(definition.connections.output, 'datetime_format')
    })

    it("generates correct JSON", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtIso8601DefObject)
      const result = definition.generators.json()

      assert.exists(result.format)
      assert.equal(result.format.type, 'iso8601')
    })

    it("regenerates correctly", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtIso8601DefObject)
      const regenerated = definition.regenerators.json()

      assert.deepEqual(regenerated, ['fmt_iso8601', {}])
    })
  })

  describe("RFC 2822 Format Block", () => {
    it("has correct type and output", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtRfc2822DefObject)

      assert.equal(definition.type, 'fmt_rfc2822')
      assert.equal(definition.connections.output, 'datetime_format')
    })

    it("generates correct JSON", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtRfc2822DefObject)
      const result = definition.generators.json()

      assert.exists(result.format)
      assert.equal(result.format.type, 'rfc2822')
    })
  })

  describe("Unix Timestamp Format Block", () => {
    it("has correct type and output", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtUnixDefObject)

      assert.equal(definition.type, 'fmt_unix')
      assert.equal(definition.connections.output, 'datetime_format')
    })

    it("generates correct JSON", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtUnixDefObject)
      const result = definition.generators.json()

      assert.exists(result.format)
      assert.equal(result.format.type, 'unix')
    })
  })

  describe("Preset Format Block", () => {
    it("has correct type and output", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtPresetDefObject)

      assert.equal(definition.type, 'fmt_preset')
      assert.equal(definition.connections.output, 'datetime_format')
    })

    it("has format dropdown with multiple options", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtPresetDefObject)

      assert.exists(definition.fields.FORMAT)
      assert.exists(definition.fields.FORMAT.options)
      assert.isArray(definition.fields.FORMAT.options)
      assert.isAbove(definition.fields.FORMAT.options.length, 5) // Has many presets
    })

    it("generates correct JSON with preset value", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtPresetDefObject)

      const mockBlock = {
        getFieldValue: (name) => name === 'FORMAT' ? 'datetime_long' : null
      }

      const result = definition.generators.json(mockBlock)

      assert.exists(result.format)
      assert.equal(result.format.type, 'preset')
      assert.equal(result.format.preset, 'datetime_long')
    })

    it("regenerates correctly with preset value", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtPresetDefObject)

      const blockObject = {
        format: { type: 'preset', preset: 'date_short_us' }
      }

      const regenerated = definition.regenerators.json(blockObject)

      assert.deepEqual(regenerated, ['fmt_preset', { FORMAT: 'date_short_us' }])
    })
  })

  describe("Custom strftime Format Block", () => {
    it("has correct type and output", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtCustomDefObject)

      assert.equal(definition.type, 'fmt_custom')
      assert.equal(definition.connections.output, 'datetime_format')
    })

    it("has text field for format string", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtCustomDefObject)

      assert.exists(definition.fields.FORMAT_STRING)
      assert.exists(definition.fields.FORMAT_STRING.text)
      assert.equal(definition.fields.FORMAT_STRING.text, '%Y-%m-%d %H:%M:%S')
    })

    it("generates correct JSON with custom pattern", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtCustomDefObject)

      const mockBlock = {
        getFieldValue: (name) => name === 'FORMAT_STRING' ? '%B %d, %Y' : null
      }

      const result = definition.generators.json(mockBlock)

      assert.exists(result.format)
      assert.equal(result.format.type, 'strftime')
      assert.equal(result.format.pattern, '%B %d, %Y')
    })

    it("regenerates correctly with pattern", () => {
      const definition = BlockDefinition.parseRawDefinition(fmtCustomDefObject)

      const blockObject = {
        format: { type: 'strftime', pattern: '%H:%M' }
      }

      const regenerated = definition.regenerators.json(blockObject)

      assert.deepEqual(regenerated, ['fmt_custom', { FORMAT_STRING: '%H:%M' }])
    })
  })

  describe("All format blocks", () => {
    it("all have datetime_format output type for mutator compatibility", () => {
      const formatBlocks = [
        fmtIso8601DefObject,
        fmtRfc2822DefObject,
        fmtUnixDefObject,
        fmtPresetDefObject,
        fmtCustomDefObject
      ]

      formatBlocks.forEach(blockDef => {
        const definition = BlockDefinition.parseRawDefinition(blockDef)
        assert.equal(
          definition.connections.output, 
          'datetime_format',
          `${definition.type} should output datetime_format`
        )
      })
    })
  })
})
