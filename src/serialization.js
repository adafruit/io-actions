import * as Blockly from 'blockly'

const storageKey = 'blocklyToolWorkspace'

/**
 * Clears the workspace and wipes the browser's local storage.
 * @param {Blockly.Workspace} workspace Blockly workspace to save.
 */
export const clear = function(workspace) {
  window.localStorage?.removeItem(storageKey)
  workspace.clear()
}

/**
 * Saves the state of the workspace to browser's local storage.
 * @param {Blockly.Workspace} workspace Blockly workspace to save.
 */
export const save = function(workspace) {
  const data = Blockly.serialization.workspaces.save(workspace)
  window.localStorage?.setItem(storageKey, JSON.stringify(data))
}

/**
 * Loads saved state from local storage into the given workspace.
 * @param {Blockly.Workspace} workspace Blockly workspace to load into.
 */
export const load = function(workspace) {
  const data = window.localStorage?.getItem(storageKey)
  if (!data) return

  // Don't emit events during loading.
  Blockly.Events.disable()
  try {
    Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false)
  } catch(e) {
    console.error("Failed to load a stored Blockly state, Blockly system may have changed incompatibly.")
    console.error(e)
    return
  } finally {
    Blockly.Events.enable()
  }
  return true
}
