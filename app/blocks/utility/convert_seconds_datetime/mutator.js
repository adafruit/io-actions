/** Dual timezone slot mutator for Convert Seconds to DateTime */
export default {
  inputTimezoneType: 'tz_io_server',
  outputTimezoneType: 'tz_io_account',

  saveExtraState: function() {
    return {
      inputTimezoneType: this.inputTimezoneType,
      outputTimezoneType: this.outputTimezoneType
    }
  },

  loadExtraState: function({ inputTimezoneType, outputTimezoneType }) {
    this.inputTimezoneType = inputTimezoneType || 'tz_io_server'
    this.outputTimezoneType = outputTimezoneType || 'tz_io_account'
  },

  flyoutBlockTypes: ['tz_io_account', 'tz_io_server', 'tz_preset', 'tz_location_coords', 'tz_fixed_offset'],

  decompose: function(workspace) {
    // Initialize the top-level block for the sub-diagram
    const settingsBlock = workspace.newBlock('convert_tz_settings')
    settingsBlock.initSvg()

    // Create the input timezone block based on saved state
    const inputTimezoneBlock = workspace.newBlock(this.inputTimezoneType)
    inputTimezoneBlock.initSvg()

    // Connect input timezone
    const
      { connection: inputConnection } = settingsBlock.getInput("INPUT_TIMEZONE"),
      { outputConnection: inputOutput } = inputTimezoneBlock

    inputConnection.connect(inputOutput)
    inputConnection.setShadowState({ type: 'tz_io_server' })

    // Create the output timezone block based on saved state
    const outputTimezoneBlock = workspace.newBlock(this.outputTimezoneType)
    outputTimezoneBlock.initSvg()

    // Connect output timezone
    const
      { connection: outputConnection } = settingsBlock.getInput("OUTPUT_TIMEZONE"),
      { outputConnection: outputOutput } = outputTimezoneBlock

    outputConnection.connect(outputOutput)
    outputConnection.setShadowState({ type: 'tz_io_account' })

    return settingsBlock
  },

  compose: function(settingsBlock) {
    const inputTimezoneInput = settingsBlock.getInputTargetBlock("INPUT_TIMEZONE")
    this.inputTimezoneType = inputTimezoneInput?.type || 'tz_io_server'

    const outputTimezoneInput = settingsBlock.getInputTargetBlock("OUTPUT_TIMEZONE")
    this.outputTimezoneType = outputTimezoneInput?.type || 'tz_io_account'
  }
}
