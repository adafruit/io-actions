import fs from 'fs'


export let totalBytesWritten = 0
// make a tiny DSL
export const
  cleanDir = (dirName) => {
    if(fs.existsSync(dirName)) {
      fs.rmSync(dirName, { recursive: true, force: true })
    }
    fs.mkdirSync(dirName, { recursive: true, force: true })
    console.log(`/${dirName}: clean`)
  },

  copyDir = (from, to) => {
    fs.cpSync(from, to, { recursive: true })
    console.log(`/${from}/* copied to /${to}/*`)
  },

  write = (filename, fileContents) => {
    const
      dirName = filename.split("/").slice(0, -1).join("/"),
      bytesToWrite = fileContents.length/1000

    // ensure dir is present before writing
    if(!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true })
    }

    fs.writeFileSync(filename, fileContents)

    console.log(`/${filename} (${bytesToWrite}k)`)
    totalBytesWritten += bytesToWrite
  }
