describe("Block Images", () => {
  it("download all block images", () => {
    cy.visit("http://localhost:5173/")
    cy.get("[data-id^='block-type-']").each(($el) => {
      cy.wrap($el).rightclick({ force: true })
      cy.contains("Save Block as PNG...").click()
    }).then(blockElements => {
      cy.log(`Saved ${blockElements.length} block images.`)
    })
  })
})
