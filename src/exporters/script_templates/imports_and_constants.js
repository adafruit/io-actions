// the real Blockly import that gets used by the exported app
import * as Blockly from 'blockly'
import { FieldMultilineInput, registerFieldMultilineInput } from '@blockly/field-multilineinput'

registerFieldMultilineInput()


// constants that other scripts can tie into before
// they are used at the end at injection time
const
  // tie into the options passed into .inject(...)
  INJECT_OPTIONS = {},
  // push callbacks to be called after the first Blockly render completes
  AFTER_FIRST_RENDER_CALLBACKS = []
