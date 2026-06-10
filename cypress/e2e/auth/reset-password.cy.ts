describe('Reset Password Page', () => {

    beforeEach(() => {
      cy.clearLocalStorage()
      cy.clearCookies()
    })
  
    it('shows invalid token message when token is wrong', () => {
      cy.intercept('GET', '/api/auth/validate-reset-token*', {
        statusCode: 200,
        body: { valid: false }
      }).as('validateToken')
      cy.visit('/reset-password/invalid-token-123')
      cy.wait('@validateToken')
      cy.contains('Invalid Reset Link').should('be.visible')
      cy.contains('Request New Link').should('be.visible')
    })
  
    it('shows reset form when token is valid', () => {
      cy.intercept('GET', '/api/auth/validate-reset-token*', {
        statusCode: 200,
        body: { valid: true }
      }).as('validateToken')
      cy.visit('/reset-password/valid-token-123')
      cy.wait('@validateToken')
      cy.get('input[placeholder="Enter new password"]').should('be.visible')
      cy.get('input[placeholder="Confirm new password"]').should('be.visible')
      cy.contains('button', 'Reset Password').should('be.visible')
    })
  
    it('shows password rules when typing', () => {
      cy.intercept('GET', '/api/auth/validate-reset-token*', {
        statusCode: 200,
        body: { valid: true }
      }).as('validateToken')
      cy.visit('/reset-password/valid-token-123')
      cy.wait('@validateToken')
      cy.get('input[placeholder="Enter new password"]').type('weak')
      cy.contains(' One uppercase letter (A-Z)').should('be.visible')
      cy.contains('One number (0-9)').should('be.visible')
      cy.contains('One special character (@$!%*?&)').should('be.visible')
    })
  
    it('shows error when passwords do not match', () => {
      cy.intercept('GET', '/api/auth/validate-reset-token*', {
        statusCode: 200,
        body: { valid: true }
      }).as('validateToken')
      cy.visit('/reset-password/valid-token-123')
      cy.wait('@validateToken')
      cy.get('input[placeholder="Enter new password"]').type('Password123!')
      cy.get('input[placeholder="Confirm new password"]').type('Different123!')
      cy.contains('Passwords do not match').should('be.visible')
    })
  
    it('shows success after password reset', () => {
      cy.intercept('GET', '/api/auth/validate-reset-token*', {
        statusCode: 200,
        body: { valid: true }
      }).as('validateToken')
      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 200,
        body: { success: true }
      }).as('resetPassword')
      cy.visit('/reset-password/valid-token-123')
      cy.wait('@validateToken')
      cy.get('input[placeholder="Enter new password"]').type('Password123!')
      cy.get('input[placeholder="Confirm new password"]').type('Password123!')
      cy.contains('button', 'Reset Password').click()
      cy.wait('@resetPassword')
      cy.contains('Password Reset Successful!').should('be.visible')
    })
  
    it('Request New Link goes to forgot-password', () => {
      cy.intercept('GET', '/api/auth/validate-reset-token*', {
        statusCode: 200,
        body: { valid: false }
      }).as('validateToken')
      cy.visit('/reset-password/bad-token')
      cy.wait('@validateToken')
      cy.contains('Request New Link').click()
      cy.url().should('include', '/forgot-password')
    })
  
    it('Back to Login link works', () => {
      cy.intercept('GET', '/api/auth/validate-reset-token*', {
        statusCode: 200,
        body: { valid: true }
      }).as('validateToken')
      cy.visit('/reset-password/valid-token-123')
      cy.wait('@validateToken')
      cy.contains('Back to Login').click()
      cy.url().should('include', '/login')
    })
  
  })
  
  