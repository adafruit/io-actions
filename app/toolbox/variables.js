export default {
  name: 'Variables',
  colour: 240,
  icon: 'variables',
  usesBlocks: [ 'io_variables_set', 'io_variables_get' ],
  // called each time the category is opened
  callback: workspace => {
    // TODO: make a Button abstraction to wrap this up
    // register a button callback by name
    workspace.registerButtonCallback('new-variable', () => {
      const newVariableName = prompt("What is your variable called?")
      if(newVariableName) {
        workspace.createVariable(newVariableName)
      }
    })

    // pull the existing variables out of the workspace
    const
      variableIds = workspace.getAllVariables().map(v => v.getId()),
      variableBlocks = variableIds.flatMap(id => ([
        { // setter block for this variable
          kind: 'block',
          type: 'io_variables_set',
          fields: { VAR: { id }},
          inputs: { VALUE: { shadow: { type: 'io_text' } } }
        }, { // getter block for this variable
          kind: 'block',
          type: 'io_variables_get',
          fields: { VAR: { id }}
        }
      ]))

    // category contents
    const contents = [
      // button for creating new variables
      {
        kind: 'button',
        text: ' Create New Variable ',
        callbackKey: 'new-variable' // references the registered function above
      },
    ]

    // more compatible then contents.push(...variableBlocks)
    contents.push.apply(contents, variableBlocks)

    return contents
  }
}
