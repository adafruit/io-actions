import { capitalize, pickBy, forEach, keys } from 'lodash-es'

import { niceTemplate } from '#src/util.js'


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
      lines.push(input.description)
    })

    return lines.join("\n\n")
  }


export default renderInputs
