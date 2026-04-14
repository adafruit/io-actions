import { describe, it } from 'node:test'
import { assert } from 'chai'

import feedGetPropertyDef from "#app/blocks/feed/get_property.js"
import BlockDefinition from "#src/definitions/block_definition.js"


describe("Feed Get Property Block", () => {
  it("works", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    assert.equal(definition.type, 'feed_get_property')
  })

  it("exports block JSON with correct structure", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    const blockJSON = definition.toBlocklyJSON()

    assert.exists(blockJSON.message0)
    assert.exists(blockJSON.args0)
    assert.equal(blockJSON.output, 'expression')
    assert.equal(blockJSON.colour, 300)
  })

  it("has PROPERTY dropdown with all feed properties", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    const blockJSON = definition.toBlocklyJSON()
    
    // May be in args0 or args1 due to template line breaks
    const allArgs = [...(blockJSON.args0 || []), ...(blockJSON.args1 || [])]
    const propertyArg = allArgs.find(arg => arg.name === 'PROPERTY')
    assert.exists(propertyArg, 'PROPERTY field should exist')
    assert.equal(propertyArg.type, 'field_dropdown')
    
    const optionValues = propertyArg.options.map(opt => opt[1])
    assert.include(optionValues, 'key')
    assert.include(optionValues, 'name')
    assert.include(optionValues, 'description')
    assert.include(optionValues, 'current_value')
    assert.include(optionValues, 'last_value')
    assert.include(optionValues, 'updated_at')
    assert.include(optionValues, 'created_at')
    assert.include(optionValues, 'unit_type')
    assert.include(optionValues, 'unit_symbol')
    assert.include(optionValues, 'status')
    assert.include(optionValues, 'visibility')
  })

  it("has FEED_KEY dropdown", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    const blockJSON = definition.toBlocklyJSON()
    
    const allArgs = [...(blockJSON.args0 || []), ...(blockJSON.args1 || [])]
    const feedKeyArg = allArgs.find(arg => arg.name === 'FEED_KEY')
    assert.exists(feedKeyArg, 'FEED_KEY field should exist')
    assert.equal(feedKeyArg.type, 'field_dropdown')
  })

  it("generates correct JSON for getting current_value", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'PROPERTY') return 'current_value'
        if (field === 'FEED_KEY') return 'temperature'
        return null
      }
    }
    
    const [result, precedence] = definition.generators.json(mockBlock)
    const parsed = JSON.parse(result)
    
    assert.equal(precedence, 0)
    assert.exists(parsed.getFeedProperty)
    assert.equal(parsed.getFeedProperty.key, 'temperature')
    assert.equal(parsed.getFeedProperty.property, 'current_value')
  })

  it("generates correct JSON for getting updated_at timestamp", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'PROPERTY') return 'updated_at'
        if (field === 'FEED_KEY') return 'humidity'
        return null
      }
    }
    
    const [result] = definition.generators.json(mockBlock)
    const parsed = JSON.parse(result)
    
    assert.equal(parsed.getFeedProperty.key, 'humidity')
    assert.equal(parsed.getFeedProperty.property, 'updated_at')
  })

  it("regenerates correctly from JSON", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    
    const blockObject = {
      getFeedProperty: {
        key: 'motion-sensor',
        property: 'status'
      }
    }
    
    const regenerated = definition.regenerators.json(blockObject)
    
    assert.equal(regenerated.type, 'feed_get_property')
    assert.equal(regenerated.fields.FEED_KEY, 'motion-sensor')
    assert.equal(regenerated.fields.PROPERTY, 'status')
  })

  it("throws error when regenerating without getFeedProperty data", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    
    assert.throws(() => {
      definition.regenerators.json({})
    }, /No getFeedProperty data/)
  })

  it("uses correct mixins and extensions for feed dropdown", () => {
    assert.include(feedGetPropertyDef.mixins, 'replaceDropdownOptions')
    assert.include(feedGetPropertyDef.extensions, 'populateFeedDropdown')
  })
})


describe("Feed Get Property Block - Use Cases", () => {
  it("can get feed unit information", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'PROPERTY') return 'unit_symbol'
        if (field === 'FEED_KEY') return 'temperature'
        return null
      }
    }
    
    const [result] = definition.generators.json(mockBlock)
    const parsed = JSON.parse(result)
    
    assert.equal(parsed.getFeedProperty.property, 'unit_symbol')
  })

  it("can get previous value for comparison", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'PROPERTY') return 'previous_value'
        if (field === 'FEED_KEY') return 'counter'
        return null
      }
    }
    
    const [result] = definition.generators.json(mockBlock)
    const parsed = JSON.parse(result)
    
    assert.equal(parsed.getFeedProperty.property, 'previous_value')
  })

  it("can get created_at timestamp for age calculations", () => {
    const definition = BlockDefinition.parseRawDefinition(feedGetPropertyDef)
    
    const mockBlock = {
      getFieldValue: (field) => {
        if (field === 'PROPERTY') return 'created_at'
        if (field === 'FEED_KEY') return 'sensor-data'
        return null
      }
    }
    
    const [result] = definition.generators.json(mockBlock)
    const parsed = JSON.parse(result)
    
    assert.equal(parsed.getFeedProperty.property, 'created_at')
  })
})
