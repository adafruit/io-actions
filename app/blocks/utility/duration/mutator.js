/** Single timezone slot mutator for Duration block */
export default {
  timezoneType: 'tz_io_account',

  saveExtraState: function() {
    return {
      timezoneType: this.timezoneType
    }
  },

  loadExtraState: function({ timezoneType }) {
    this.timezoneType = timezoneType || 'tz_io_account'
  },

  flyoutBlockTypes: ['tz_io_account', 'tz_utc', 'tz_device', 'tz_preset', 'tz_fixed_offset'],

  decompose: function(workspace) {
    // Initialize the top-level block for the sub-diagram
    const settingsBlock = workspace.newBlock('duration_tz_settings')
    settingsBlock.initSvg()

    // Create the timezone block based on saved state
    const timezoneBlock = workspace.newBlock(this.timezoneType)
    timezoneBlock.initSvg()

    // Connect it to the settings block
    const
      { connection } = settingsBlock.getInput("TIMEZONE"),
      { outputConnection } = timezoneBlock

    connection.connect(outputConnection)
    connection.setShadowState({ type: 'tz_io_account' })

    return settingsBlock
  },

  compose: function(settingsBlock) {
    const timezoneInput = settingsBlock.getInputTargetBlock("TIMEZONE")
    this.timezoneType = timezoneInput?.type || 'tz_io_account'
  }
}
