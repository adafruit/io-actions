/** @type {import('#types').BlockDefinitionRaw} */
export default {
  type: 'io_logic_boolean',
  name: "Boolean",
  colour: 60,
  description: "A simple true or false value for building logic conditions and controlling digital outputs. Use 'true' to turn things on, enable conditions, or represent 'yes' states. Use 'false' to turn things off, disable conditions, or represent 'no' states. Essential for controlling relays, LEDs, alarms, and any on/off IoT devices.",
  connections: {
    mode: "value",
    output: [ "expression", "boolean" ],
  },
  template: "%BOOL",
  fields: {
    BOOL: {
      description: "Choose the boolean state you want to use:",
      options: [
        ['true', 'TRUE', "Represents 'on', 'yes', 'enabled', or 'active' state. Use for turning on devices, enabling features, or setting positive conditions."],
        ['false', 'FALSE', "Represents 'off', 'no', 'disabled', or 'inactive' state. Use for turning off devices, disabling features, or setting negative conditions."],
      ]
    }
  },
  generators: {
    json: block => {
      const bool = block.getFieldValue('BOOL') === 'TRUE'
      return [ JSON.stringify(bool), 0 ]
    }
  }
}
