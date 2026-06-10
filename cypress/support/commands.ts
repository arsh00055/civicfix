/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsCitizen(email?: string, password?: string): Chainable<void>;
      loginAsVolunteer(email?: string, password?: string): Chainable<void>;
      loginAsAdmin(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginAsCitizen', (
  email = Cypress.env('CITIZEN_EMAIL') || 'testcitizen@civicfix.com',
  password = Cypress.env('CITIZEN_PASSWORD') || 'Test1234!'
) => {
  cy.request('POST', '/api/auth/login', { email, password, role: 'citizen' })
    .then((response) => {
      const token = response.body?.data?.token || response.body?.token
      const user = response.body?.data?.user || response.body?.user
      if (token) {
        window.localStorage.setItem('auth_token', token)
        window.localStorage.setItem('user_data', JSON.stringify(user))
      }
    })
})

Cypress.Commands.add('loginAsVolunteer', (
  email = Cypress.env('VOLUNTEER_EMAIL') || 'testvolunteer@civicfix.com',
  password = Cypress.env('VOLUNTEER_PASSWORD') || 'Test1234!'
) => {
  cy.request('POST', '/api/auth/login', { email, password, role: 'volunteer' })
    .then((response) => {
      const token = response.body?.data?.token || response.body?.token
      const user = response.body?.data?.user || response.body?.user
      if (token) {
        window.localStorage.setItem('auth_token', token)
        window.localStorage.setItem('user_data', JSON.stringify(user))
      }
    })
})

Cypress.Commands.add('loginAsAdmin', (
  email = Cypress.env('ADMIN_EMAIL') || 'testadmin@civicfix.com',
  password = Cypress.env('ADMIN_PASSWORD') || 'Admin1234!'
) => {
  cy.request('POST', '/api/auth/login', { email, password, role: 'admin' })
    .then((response) => {
      const token = response.body?.data?.token || response.body?.token
      const user = response.body?.data?.user || response.body?.user
      if (token) {
        window.localStorage.setItem('auth_token', token)
        window.localStorage.setItem('user_data', JSON.stringify(user))
      }
    })
})

Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})

export {}
