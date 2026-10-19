// e2e harness: injects the exported Blockly app the same way io-rails does and
// exposes `window.harness` so Playwright tests can drive it without each test
// reaching into Blockly internals.
//
// URL params:
//   ?workspace=default|all|empty  default: the app's initial workspace
//                                  all: one of every block (workspace_all_blocks.json)
//   ?toolbox=off                   inject without the toolbox
//   ?orphans=off                   don't disable orphaned blocks
//   ?feeds=none                    no feeds available
//   ?locations=none                no weather/air quality locations

// bundle Inter so text renders (and measures) the same on every machine
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import * as Blockly from 'blockly'
import { inject, dispose, workspaceToJson } from './blockly_app.js'
import toolbox from './toolbox.json'
import allBlocksWorkspace from './workspace_all_blocks.json'


const params = new URLSearchParams(location.search)

const LONG_FEED_NAME = "Greenhouse Sensors: Soil Moisture Probe Number Seven (North Bed)"

const extensionData = () => ({
  // io-rails formats feed options as "Group: Feed Name"
  feedOptions: params.get('feeds') === 'none' ? [] : [
    ["Default: Temperature", "default.temperature"],
    ["Default: Humidity", "default.humidity"],
    [LONG_FEED_NAME, "greenhouse.soil-moisture-7"],
  ],
  weatherLocationOptions: params.get('locations') === 'none' ? [] : [
    ["Industry City", "1"],
    ["Varick", "2"],
  ],
  airQualityLocationOptions: params.get('locations') === 'none' ? [] : [
    ["Industry City", "1"],
    ["Varick", "2"],
  ],
  currentWeatherByLocation: {},
  currentAirQualityByLocation: {},
})

const initialWorkspaceJson = () => {
  switch(params.get('workspace')) {
    case 'all': return allBlocksWorkspace
    case 'empty': return {}
    default: return undefined // inject() falls back to the app's initial workspace
  }
}

// mirrors the inject() call in io-rails:
// app/javascript/src/views/Actions/blockly-export/Workspace.jsx
const injectOptions = (overrides = {}) => ({
  contextMenu: { unregister: [ "blockComment", "blockDisable" ] },
  extensionData: extensionData(),
  disableOrphans: params.get('orphans') !== 'off',
  disableToolboxZoom: true,
  onJsonUpdated: json => {
    harness.lastJson = json
    harness.jsonVersion += 1
  },
  injectOptions: {
    zoom: { controls: true, wheel: true },
    // not in io-rails: Blockly otherwise loads sprites/sounds from
    // blockly-demo.appspot.com, which makes screenshots network-dependent
    media: 'media/',
    ...(params.get('toolbox') === 'off' ? { toolbox: null } : {}),
  },
  workspaceJson: initialWorkspaceJson(),
  ...overrides,
})

const rectOf = element => {
  const { x, y, width, height } = element.getBoundingClientRect()
  return { x, y, width, height }
}

const centerOf = element => {
  const { x, y, width, height } = rectOf(element)
  return { x: x + width/2, y: y + height/2 }
}

const settle = () => Blockly.renderManagement.finishQueuedRenders()

