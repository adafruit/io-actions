// the real Blockly import that gets used by the exported app
import Blockly from 'blockly'


// constants that other scripts can tie into before
// they are used at the end at injection time
const
  INJECT_OPTIONS = {} // tie into the options passed into .inject(...)
