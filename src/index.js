import Blockly from 'blockly'
import { compact, filter } from 'lodash-es'

// for building static:
import initialWorkspace from '../export/workspace.json'
import { inject, addExtensionData, jsonToWorkspace, workspaceToJson } from '../export/blockly_app.js'

// for running dev server:
// import initialWorkspace from './workspace.json'
// import { inject, addExtensionData, jsonToWorkspace, workspaceToJson } from './blockly_app.js'

import { clear, load, save } from './serialization'
import { imageExportRegistryItems } from './image_exporter.js'

import './index.css'


// let me play in the console
window.Blockly = Blockly

// wire up the internal json to the dom
const
  topBlocksDiv = document.getElementById('top-blocks'),
  totalBlocksDiv = document.getElementById('total-blocks'),
  allBlocksDiv = document.getElementById('all-blocks'),
  totalWorkspacesDiv = document.getElementById('total-workspaces'),
  blocklyJsonOutputDiv = document.getElementById('blockly-json'),
  bytecodeJsonOutputDiv = document.getElementById('bytecode-json'),

  onJsonUpdated = bytecodeJson => {
    const allBlocks = workspace.getAllBlocks()
    topBlocksDiv.innerText = workspace.getTopBlocks().length
    totalBlocksDiv.innerText = allBlocks.length
    allBlocksDiv.innerHTML = allBlocks.map(block => `- ${block.type} (${block.id.slice(0,3)})`).join("<br/>")

    blocklyJsonOutputDiv.innerText = ``
    bytecodeJsonOutputDiv.innerText = `Bytecode is valid JSON ✅\n\n${bytecodeJson}`

    try {
      const workspaceJson = JSON.stringify(jsonToWorkspace(bytecodeJson), null, 2)
      blocklyJsonOutputDiv.innerText = `Workspace JSON\n\n${workspaceJson}`
    } catch(error) {
      console.error("Workspace JSON Error:\n", error)
      console.error("JSON:\n", bytecodeJson)
      blocklyJsonOutputDiv.innerText = `Workspace JSON generation failed ❌\nYou may need the "Clear" button above.`
    }
  },

  onJsonError = error => {
    console.error("Bytecode JSON Error:\n", error)
    bytecodeJsonOutputDiv.innerText = `Bytecode generation failed ❌\nYou may need the "Clear" button above.`
    blocklyJsonOutputDiv.innerText = `Workspace JSON not generated.`
  }

const workspace = inject('blocklyDiv', {
  disableOrphans: true,
  disableToolboxZoom: true,
  onJsonUpdated,
  onJsonError,
  contextMenu: {
    unregister: [ "blockComment", "blockDisable" ],
    register: [
      ...imageExportRegistryItems
    ]
  },
  extensionData: {
    feedOptions: [
      ["Feeder 1", "abc123"],
      ["A Feed Z", "qrstuv"],
      ["Feedinsky &", "oneforyou-oneforme"],
    ],
    weatherLocationOptions: [
      [ "Industry City", "1" ],
      [ "Varick", "2" ],
      [ "Shenzhen", "3" ],
    ],
    airQualityLocationOptions: [
      [ "Industry City", "1" ],
      [ "Varick", "2" ],
      [ "Shenzhen", "3" ],
    ],
    currentWeatherByLocation: {
      1: {
        current: {
          cloudCover: "5.4321",
        }
      }
    },
    currentAirQualityByLocation: {
      1: {
        current: {
          aqi: "25",
        }
      }
    }
  },
  injectOptions: {
    zoom: { controls: true, wheel: true }
  }
})

// register listeners

// debug listener that logs all events for clarity
// workspace.addChangeListener(function(event) {
//   const
//     { isUiEvent, isBlank, blockId, type, ids, targetType, element, name, newValue, oldValue } = event,
//     keys = Object.keys(event),
//     logLines = [],
//     tags = compact([isUiEvent && 'ui', isBlank && 'blank']).map(tag => `(${tag})`)

//   if(!blockId) {
//     logLines.push(`Workspace: "${type}"  ${tags}`, element, oldValue, newValue)

//   } else {
//     const
//       bid = blockId.slice(0,3),
//       idLine = `id: "${bid}..."`,
//       block = workspace.getBlockById(blockId)

//     logLines.push(`Block "${type}":  ${tags}`)

//     if(block) {
//       const blockInfo = [
//         idLine,
//         ids && `ids: ${ids}`,
//         block.disabled && "disabled",
//         block.isInFlyout && "flyout",
//         block.isInsertionMarker() && "insertion marker",
//         `type: ${block.type}`,
//         targetType && `target: ${targetType}`,
//       ]
//       logLines.push(compact(blockInfo).join("\n  "))

//     } else {
//       logLines.push(idLine)
//       logLines.push("no block")
//     }

//     if(type === "drag") {
//       logLines.push(`drag ${event.isStart ? "started" : "stopped"}`)