const harness = window.harness = {
  Blockly,
  toolbox,
  LONG_FEED_NAME,
  ready: false,
  lastJson: null,
  jsonVersion: 0,

  workspace: () => Blockly.getMainWorkspace(),
  block: id => harness.workspace().getBlockById(id),
  settle,

  allBlockTypes: () => allBlocksWorkspace.blocks.blocks.map(b => b.type),
  topBlockTypes: () => harness.workspace().getTopBlocks(true).map(b => b.type),
  rootId: () => harness.workspace().getTopBlocks().find(b => b.type === 'action_root').id,
  exists: id => !!harness.block(id),
  enabled: id => harness.block(id).isEnabled(),
  fieldValue: (id, name) => harness.block(id).getFieldValue(name),
  fieldText: (id, name) => harness.block(id).getField(name).getText(),
  // clear every disabled reason and stop power-up blocks re-disabling themselves
  async forceEnable(id) {
    const block = harness.block(id)
    block.autoDisable = false
    block.getDisabledReasons().forEach(reason => block.setDisabledReason(false, reason))
    await settle()
  },
  async setField(id, name, value) {
    harness.block(id).setFieldValue(value, name)
    await settle()
  },

  // dispose and re-inject, e.g. with { workspaceData: bytecode }
  async reinject(overrides = {}) {
    harness.ready = false
    dispose()
    inject('blocklyDiv', injectOptions(overrides))
    await settle()
    harness.ready = true
  },

  // add a block from serialized JSON, returns its id
  async append(blockJson) {
    const block = Blockly.serialization.blocks.append(blockJson, harness.workspace())
    await settle()
    return block.id
  },

  // attach child into parent's named input (value or statement)
  async connect(parentId, inputName, childId) {
    const
      input = harness.block(parentId).getInput(inputName),
      child = harness.block(childId)

    input.connection.connect(child.previousConnection || child.outputConnection)
    await settle()
  },

  // hide every other top block and scroll this one near the top-left corner,
  // returns a padded clip rect for screenshots
  async isolate(blockId, padding = 6) {
    const workspace = harness.workspace(), block = harness.block(blockId)

    workspace.getTopBlocks().forEach(other => {
      other.getSvgRoot().style.display = other === block ? '' : 'none'
    })

    // drop the dot grid: its offset depends on scroll position, which would
    // make block-level screenshots noisy. Full-page shots keep it.
    workspace.getParentSvg().querySelector('.blocklyMainBackground').style.fill =
      workspace.getTheme().getComponentStyle('workspaceBackgroundColour')

    const { x, y } = block.getRelativeToSurfaceXY()
    workspace.scroll(-x * workspace.scale + 40, -y * workspace.scale + 40)
    await settle()

    const rect = rectOf(block.getSvgRoot())
    return {
      x: Math.max(0, Math.floor(rect.x - padding)),
      y: Math.max(0, Math.floor(rect.y - padding)),
      width: Math.ceil(rect.width + padding*2),
      height: Math.ceil(rect.height + padding*2),
    }
  },

  blockRect: blockId => rectOf(harness.block(blockId).getSvgRoot()),
  blockCenter: blockId => centerOf(harness.block(blockId).getSvgRoot()),
  fieldCenter: (blockId, fieldName) => centerOf(harness.block(blockId).getField(fieldName).getSvgRoot()),

  mutatorIcon: blockId => harness.block(blockId).getIcon(Blockly.icons.MutatorIcon.TYPE),
  mutatorCenter: blockId => centerOf(harness.mutatorIcon(blockId).svgRoot),
  mutatorOpen: blockId => !!harness.mutatorIcon(blockId)?.bubbleIsVisible(),

  categoryNames: () => [...document.querySelectorAll('.blocklyToolboxCategoryLabel')].map(el => el.textContent.trim()),
  categoryCenter: name => centerOf(
    [...document.querySelectorAll('.blocklyToolboxCategoryLabel')].find(el => el.textContent.trim() === name)
  ),

  flyout: () => harness.workspace().getToolbox()?.getFlyout(),
  flyoutVisible: () => !!harness.flyout()?.isVisible(),
  flyoutBlockTypes: () => harness.flyout().getWorkspace().getTopBlocks(true).map(b => b.type),
  flyoutButtonTexts: () => [...document.querySelectorAll('.blocklyFlyoutButton .blocklyText')].map(el => el.textContent),
  flyoutButtonCenter: text => centerOf(
    [...document.querySelectorAll('.blocklyFlyoutButton')].find(el => el.textContent.includes(text))
  ),
  flyoutBlockCenter: type => centerOf(
    harness.flyout().getWorkspace().getTopBlocks(true).find(b => b.type === type).getSvgRoot()
  ),

  editorOpen: () => Blockly.WidgetDiv.isVisible(),
  dropdownOpen: () => Blockly.DropDownDiv.isVisible(),
  contextMenuItems: () => [...document.querySelectorAll('.blocklyContextMenu .blocklyMenuItem')].map(el => el.textContent.trim()),

  // Blockly queues events onto the undo stack on a later task
  lastUndoEventType: () => harness.workspace().getUndoStack().at(-1)?.type,
  variableNames: () => harness.workspace().getVariableMap().getAllVariables().map(v => v.getName()),

  saveWorkspace: () => Blockly.serialization.workspaces.save(harness.workspace()),
  bytecode: () => workspaceToJson(harness.workspace()),
}

// fonts must be loaded before injecting: Blockly measures text when it renders
await Promise.all([400, 500, 600, 700].map(weight => document.fonts.load(`${weight} 16px Inter`)))
await document.fonts.ready

inject('blocklyDiv', injectOptions())
await settle()
harness.ready = true
