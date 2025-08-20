describe("Block Images", () => {
  it("download all block images", () => {
    cy.visit("http://localhost:5173/")

    // any extra setup to do before taking screenshots
    cy.window().then(win => {
      // disable the weather block's automatic disabling behavior
      const weatherBlock = win.blocklyWorkspace.getBlockById('block-type-weather')
      weatherBlock.autoDisable = false
      // enable it
      weatherBlock.setEnabled(true)
    })

    cy.get("[data-id^='block-type-']").each(($el) => {
      cy.wrap($el).rightclick({ force: true })
      cy.contains("Save Block as PNG...").click()
    }).then(blockElements => {
      cy.log(`Saved ${blockElements.length} block images.`)
    })
  })
})
