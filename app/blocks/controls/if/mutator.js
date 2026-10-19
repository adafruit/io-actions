import * as Blockly from 'blockly'

/** Dynamic else-if and else support */
export default {
  elseIfCount: 0,
  elsePresent: false,

  // helper to touch the above state and automatically fire events on change
  setProperty: function(propertyName, propertyValue, element, name) {
    const old = this[propertyName]
    if(old == propertyValue) { return }

    this[propertyName] = propertyValue

    Blockly.Events.fire(new Blockly.Events.BlockChange(this, element, name,
      { [propertyName]: old }, { [propertyName]: this[propertyName] }
    ))
  },

  saveExtraState: function() {
    return { elseIfCount: this.elseIfCount, elsePresent: this.elsePresent }
  },

  loadExtraState: function(state) {
    this.initializeElseIfs(state.elseIfCount)
    this.initializeElse(state.elsePresent)
  },

  // dynamic else-if-then support
  initializeElseIfs: function(elseIfCount) {
    this.addElseIf(elseIfCount)
    this.insertPlusElseIfButton()
  },

  insertPlusElseIfButton: function() {
    const elseIfLabel = this.getInput('ELSE_IF_LABEL')
    elseIfLabel.removeField('PLUS_ELSE_IF', true)
    elseIfLabel.insertFieldAt(0, this.plusField(() => this.addElseIf()), 'PLUS_ELSE_IF')
  },

  addElseIf: function(howMany=1) {
    for(let i = 1; i <= howMany; i++) {
      this.addElseIfAt(this.elseIfCount + i)
    }
    this.setProperty('elseIfCount', this.elseIfCount+howMany)
  },

  addElseIfAt: function(index) {
    this
      .appendValueInput(`IF${index}`)
      .appendField(this.minusField(() => this.removeElseIfAt(index)))
      .appendField(new Blockly.FieldLabel("else if"))
    this
      .appendStatementInput(`THEN${index}`)
      .appendField(new Blockly.FieldLabel("do"))
    // move them up above the last items
    this.moveInputBefore(`IF${index}`, 'ELSE_IF_LABEL')
    this.moveInputBefore(`THEN${index}`, 'ELSE_IF_LABEL')
  },

  removeElseIfAt: function(targetIndex) {
    // detect my parent IF input and its THEN
    const
      ifName = `IF${targetIndex}`,
      thenName = `THEN${targetIndex}`,
      ifInput = this.getInput(ifName),
      thenInput = this.getInput(thenName)

    // sever the connections
    const ifConnection = ifInput.connection
    if(ifConnection.isConnected()) { ifConnection.disconnect() }
    const thenConnection = thenInput.connection
    if(thenConnection.isConnected()) { thenConnection.disconnect() }

    // shuffle remaining if/then connections down
    const
      inputs = this.inputList,
      nextIndex = inputs.indexOf(ifInput) + 2

    let i = nextIndex
    for (let input; (input = inputs[i]); i++) {
      if (input.name == 'ELSE_LABEL') { break }

      const { targetConnection } = input.connection || {}
      if (targetConnection) {
        inputs[i - 2].connection.connect(targetConnection)
      }
    }

    // remove the last/highest index ifThen
    const indexToRemove = Math.floor((i-2)/2)
    this.removeInput(`IF${indexToRemove}`)
    this.removeInput(`THEN${indexToRemove}`)
    this.bumpNeighbours()

    this.setProperty('elseIfCount', this.elseIfCount-1)
  },

  // dynamic else support
  initializeElse: function(elsePresent) {
    elsePresent ? this.addElse() : this.removeElse()
  },

  addElse: function() {
    const elseLabel = this.getInput('ELSE_LABEL')

    // swap the plus to minus
    elseLabel.removeField('PLUS_ELSE', true)
    elseLabel.removeField('MINUS_ELSE', true)
    elseLabel.insertFieldAt(0, this.minusField(() => this.removeElse()), 'MINUS_ELSE')

    // add the input, write its label
    if(!this.getInput('ELSE')) {
      this
        .appendStatementInput('ELSE')
        .appendField(new Blockly.FieldLabel("do"))
    }

    this.setProperty('elsePresent', true, 'input', 'ELSE')
  },

  removeElse: function() {
    const elseLabel = this.getInput('ELSE_LABEL')
    // swap the minus to plus
    elseLabel.removeField('MINUS_ELSE', true)
    elseLabel.removeField('PLUS_ELSE', true)
    elseLabel.insertFieldAt(0, this.plusField(() => this.addElse()), 'PLUS_ELSE')

    const elseInput = this.getInput('ELSE')

    // sever the connection
    if(elseInput) {
      const { connection } = elseInput
      if(connection.isConnected()) { connection.disconnect() }
      // remove the input
      this.removeInput('ELSE')
    }

    this.setProperty('elsePresent', false)
  },

  plusImage:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT' +
    'ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz' +
    'FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW' +
    'MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS' +
    '44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg==',

  plusField: function(onClick) {
    return new Blockly.FieldImage(this.plusImage, 15, 15, undefined, onClick)
  },

  minusImage:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
    'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
    'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
    'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K',

  minusField: function(onClick) {
    return new Blockly.FieldImage(this.minusImage, 15, 15, undefined, onClick)
  },
}
