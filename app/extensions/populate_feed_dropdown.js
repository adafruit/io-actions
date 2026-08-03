// Populates Feed dropdowns with name FEED_KEY to contain the user's feeds
// that are viable for Actions. Provided by the backend at runtime.
export const populateFeedDropdown = ({ block, data, Blockly }) => {
  const { feedOptions } = data

  if(!feedOptions?.length) {
    block.replaceDropdownOptions("FEED_KEY", [[ "No feeds available! Visit Feeds", "" ]])
    block.setEnabled(false)
    return
  }

  block.replaceDropdownOptions("FEED_KEY", feedOptions)
}

// also export as default
export default populateFeedDropdown
