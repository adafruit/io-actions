import { trim } from 'lodash-es'

import renderFields from './render_block_fields.js'
import renderInputs from './render_block_inputs.js'


export const
  IO_PLUS_ALERT = `
::: tip :warning: IO+ Required
This Block requires an IO+ subscription to use. [Learn more about IO+](https://io.adafruit.com/plus)
:::
`,

  renderBlockTitle = ({ name, ioPlus }) => {
    const ioPlusBadge = ioPlus ? '<Badge type="tip">IO+</Badge>' : ""

    return trim(`${name} ${ioPlusBadge}`)
  },

  // ![alt](url "title")
  renderBlockImage = ({ name, type }) => `![the ${name} block](/block_images/${type}.png "${name}")`,

  renderDescription = ({ description }) => description || "No docs for this block, yet.",

  renderIOPlusAlert = ({ ioPlus }) => ioPlus ? IO_PLUS_ALERT : "",

  renderFieldsSection = definition => {
    const fieldsMarkdown = renderFields(definition)

    return fieldsMarkdown
     ? `## Fields\n\n${ fieldsMarkdown }`
     : ""
  },

  renderInputsSection = definition => {
    const inputsMarkdown = renderInputs(definition)

    return inputsMarkdown
     ? `## Inputs\n\n${ inputsMarkdown }`
     : ""
  },

  renderOutput = definition => {
    return ''

    // TODO: re-enable when we have something meanginful to show the user
    // const defaultedOutput = capitalize(definition.connections?.output || "Unspecified")

    // return `
    //   ## Output
    //   ${ defaultedOutput }
    // `
  },

  renderExamples = definition => {
    return ""

    // TODO: re-enable conditionally when we have examples
    // return `
    //   ## Examples
    //   Coming soon...
    // `
  }

export default definition =>
`---
title: "Block: ${definition.name}"
editLink: true
definitionPath: ${ definition.definitionPath }
---

# Block: ${ renderBlockTitle(definition) }

Type: \`${definition.type}\`

${ renderBlockImage(definition) }

${ renderDescription(definition) }

${ renderIOPlusAlert(definition) }

${ renderFieldsSection(definition) }

${ renderInputsSection(definition) }

${ renderOutput(definition) }

${ renderExamples(definition) }
`
