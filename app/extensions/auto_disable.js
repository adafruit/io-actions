// makes disabled blocks
export const autoDisable = ({ block }) => {
  block.setDisabledReason(true, 'auto_disable')
}

export default autoDisable
