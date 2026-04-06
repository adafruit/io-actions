import { readFileSync, writeFileSync } from 'fs'
import { filter, isString, keyBy, mapValues } from 'lodash-es'

import renderTemplate from '#src/renderers/template_renderer.js'
import renderObject from '#src/renderers/object_renderer.js'


const section = (title, contents) => `
///////////
// ${title}
///////////
${contents}
`

export default class ScriptExporter {
  definitionSet = null
  destination = null

  constructor(definitionSet, destination) {
    this.definitionSet = definitionSet
    this.destination = destination
  }

  export(givenOptions = {}) {
    const
      options = {
        toFile: false,
        ...givenOptions
      },
      scriptContents = [
        "import * as Blockly from 'blockly'\nimport '@blockly/field-multilineinput'\n\n",
        section("Toolbox", exportToolboxJs(this.definitionSet.primaryToolbox())),
        section("Mixins", exportMixinJs(this.definitionSet.mixins)),
        section("Extensions", exportExtensionJs(this.definitionSet.extensions)),
        section("Mutators", exportMutatorJs(this.definitionSet.mutators)),
        section("Generators", exportGeneratorJs(this.definitionSet.generators)),
        section("Regenerators", exportRegeneratorJs(this.definitionSet.regenerators)),
        section("Blockly API Wrapper", readFileSync(`./src/exporters/script_templates/blockly_api.js`))
      ].join("")

    if(!options.toFile) {
      return scriptContents
    }

    const filename = isString(options.toFile)
      ? options.toFile
      : `blockly_app.js`

    writeFileSync(`${this.destination}/${filename}`, scriptContents)
  }

  exportToFile = (toFile=true) => {
    this.export({ toFile })
  }
}

const
  exportToolboxJs = toolboxDefinition => {
    const
      categoriesWithCallbacks = filter(toolboxDefinition.categories, "callback"),
      // { "Category Name": () -> { /* category callback */ }}
      categoriesObject = mapValues(keyBy(categoriesWithCallbacks, "name"), "callback"),
      renderedCategoryCallbacks = `const categoryCallbacks = ${ renderObject(categoriesObject) }`

    return renderTemplate(renderedCategoryCallbacks, './src/exporters/script_templates/toolbox.template.js')
  },

  exportMixinJs = mixins => {
    const renderedMixins = `const allMixins = ${renderObject(mixins)}`
    // render the mixins template and return the output
    return renderTemplate(renderedMixins, './src/exporters/script_templates/mixins.template.js')
  },

  exportExtensionJs = extensions => {
    const renderedExtensions = `const allExtensions = ${ renderObject(extensions) }`
    // render the extensions template and return the output
    return renderTemplate(renderedExtensions, './src/exporters/script_templates/extensions.template.js')
  },

  exportMutatorJs = mutators => {
    // write the javascript into a string
    const renderedMutators = `const allBlockMutators = ${ renderObject(mutators) }`
    // render the mutators template and return the output
    return renderTemplate(renderedMutators, './src/exporters/script_templates/mutators.template.js')
  },

  exportGeneratorJs = generators => {
    // write the javascript into a string
    const renderedGenerators = `const blockGenerators = ${ renderObject(generators) }`
    // render the generators template and return the output
    return renderTemplate(renderedGenerators, './src/exporters/script_templates/generators.template.js')
  },

  exportRegeneratorJs = regenerators => {
    // write the javascript into a string
    const renderedRegenerators = `const blockRegenerators = ${ renderObject(regenerators) }`

    return renderTemplate(renderedRegenerators, './src/exporters/script_templates/regenerators.template.js')
  }
