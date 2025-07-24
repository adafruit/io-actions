const
    // TODO: rely on project configuration for docs site location
  DOCS_BLOCKS_ROOT = "https://adafruit.github.io/io-actions",

  processHelp = definition => {
    if (!definition.definitionPath) { return {} }

    const
      // location of the markdown, without the .md extension
      thisBlockPredicate = definition.documentationPath().slice(0, -3),
      // build the full URL
      helpUrl = `${DOCS_BLOCKS_ROOT}/${thisBlockPredicate}`

    return { helpUrl }
  }

export default processHelp
