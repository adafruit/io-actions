import { capitalize, trim } from 'lodash-es'

import renderFields from './render_block_fields.js'
import renderInputs from './render_block_inputs.js'


const
  IO_PLUS_ALERT = `
::: tip :warning: IO+ Required
This Block requires an IO+ subscription to use. [Learn more about IO+](https://io.adafruit.com/plus)
:::
`,

  renderBlockTitle = ({ name, ioPlus }) => {
    const ioPlusBadge = ioPlus ? '<Badge type="tip">IO+</Badge>' : ""

    return trim(`${name} ${ioPlusBadge}`)
  },

  renderDescription = ({ description }) => description || "No docs for this block, yet.",

  renderIOPlusAlert = ({ ioPlus }) => ioPlus ? IO_PLUS_ALERT : "",

  renderOutput = definition => {
    return capitalize(definition.connections?.output || "Unspecified")
  },

  renderExamples = definition => {
    return "Coming soon..."
  }

export default definition =>
`---
title: "Block: ${definition.name}"
editLink: true
---

# Block: ${ renderBlockTitle(definition) }

Type: \`${definition.type}\`

${ renderDescription(definition) }

${ renderIOPlusAlert(definition) }

## Fields
${ renderFields(definition) }

## Inputs
${ renderInputs(definition) }

## Output
${ renderOutput(definition) }

## Examples
${ renderExamples(definition) }
`
