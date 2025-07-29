describe("Block Images", () => {
  it("download all block images", () => {
    cy.visit("http://localhost:5173/")
    cy.get("[data-id]").each(($el) => {
      cy.wrap($el).rightclick({ force: true })
      cy.contains("Save Block as PNG...").click()
    })
  })
})
