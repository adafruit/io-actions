describe("Block Images", () => {
  it("download all block images", () => {
    cy.visit("http://localhost:5173/")

    // any extra setup to do before taking screenshots
    cy.window().then(win => {
      const autoDisableBlockTypes = [ 'weather', 'air_quality' ]
      autoDisableBlockTypes.forEach(blockType => {
        // look up the block in the workspace
        const blockToEnable = win.blocklyWorkspace.getBlockById(`block-type-${blockType}`)
        // disable the auto-disable behavior
        blockToEnable.autoDisable = false
        // enable the block
        blockToEnable.setEnabled(true)
        // ready to take a picture now
      })
    })

    cy.get("[data-id^='block-type-']").each(($el) => {
      cy.wrap($el).rightclick({ force: true })
      cy.contains("Save Block as PNG...").click()
    }).then(blockElements => {
      cy.log(`Saved ${blockElements.length} block images.`)
    })
  })
})
