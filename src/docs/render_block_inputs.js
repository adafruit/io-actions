import { capitalize, pickBy, forEach, keys } from 'lodash-es'

import { niceTemplate } from '#src/util.js'
import { renderBlockImage } from './render_block.js'


const
  renderInputs = definition => {
    if(definition.docOverrides?.inputs) {
      return renderOverridenInputs(definition)
    }

    if(!keys(definition.inputs).length) { return }

    return renderEachInput(definition)
  },

  renderOverridenInputs = definition => {
    // warn if any inputs have descriptions that won't be rendered
    const
      { inputs } = definition.docOverrides,
      missedInputs = keys(pickBy(definition.inputs, "description")).join(", ")

    if(missedInputs) {
      console.warn(`Warning [${definition.type}]: Inputs doc is overriden, input descriptions will not be seen for: ${missedInputs}`)
    }

    // determine if the override is a function to call
    return niceTemplate(typeof inputs === 'string'
      ? inputs
      : inputs(definition))
  },

  renderEachInput = definition => {
    const lines = []
    forEach(definition.inputs, (input, inputName) => {
      if(input.type === 'label') { return }

      lines.push(`### \`${ capitalize(inputName) }\``)
      if(input.description) { lines.push(niceTemplate(input.description)) }

      if (input.seeAlso) {
        const seeAlsoDef = definition.definitionSet.findBlock(input.seeAlso)
        if (seeAlsoDef) {
          lines.push(`**See Also:** [${seeAlsoDef.name}](/${seeAlsoDef.documentationPath()})`)
        }
      }

      // If the input has a check, find all blocks that can connect to it
      if (input.check) {
        const compatibleBlocks = definition.definitionSet.findBlocks(blockDef => {
          const output = blockDef.connections?.output
          if (input.check === 'trigger') { // allow trigger blocks which are statement types
            return output && (output === input.check || (Array.isArray(output) && output.includes(input.check)))
          }
          const mode = blockDef.connections?.mode
          return mode && mode !== 'statement' && output && (output === input.check || (Array.isArray(output) && output.includes(input.check)))
        })

        if (compatibleBlocks.length) {
          lines.push('::: details Compatible Blocks   (click to expand)')
          const blockCards = compatibleBlocks.map(blockDef => {
            const cleanLink = blockDef.documentationPath().replace(/\.md$/i, '');
            const
              imgSrc = `/block_images/${blockDef.type}.png`,
              altText = `the ${blockDef.name} block`,
              linkHref = `/actions-docs/${cleanLink}`

            return `
  <a href="${linkHref}" class="card" title="${blockDef.name}">
    <!-- ![${altText}](${imgSrc} "${blockDef.name}") -->
    <img alt="${altText}" src="${imgSrc}">
    <div class="card-content">
      <h4>${blockDef.name}</h4>
      <p>${blockDef.tooltip}</p>
    </div>
  </a>`
          })

          lines.push(`
<div class="card-grid">
${blockCards.join('\n')}
</div>
:::
`)
        }
      }
    })

    return lines.join("\n\n")
  }


export default renderInputs
