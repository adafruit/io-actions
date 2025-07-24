import { capitalize, keys, map, mapValues, pickBy, values } from 'lodash-es'

import { niceTemplate } from '#src/util.js'


const
  renderFields = definition => {
    if(definition.docOverrides?.fields) {
      return renderOverridenFields(definition)
    }

    const fields = values(mapValues(definition.fields, (newField, name) => {
      newField.field = name
      return newField
    }))

    if(!fields.length) { return "This block has no form fields." }

    return fields.map(renderField).join("\n\n")
  },

  renderOverridenFields = definition => {
    // warn if any inputs have descriptions that won't be rendered
    const
      { fields } = definition.docOverrides,
      missedFields = keys(pickBy(definition.fields, "description")).join(", ")

    if(missedFields) {
      console.warn(`Warning [${definition.type}]: Inputs doc is overriden, input descriptions will not be seen for: ${missedFields}`)
    }

    // determine if the override is a function to call
    return niceTemplate(typeof fields === 'string'
      ? fields
      : fields(definition))
  },

  renderField = field => {
    const lines = []

    // title for this field
    lines.push(`### \`${capitalize(field.field)}\``)

    // add lines based on what properties are present
    Object.hasOwn(field, 'description') && lines.push(niceTemplate(field.description))
    Object.hasOwn(field, 'text') && lines.push(renderTextField(field))
    Object.hasOwn(field, 'checked') && lines.push(renderCheckboxField(field))
    Object.hasOwn(field, 'options') && lines.push(renderSelectField(field))

    return lines.join("\n\n")
  },

  renderTextField = textField => `Default: "${textField.text}"`,

  renderCheckboxField = checkboxField => `- Boolean (default: ${checkboxField.checked})`,

  renderSelectField = selectField => {
    const
      optionList = map(selectField.options, ([ label, , doc ]) => doc
        ? `- \`${label}\`: ${doc}`
        : `- \`${label}\``
      ).join("\n")

    return optionList
  }


export default renderFields
