import { dirname } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { createHash } from 'crypto'

import { map } from 'lodash-es'


const getStringHash = stringToHash => {
  const hash = createHash('sha256')
  hash.update(stringToHash)
  return hash.digest('hex')
}

const getFileHash = filePath => {
  if(!existsSync(filePath)) { return '' }
  return getStringHash(readFileSync(filePath))
}

export const
  niceTemplate = tplString => {
    const
      lines = tplString.split("\n"),
      firstLineBlank = /^\s*$/.test(lines[0]),
      remainingLines = lines.slice(1, -1),
      indentCounts = map(remainingLines, line => line.search(/\S/)),
      firstLineLeastIndented = indentCounts[0] >= Math.min(...indentCounts)

    // ensure first line is blank and every other line has at least as much whitespace as the first line
    if(firstLineBlank && firstLineLeastIndented) {
      // drop the first line, remove X whitespace chars from the rest and join with newline
      return map(remainingLines, line => line.slice(indentCounts[0])).join("\n")
    }

    // TODO: support niceties for markdown, double-newlines, escaping, etc

    return tplString
  },

  writeFileIfDifferent = (filename, content) => {
    const
      fileHash = getFileHash(filename),
      contentHash = getStringHash(content)

    if(fileHash !== contentHash) {
      console.log("writing", filename)
      mkdirSync(dirname(filename), { recursive: true })
      writeFileSync(filename, content)
    }
  }
