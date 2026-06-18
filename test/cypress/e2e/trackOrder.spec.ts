function suppressUncaughtException () {
  return false
}

function verifyAlertContent (t: string) {
  expect(t).to.equal('xss')
}

describe('/#/track-order', () => {
  describe('challenge "reflectedXss"', () => {
    // Cypress alert bug
    xit('Order Id should be susceptible to reflected XSS attacks', () => {
      cy.task('isDocker').then((isDocker) => {
        if (!isDocker) {
          cy.on('uncaught:exception', suppressUncaughtException)

          cy.visit('/#/track-result')
          cy.visit('/#/track-result?id=<iframe src="javascript:alert(`xss`)">')
          cy.reload()

          cy.on('window:alert', verifyAlertContent)

          cy.expectChallengeSolved({ challenge: 'Reflected XSS' })
        }
      })
    })
  })
})
