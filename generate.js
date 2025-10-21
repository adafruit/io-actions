import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, cpSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { basename, dirname, sep } from 'node:path'

import DefinitionSet from '#src/definitions/definition_set.js'


const
  // constants
  BLOCK_PATH_REGEX = /((\w[\/\\])+)\w+/gm,
  USAGE = `Usage: node generate.js [block|doc] [path/to/block_name]`,

  // parse command line stuff
  toGenerate = process.argv[2],
  blockPath = process.argv[3],
  taskArgs = process.argv.slice(4),

  // CLI error helper
  usageError = (msg) => {
    throw new Error(`Generator Error: ${msg}\n${USAGE}`)
  }

// early outs on usage
if(!toGenerate) {
  usageError("No generator specified.")
}

if(!["block", "doc"].includes(toGenerate)) {
  usageError(`No generater named "${toGenerate}"`)
}

if(!blockPath) {
  usageError("No block path specified.")
}
if(!blockPath.match(BLOCK_PATH_REGEX)) {
  usageError(`Given block path (${blockPath}) is invalid.`)
}

// block lookup, expected file paths, etc
const
  // Normalize blockPath to use forward slashes for consistency
  normalizedBlockPath = blockPath.replace(/\\/g, '/'),
  blockType = basename(normalizedBlockPath),
  blockName = blockType.split("_").map(path => path.slice(0,1).toUpperCase() + path.slice(1)).join(" "),
  parentDir = `app/blocks/${dirname(normalizedBlockPath)}`,
  fullBlockPath = `app/blocks/${normalizedBlockPath}.js`,
  fullBlockDocPath = `app/blocks/${normalizedBlockPath}.md`

const
  checkCanWriteFile = fullPath => {
    if(existsSync(fullPath) && !taskArgs.includes("force")) {
      throw new Error(`Cannot generate doc: file already exists at ${fullPath}. Add "force" to the ovewrite the existing file.`)
    }
  }

if(toGenerate === "block") {
  console.log(`Generating block at: app/blocks/${blockPath}.js`)

  const
    // read block template file
    blockTemplate = readFileSync("src/generators/templates/block_template.js").toString(),
    // replace block name and type
    customizedTemplate = blockTemplate.replaceAll("block_type", blockType).replaceAll("Block Name", blockName)

  // make sure the parent directory exists
  mkdirSync(parentDir, { recursive: true })
  // write to given path
  writeFileSync(fullBlockPath, customizedTemplate)

  console.log(`Wrote new block file to ${fullBlockPath}`)

} else if(toGenerate === "doc") {
  if(!existsSync(fullBlockPath)) {
    throw new Error(`Cannot generate doc: block must exist at ${fullBlockPath}, first.`)
  }

  // load the definitions
  const definitions = await DefinitionSet.load()
  let blockToDoc
  try {
    blockToDoc = definitions.findBlock({ definitionPath: `${blockPath}.js` })
  } catch (error) {
    throw new Error(`No block definition found for ${blockPath}`)
  }

  if(taskArgs[0] === "description") {
    const descriptionDocPath = fullBlockDocPath.replace(".md", ".description.md")
    console.log(`Generating block description doc at: ${descriptionDocPath}`)

    checkCanWriteFile(descriptionDocPath)
    writeFileSync(descriptionDocPath, blockToDoc.description)

  } else if(taskArgs[0] === "inputs") {
    const inputsDocPath = fullBlockDocPath.replace(".md", ".inputs.md")
    console.log(`Generating block input descriptions doc at: ${inputsDocPath}`)

    checkCanWriteFile(inputsDocPath)
    writeFileSync(inputsDocPath, blockToDoc.inputsToMarkdown())

  } else if(taskArgs[0] === "fields") {
    const fieldsDocPath = fullBlockDocPath.replace(".md", ".fields.md")
    console.log(`Generating block field descriptions doc at: ${fieldsDocPath}`)

    checkCanWriteFile(fieldsDocPath)
    writeFileSync(fieldsDocPath, blockToDoc.fieldsToMarkdown())

  } else if(taskArgs[0] && taskArgs[0] !== "force") {
    throw new Error(`Unknown documentation section: "${taskArgs[0]}"`)

  } else {
    console.log(`Generating block doc at: app/blocks/${blockPath}.md`)

    checkCanWriteFile(fullBlockDocPath)
    writeFileSync(fullBlockDocPath, blockToDoc.toMarkdown())

    console.log(`Wrote new block doc file to ${fullBlockDocPath}`)
  }
}
