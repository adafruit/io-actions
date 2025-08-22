
import process from 'node:process'
import { exec, execSync, spawnSync, spawn } from 'node:child_process'
import { promisify } from 'node:util'


const execAsync = promisify(exec)

// run a clean build, wait for it to complete
console.log("Building docs from scratch...")
spawnSync("node", ["export.js", "docs", "skipImages"], { stdio: 'inherit' })
console.log("Done")

// start the incremental build
console.log("Starting incremental builder and file watcher...")
const docBuilder = spawn("node", ["--watch-path=./app", "export.js", "docs-incremental"], { stdio: 'inherit' })
docBuilder.on('error', err => console.log('Builder Error:', err))
docBuilder.on('exit', code => console.log('Builder Exited', code === 0 ? "Cleanly" : `With Error Code ${code}`))

// start the docs server
console.log("Starting Vitepress docs server...")
const docServer = spawn("npm", ["run", "docs:dev"], { stdio: 'inherit' })
docServer.on('error', err => console.log('Server Error:', err))
docServer.on('exit', code => console.log('Server Exited', code === 0 ? "Cleanly" : `With Error Code ${code}`))

const killAll = () => {
  console.log('Shutting down...')
  docBuilder.kill()
  docServer.kill()
  process.exit()
}

// if either one exits, kill the other
console.log("Watching files for changes and servers for crashes")
docServer.on('exit', killAll)
docBuilder.on('exit', killAll)
