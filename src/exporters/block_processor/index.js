import processConnections from './connections.js'
import processTemplate from './template.js'
import processExtensions from './extensions.js'
import processMutator from './mutators.js'
import processHelp from './help.js'


export const toBlockJSON = block => ({
  inputsInline: block.inputsInline,
  type: block.type,
  colour: block.colour || block.color,
  tooltip: block.tooltip,
  ...processConnections(block),
  ...processTemplate(block),
  ...processExtensions(block),
  ...processMutator(block),
  ...processHelp(block),
})
