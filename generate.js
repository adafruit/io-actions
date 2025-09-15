import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, cpSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'

import DefinitionSet from '#src/definitions/definition_set.js'
import toBlockMarkdown from "#src/docs/render_block.js"


const
  BLOCK_PATH_REGEX = /((\w\/)+)\w+/gm,
  USAGE = `Usage: node generate.js [block|doc] [path/to/block_name]`,

  toGenerate = process.argv[2],
  blockPath = process.argv[3],
  taskArgs = process.argv.slice(4),

  usageError = (msg) => {
    throw new Error(`Generator Error: ${msg}\n${USAGE}`)
  }

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

const
  blockType = blockPath.split("/").at(-1),
  blockName = blockType.split("_").map(path => path.slice(0,1).toUpperCase() + path.slice(1)).join(" "),
  parentDir = `app/blocks/${blockPath.split("/").slice(0,-1).join("/")}`,
  fullBlockPath = `app/blocks/${blockPath}.js`,
  fullBlockDocPath = `app/blocks/${blockPath}.md`

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
  console.log(`Generating block doc at: app/blocks/${blockPath}.md`)

  if(!existsSync(fullBlockPath)) {
    throw new Error(`Cannot generate doc: block must exist at ${fullBlockPath}, first.`)
  }

  if(existsSync(fullBlockDocPath) && !taskArgs.includes("force")) {
    console.log(taskArgs)
    throw new Error(`Cannot generate doc: file already exists at ${fullBlockDocPath}. Add "force" to the ovewrite the existing file.`)
  }

  // load the definitions
  const definitions = await DefinitionSet.load()
  let blockToDoc
  try {  
    blockToDoc = definitions.findBlock({ definitionPath: `${blockPath}.js` })
  } catch (error) { 
    throw new Error(`No block definition found for ${blockPath}`)
  }

  writeFileSync(fullBlockDocPath, toBlockMarkdown(blockToDoc)) 

  console.log(`Wrote new block doc file to ${fullBlockDocPath}`)
}
