import { includes, isEmpty, keys, trim, without } from 'lodash-es'

import { niceTemplate } from '#src/util.js'


const
  DEFAULT_ALIGNMENT = "RIGHT",
  ALIGNMENT_REGEX = /\s*\|(CENTER|CENTRE|RIGHT|LEFT)$/m,
  // %, followed by a letter, optionally followed by letters/numbers, followed by whitespace or EoI
  ARG_REGEX = /(%[a-zA-Z]\w*)/gm,

  INPUT_TYPE_MAP = {
    label: 'input_dummy',
    value: 'input_value',
    statement: 'input_statement'
  },

  TEXT_FIELD_TYPES = [
    "field_input",
    "field_label",
    "field_multilinetext",
  ]

const processTemplate = blockDefinition => {
  const { template, inputs={}, fields={} } = blockDefinition
  if (!template) { return {} }

  const
    msgAndArgs = {},
    covered = [],
    // break template on newlines
    givenLines = niceTemplate(template).split("\n")

  let lineIndex = 0

  givenLines.forEach(lineWithAlignment => {
    const
      [line, alignment] = breakLineAndAlignment(lineWithAlignment),
      matches = line.match(ARG_REGEX) || [],
      subLines = []

    // create a sub-line each time we encounter an input
    let endOfLastMatch = 0
    matches.forEach(match => {
      const matchName = trim(match.slice(1)) // strip the leading %
      // early out if not an input
      if (!inputs[matchName]) { return }

      // add a sub-line up to it
      const endOfMatch = line.indexOf(match) + match.length
      subLines.push(line.slice(endOfLastMatch, endOfMatch))
      endOfLastMatch = endOfMatch
    })

    // add another line if there is content after the last input
    if(endOfLastMatch < line.length) {
      subLines.push(line.slice(endOfLastMatch, line.length))
    }

    subLines.forEach(subLine => {
      // rematch for just this sub-line
      const subMatches = subLine.match(ARG_REGEX) || []
      // - extract data refs, replace with indices
      subMatches.forEach((match, matchIdx) => {
        subLine = subLine.replace(trim(match), `%${matchIdx+1}`)
      })

      // build up the args for this line
      const args = []

      let foundInput = false
      subMatches.forEach(match => {
        const matchName = trim(match.slice(1)) // strip the leading %

        // error if already covered
        if(covered.includes(matchName)) {
          throw new Error(`Duplicate input/field name (${matchName}) referenced in template (for block: ${blockDefinition.type})`)
        }

        // find the match input or field
        const inputMatch = inputs[matchName]
        if(inputMatch) {
          foundInput = true
          // add the input arg
          args.push({
            type: inputMatch.type ? INPUT_TYPE_MAP[inputMatch.type] : "input_value",
            name: matchName,
            ...(inputMatch.check ? { check: inputMatch.check } : {}),
            align: alignment,
          })

        } else if(fields[matchName]) {
          // add the field arg
          const
            fieldData = fields[matchName],
            type = fieldTypeFromProperties(fieldData),
            isTextType = TEXT_FIELD_TYPES.includes(type)

          args.push({
            name: matchName,
            type,
            checked: fieldData.checked,
            options: fieldData.options?.map(option => option.slice(0,2)), // slice out option documentation
            text: fieldData.text || fieldData.multiline_text || fieldData.label || (isTextType ? "" : undefined),
            spellcheck: fieldData.spellcheck,
            value: fieldData.value,
          })

        } else {
          throw new Error(`No input or field with name ${matchName} (processing block: ${blockDefinition.type})`)
        }

        // remember we covered this one
        covered.push(matchName)
      })

      // attach a dummy input for alignment
      if(!foundInput) {
        subLine += ` %${subMatches.length + 1}`
        args.push({
          type: "input_dummy",
          align: alignment
        })
      }

      msgAndArgs[`message${lineIndex}`] = subLine
      msgAndArgs[`args${lineIndex}`] = args

      lineIndex += 1
    })
  })

  // warn on any uncovered inputs or fields
  const unusedInputs = without(keys(inputs), ...covered)
  if(!isEmpty(unusedInputs)) {
    throw new Error(`Some inputs were not used in the template: ${unusedInputs}`)
  }
  const unusedFields = without(keys(fields), ...covered)
  if(!isEmpty(unusedFields)) {
    throw new Error(`Some fields where not used in the template: ${unusedFields}`)
  }

  return msgAndArgs
}

const breakLineAndAlignment = line => {
  // - extract alignment
  let alignment = DEFAULT_ALIGNMENT
  const alignMatches = line.match(ALIGNMENT_REGEX)
  if(alignMatches) {
    // remember the alignment
    alignment = alignMatches[1]
    // purge from the line
    line = line.replace(alignMatches[0], "")
  }

  return [ line, alignment.replace("ER", "RE")] // anglocize CENTER
}

const fieldTypeFromProperties = fieldData => {
  const fieldKeys = keys(fieldData)

  let finalType

  finalType = (fieldData.options && "field_dropdown")
    || (includes(fieldKeys, "checked") && "field_checkbox")
    || (includes(fieldKeys, "text") && "field_input")
    || (includes(fieldKeys, "label") && "field_label")
    || (includes(fieldKeys, "serializable_label") && "field_label_serializable")
    || (includes(fieldKeys, "multiline_text") && "field_multilinetext")

  if(fieldData.type) {
    if(finalType && finalType !== fieldData.type) {
      throw new Error(`Given type (${fieldData.type}) is different than the discovered type (${finalType})`)
    }

    finalType = fieldData.type
  }

  if(!finalType){
    throw new Error(`No type found or discovered in field properties: ${JSON.stringify(fieldData, null, 2)}`)
  }

  return finalType
}

export default processTemplate
