
describe('Registration Page', () => {

    beforeEach(() => {
      cy.intercept('GET', '**/admin/settings', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            allowVolunteerRegistration: true,
            supportEmail: 'support@civicfix.com'
          }
        }
      }).as('settings')
    })
  
    it('clicking Become Volunteer shows volunteer form', () => {
      cy.visit('/register')
      cy.contains('Become Volunteer').click()
      cy.wait('@settings')
      cy.contains('Become a Volunteer').should('be.visible')
      cy.contains('Skills').should('be.visible')
      cy.contains('Availability').should('be.visible')
    })
  
    it('fills volunteer registration form', () => {
      cy.visit('/register')
      cy.contains('Become Volunteer').click()
      cy.wait('@settings')
      cy.contains('Become a Volunteer').should('be.visible')
      cy.contains('First Name').parent().find('input').type('Arshdeep')
      cy.contains('Last Name').parent().find('input').type('Kaur')
      cy.contains('Email').parent().find('input').type('arsh1234deep@gmail.com')
      cy.get('input[id="skill-Cleaning"]').check({ force: true })
      cy.get('input[id="availability-Weekdays"]').check({ force: true })
      cy.get('select').select('beginner')
      cy.contains('Password').first().parent().find('input').type('Arsh1234!')
      cy.contains('Confirm Password').parent().find('input').type('Arsh1234!')
    })
  
    it('successful volunteer registration', () => {
      cy.intercept('POST', '/api/auth/register/volunteer', {
        statusCode: 200,
        body: { success: true }
      }).as('registerVolunteer')
  
      cy.visit('/register')
      cy.contains('Become Volunteer').click()
      cy.wait('@settings')
      cy.contains('Become a Volunteer').should('be.visible')
      cy.contains('First Name').parent().find('input').type('Arshdeep')
      cy.contains('Last Name').parent().find('input').type('Kaur')
      cy.contains('Email').parent().find('input').type('arsh1234deep@gmail.com')
      cy.get('input[id="skill-Cleaning"]').check({ force: true })
      cy.get('input[id="availability-Weekdays"]').check({ force: true })
      cy.get('select').select('beginner')
      cy.contains('Password').first().parent().find('input').type('Arsh1234!')
      cy.contains('Confirm Password').parent().find('input').type('Arsh1234!')
      cy.get('input[id="volunteerAgreeToTerms"]').check({ force: true })
      cy.contains('button', /become a volunteer/i).click()
      cy.wait('@registerVolunteer')
      cy.contains('Application Submitted!').should('be.visible')
    })
    it('shows registration closed message', () => {
      cy.intercept('GET', '**/admin/settings', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            allowVolunteerRegistration: false,
            supportEmail: 'support@civicfix.com'
          }
        }
      }).as('closedSettings')
    
      cy.visit('/register')
    
      cy.contains('Become Volunteer').click()
    
      cy.wait('@closedSettings')
    
      cy.contains('Volunteer Applications are Temporarily Closed')
        .should('be.visible')
    })
    it('back to role selection works', () => {
      cy.visit('/register')
      cy.contains('Become Volunteer').click()
      cy.wait('@settings')
      cy.contains('Become a Volunteer').should('be.visible')
      cy.contains('Back to role selection').click()
      cy.contains('Create Your Account').should('be.visible')
    })
  
  })
  
  