import BlockExporter from "./block_exporter.js"
import ToolboxExporter from "./toolbox_exporter.js"
import WorkspaceExporter from "./workspace_exporter.js"
import ScriptExporter from "./script_exporter.js"
import SidebarExporter from "./sidebar_exporter.js"
import BlockIndexExporter from "./block_index_exporter.js"
import BlockPageExporter from "./block_page_exporter.js"


/**
 * Organizes all the Exporters for use with the given
 * DefinitionSet and to the given destination. Yields
 * them to a builder function to use as appropriate.
 *
 * @param {String} destination
 * @param {DefinitionSet} definitions
 * @param {Function} exportFunc
 */
export const exportTo = async (destination, definitions, exportFunc) => {
  const exporters = {
    // app exporters
    toolbox: new ToolboxExporter(definitions, destination).exportToFile,
    workspace: new WorkspaceExporter(definitions, destination).exportToFile,
    blocks: new BlockExporter(definitions, destination).exportToFile,
    script: new ScriptExporter(definitions, destination).exportToFile,
    // docs exporters
    sidebar: new SidebarExporter(definitions, destination).exportToFile,
    blockIndex: new BlockIndexExporter(definitions, destination).exportToFile,
    blockPages: new BlockPageExporter(definitions, destination).exportToFile,
  }

  exportFunc(exporters)
}
