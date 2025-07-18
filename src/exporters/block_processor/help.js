const
    // TODO: rely on project configuration for docs site location
  DOCS_BLOCKS_ROOT = "https://adafruit.github.io/io-actions/blocks",

  processHelp = definition => {
    if (!definition.definitionPath) { return {} }

    const thisBlockPredicate = definition.definitionPath.slice(0, -3)

    return {
      helpUrl: `${DOCS_BLOCKS_ROOT}/${thisBlockPredicate}`
    }
  }

export default processHelp
