
describe('Forgot Password Page', () => {

    beforeEach(() => {
      cy.clearLocalStorage()
      cy.clearCookies()
      cy.visit('/forgot-password')
    })
  
    it('shows forgot password form', () => {
      cy.contains('Forgot Password?').should('be.visible')
      cy.get('input[placeholder="Enter your registered email"]').should('be.visible')
      cy.contains('Send Reset Link').should('be.visible')
      cy.contains('Back to Login').should('be.visible')
    })
  
    it('shows error when email is empty', () => {
      cy.contains('Send Reset Link').click()
      cy.contains('Please enter your email address').should('be.visible')
    })
    it('shows error when email format is invalid', () => {
      cy.get('input[placeholder="Enter your registered email"]').type('notanemail.com')
      cy.contains('Send Reset Link').click()
      // browser ka message check karo
      cy.get('input[placeholder="Enter your registered email"]')
        .invoke('prop', 'validationMessage')
        .should('include', '@')
    })
    it('shows success screen after valid email submitted', () => {
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 200,
        body: { success: true }
      }).as('forgotPassword')
      cy.get('input[type="email"]').type('arsh123@gmail.com')
      cy.contains('Send Reset Link').click()
      cy.wait('@forgotPassword')
      cy.contains('Check Your Email!').should('be.visible')
    })
  
    it('shows loading state while submitting', () => {
      cy.intercept('POST', '/api/auth/forgot-password', (req) => {
        req.reply({ delay: 2000, statusCode: 200, body: { success: true } })
      }).as('slowRequest')
      cy.get('input[type="email"]').type('test@civicfix.com')
      cy.contains('Send Reset Link').click()
      cy.contains('Sending...').should('be.visible')
      cy.contains('button', 'Sending...').should('be.disabled')
    })
  
    it('shows error when server fails', () => {
      cy.clearLocalStorage()
      cy.clearCookies()
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 500,
        body: { success: false, message: 'Server error' }
      }).as('serverError')
      cy.visit('/forgot-password')
      cy.get('input[type="email"]').type('test@civicfix.com')
      cy.contains('Send Reset Link').click()
      cy.wait('@serverError')
      cy.contains(/server error/i).should('be.visible')
    })
  
    it('back to login link works', () => {
      cy.contains('Back to Login').click()
      cy.url().should('include', '/login')
    })
  
    it('Return to Login button works after success', () => {
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 200,
        body: { success: true }
      }).as('forgotPassword')
      cy.get('input[type="email"]').type('test@civicfix.com')
      cy.contains('Send Reset Link').click()
      cy.wait('@forgotPassword')
      cy.contains('button', 'Return to Login').click()
      cy.url().should('include', '/login')
    })
  
  })
  
  