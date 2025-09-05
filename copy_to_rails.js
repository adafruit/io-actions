import { env, exit } from "node:process"
import { existsSync, cpSync } from "node:fs"
import { join } from 'node:path'


console.log("Starting copy app to io-rails")

// fetch the rails location env var
const
  railsLocation = env["IO_RAILS_LOCATION"],
  blocklyExportPath = "app/javascript/src/views/Actions/blockly-export",
  fullPath = join(railsLocation || "", blocklyExportPath)

if(!railsLocation) {
  console.error("Oops, please set the $IO_RAILS_LOCATION env to the location of io-rails on your system and try again.")
  console.error("A .env file is supported so you can set this once and forget it, try this:")
  console.error(`$ echo "IO_RAILS_LOCATION=/home/username/path/to/io-rails" > .env`)
  exit(1)
}

console.log(`Checking IO Rails location: ${railsLocation}`)

// check it goes to a valid location, raise helpful error
if(!existsSync(fullPath)) {
  console.error(`Did not find a blockly export directory at: ${fullPath}`)
  exit(1)
}

// do the copy
cpSync("export", fullPath, { recursive: true })

console.log("Done.")

