/** Mutator for text_to_datetime block - timezone and format settings */
export default {
  timezoneType: 'tz_io_account',
  formatType: 'fmt_iso8601',

  saveExtraState: function() {
    return {
      timezoneType: this.timezoneType,
      formatType: this.formatType
    }
  },

  loadExtraState: function(state) {
    this.timezoneType = state?.timezoneType || 'tz_io_account'
    this.formatType = state?.formatType || 'fmt_iso8601'
  },

  flyoutBlockTypes: [
    'tz_io_account', 'tz_io_server', 'tz_preset', 'tz_location_coords', 'tz_fixed_offset',
    'fmt_iso8601', 'fmt_rfc2822', 'fmt_unix', 'fmt_preset', 'fmt_custom'
  ],

  decompose: function(workspace) {
    const settingsBlock = workspace.newBlock('text_to_datetime_settings')
    settingsBlock.initSvg()

    // Create and connect timezone block
    const timezoneBlock = workspace.newBlock(this.timezoneType)
    timezoneBlock.initSvg()
    const tzInput = settingsBlock.getInput("TIMEZONE")
    tzInput.connection.connect(timezoneBlock.outputConnection)
    tzInput.connection.setShadowState({ type: 'tz_io_account' })

    // Create and connect format block
    const formatBlock = workspace.newBlock(this.formatType)
    formatBlock.initSvg()
    const fmtInput = settingsBlock.getInput("FORMAT")
    fmtInput.connection.connect(formatBlock.outputConnection)
    fmtInput.connection.setShadowState({ type: 'fmt_iso8601' })

    return settingsBlock
  },

  compose: function(settingsBlock) {
    const timezoneInput = settingsBlock.getInputTargetBlock("TIMEZONE")
    const formatInput = settingsBlock.getInputTargetBlock("FORMAT")
    
    this.timezoneType = timezoneInput?.type || 'tz_io_account'
    this.formatType = formatInput?.type || 'fmt_iso8601'
  }
}
