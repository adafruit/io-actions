import { describe, it } from 'node:test'
import { assert } from 'chai'
import { readFileSync } from 'node:fs'


// visual baselines only match when CI renders with the same Playwright image
// that e2e/docker.sh uses, and docker.sh derives its tag from package.json
describe("Playwright version", () => {
  it("CI uses the Playwright image matching package.json", () => {
    const
      { devDependencies } = JSON.parse(readFileSync('package.json')),
      version = devDependencies['@playwright/test'],
      workflow = readFileSync('.github/workflows/test.yml', 'utf8')

    assert.match(version, /^\d+\.\d+\.\d+$/, "@playwright/test must be pinned to an exact version")
    assert.include(workflow, `mcr.microsoft.com/playwright:v${version}-noble`)
  })
})