//     } else {
//       // element = enum 'field', 'comment', 'collapsed', 'disabled', 'inline', 'mutation'
//       if (element === "field") {
//         logLines.push(`field: ${name} (${oldValue} -> ${newValue})`)

//       } else if(element === "disabled") {
//         logLines.push(`block ${newValue ? "disabled" : "enabled"}`)

//       } else {
//         logLines.push(element, newValue && `${oldValue} -> ${newValue}`)
//       }
//     }
//   }

//   console.log(compact(logLines).join("\n- "))
// })

// weather block live data fetcher/updater
workspace.addChangeListener(function({ blockId, type, name, element, newValue, oldValue }) {
  // when a weather block changes its location
  if(!blockId || type !== "change" || workspace.getBlockById(blockId).type !== "weather" || element !== "field" || name === "WEATHER_PROPERTY_HELP") {
    return
  }

  // quick/dirty for demo
  // if it is changing now, use newValue, otherwise fetch from field
  const
    block = workspace.getBlockById(blockId),
    currentLocation = name === "POWER_UP_ID"
      ? newValue
      : block.getFieldValue('POWER_UP_ID'),
    currentTimeKey = name === "WEATHER_TIME"
      ? newValue
      : block.getFieldValue('WEATHER_TIME'),
    currentMetricKey = name === "WEATHER_PROPERTY"
      ? newValue
      : block.getFieldValue('WEATHER_PROPERTY') // this can be wrong if time changed and props haven't been replaced yet

  const newData = {
    [currentLocation]: {
      [currentTimeKey]: {
        [currentMetricKey]: Math.random().toString().slice(0,5)
      }
    }
  }

  // delay to simulate a request happening
  setTimeout(() => {
    addExtensionData("currentWeatherByLocation", newData)
  }, 1500)
})

// air quality block live data fetcher/updater
workspace.addChangeListener(function({ blockId, type, name, element, newValue, oldValue }) {
  // when an air quality block changes its location
  if(!blockId || type !== "change" || workspace.getBlockById(blockId).type !== "airQuality" || element !== "field" || name === "AIR_QUALITY_PROPERTY_HELP") {
    return
  }

  // quick/dirty for demo
  // if it is changing now, use newValue, otherwise fetch from field
  const
    block = workspace.getBlockById(blockId),
    currentLocation = name === "POWER_UP_ID"
      ? newValue
      : block.getFieldValue('POWER_UP_ID'),
    currentTimeKey = name === "AIR_QUALITY_TIME"
      ? newValue
      : block.getFieldValue('AIR_QUALITY_TIME'),
    currentMetricKey = name === "AIR_QUALITY_PROPERTY"
      ? newValue
      : block.getFieldValue('AIR_QUALITY_PROPERTY') // this can be wrong if time changed and props haven't been replaced yet

  const newData = {
    [currentLocation]: {
      [currentTimeKey]: {
        [currentMetricKey]: Math.random().toString().slice(0,5)
      }
    }
  }

  // delay to simulate a request happening
  setTimeout(() => {
    addExtensionData("currentAirQualityByLocation", newData)
  }, 1500)
})


setInterval(() => {
  const
    workspaces = Blockly.Workspace.getAll(),
    total = workspaces.length,
    mutators = filter(workspaces, 'isMutator').length,
    flyouts = filter(workspaces, 'isFlyout').length,
    rest = total - mutators - flyouts

  totalWorkspacesDiv.innerText = `${rest}:${flyouts}:${mutators}`

}, 1000)
// auto-save on non-UI changes
workspace.addChangeListener((e) => e.isUiEvent || save(workspace))

// provide a way to clear the workspace and persistent memory
const
  clearButton = document.getElementById('button-clear'),
  clearAndInitialize = () => {
    clear(workspace)
    Blockly.serialization.workspaces.load(initialWorkspace, workspace)
  }
clearButton.addEventListener('click', clearAndInitialize)

const reloadBytecodeButton = document.getElementById('button-reload-bytecode')
reloadBytecodeButton.addEventListener('click', () => {
  // export bytecode
  const bytecodeJson = workspaceToJson(workspace)

  let workspaceJson
  try{
    // convert bytecode to workspace json
    workspaceJson = jsonToWorkspace(bytecodeJson)

  } catch(e) {
    console.error("Failed to parse bytecode:", bytecodeJson)
  }

  // disable events while we're working
  Blockly.Events.disable()
  try {
    // clear workspace
    workspace.clear()
    // load workspace json
    Blockly.serialization.workspaces.load(workspaceJson, workspace)

    console.log("Reloaded diagram from bytecode.")

  } catch(e) {
    console.log('Failed diagram reload. Reloading stored workspace...')
    console.error(e)

    load(workspace)

  } finally {
    Blockly.Events.enable()
  }
})

const reloadSerializedButton = document.getElementById('button-reload-serialized')
reloadSerializedButton.addEventListener('click', () => {
  load(workspace)
})

// INITIALIZE ON LOAD
load(workspace)
