import blocks from './blocks.json'
import toolbox from './toolbox.json'
import initialWorkspace from './workspace.json'


INJECT_OPTIONS.toolbox = INJECT_OPTIONS.toolbox || toolbox
Blockly.defineBlocksWithJsonArray(blocks)

let currentWorkspace

// internal helpers
const
  processContextMenu = contextMenu => {
    const
      { registry } = Blockly.ContextMenuRegistry,
      { register=[], unregister=[] } = contextMenu

    // remove all specified items from the registry, if present
    unregister.forEach(menuId => {
      if(registry.getItem(menuId)) {
        registry.unregister(menuId)
      }
    })

    // add all specified items to the registry
    register.forEach(registryItem => {
      // grab existing item at registry id
      const existingItem = registry.getItem(registryItem.id)

      // early out if this exact item is already registered
      if(existingItem === registryItem) { return }

      // deregister the existing item if it exists
      if(existingItem) {
        registry.unregister(registryItem.id)
      }

      // register the new item
      registry.register(registryItem)
    })
  }

// public api
export const
  inject = function(blocklyDivId, options = {}) {
    if(currentWorkspace) {
      throw new Error('Already have a workspace, dispose of it before injecting a new one.')
    }

    options.contextMenu && processContextMenu(options.contextMenu)

    // inject extension data
    options.extensionData && extensions.injectData(options.extensionData)
    extensions.ready()

    if(options.disableToolboxZoom) {
      Blockly.VerticalFlyout.prototype.getFlyoutScale = () => 1
    }

    const blocklyInjectOptions = buildInjectOptions(options.injectOptions)

    // do normal Blockly injection here
    currentWorkspace = Blockly.inject(blocklyDivId, blocklyInjectOptions)

    try {
      // shortcut to make the outside data available everywhere/global
      // consider if this could be done other ways, less global
      currentWorkspace.extensionData = options.extensionData

      registerToolboxCallbacks(currentWorkspace)

      if(options.disableOrphans) {
        currentWorkspace.addChangeListener(Blockly.Events.disableOrphans)
      }

      if(options.workspaceData) {
        const workspaceJson = jsonToWorkspace(options.workspaceData)
        Blockly.serialization.workspaces.load(workspaceJson, currentWorkspace)

      } else if(options.workspaceJson) {
        Blockly.serialization.workspaces.load(options.workspaceJson, currentWorkspace)

      } else {
        Blockly.serialization.workspaces.load(initialWorkspace, currentWorkspace)
      }

      if(options.onJsonUpdated || options.onJsonError) {
        // auto-regenerate code
        currentWorkspace.addChangeListener(e => {
          if(e.isUiEvent || // no UI events
            e.type == Blockly.Events.FINISHED_LOADING || // no on-load
            currentWorkspace.isDragging()) // not while dragging
          { return }

          // generate next cycle so orphans get disabled first
          setTimeout(() => {
            try {
              const json = workspaceToJson(currentWorkspace)
              options.onJsonUpdated?.(json)
            } catch(error) {
              options.onJsonError?.(error)
            }
          })
        })
      }
    } catch(error) {
      // clean things up
      dispose()
      // rethrow exception
      throw error
    }

    if(AFTER_FIRST_RENDER_CALLBACKS.length) {
      Blockly.renderManagement.finishQueuedRenders().then(() => {
        AFTER_FIRST_RENDER_CALLBACKS.forEach(callback => callback())
      })
    }

    return currentWorkspace
  },

  addExtensionData = extensions.extendDatum,

  dispose = () => {
    extensions.dispose()
    if(!currentWorkspace) { throw new Error("Tried to dispose a non-existent workspace.") }

    currentWorkspace.dispose()
    currentWorkspace = null
  },

  // takes a workspace, returns a json string
  workspaceToJson = workspace => {
    return generators.json.workspaceToCode(workspace) || ""
  },

  // takes a json string or object, returns a workspace
  jsonToWorkspace = json => {
    const parsedJson = typeof json === 'string'
      ? JSON.parse(json)
      : json

    return regenerators.json.codeToWorkspace(parsedJson)
  }

// combine the INJECT_OPTIONS constant built up within the exported scripts
// with the optional runtime options given through inject(_, { injectOptions })
const buildInjectOptions = ( options={} ) => ({
  ...INJECT_OPTIONS,
  ...options
})
