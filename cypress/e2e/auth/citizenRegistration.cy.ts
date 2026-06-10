
describe('Citizen Registration', () => {


    beforeEach(() => {
        cy.intercept('GET', '**/admin/settings', {
          statusCode: 200,
          body: {
            success: true,
            data: {
              allowCitizenRegistration: true,
              supportEmail: 'support@civicfix.com'
            }
          }
        }).as('settings')
      })

  it('shows citizen registration form', () => {
    cy.visit('/register')
    cy.contains('Join as Citizen').click()
    cy.wait('@settings')
    cy.contains('Join as Citizen').should('be.visible')
    cy.contains('First Name').should('be.visible')
    cy.contains('label', 'Email').should('be.visible')
  })

  it('fills citizen registration form', () => {
    cy.visit('/register')
    cy.contains('Join as Citizen').click()
    cy.wait('@settings')
    cy.contains('Become a Volunteer').should('not.exist')
    cy.contains('First Name').parent().find('input').type('Arpita')
    cy.contains('Last Name').parent().find('input').type('Patiyal')
    cy.contains('Email').parent().find('input').type('arpita234patiyal@gmail.com')
    cy.contains('Address').parent().find('input').type('Vill Palampur')
    cy.contains('City').parent().find('input').type('Himachal')
    cy.contains('ZIP Code').parent().find('input').type('176061')
    cy.contains('Password').first().parent().find('input').type('Arpita12345!')
    cy.contains('Confirm Password').parent().find('input').type('Arpita12345!')
  })

  it('successful citizen registration', () => {
    cy.intercept('POST', '/api/auth/register/citizen', {
      statusCode: 200,
      body: { success: true }
    }).as('registerCitizen')
    cy.visit('/register')
    cy.contains('Join as Citizen').click()
    cy.wait('@settings')
    cy.contains('First Name').parent().find('input').type('Arpita')
    cy.contains('Last Name').parent().find('input').type('Patiyal')
    cy.contains('Email').parent().find('input').type('arpita234patiyal@gmail.com')
    cy.contains('Address').parent().find('input').type('Vill Palampur')
    cy.contains('City').parent().find('input').type('Himachal')
    cy.contains('ZIP Code').parent().find('input').type('176061')
    cy.contains('Password').first().parent().find('input').type('Arpita12345!')
    cy.contains('Confirm Password').parent().find('input').type('Arpita12345!')
    cy.get('input[id="agreeToTerms"]').check({ force: true })
    cy.contains('button', /create citizen account/i).click()
    cy.wait('@registerCitizen')
    cy.contains(/registration successful/i).should('be.visible')
  })

  it('shows error when email already exists', () => {
    cy.intercept('POST', '/api/auth/register/citizen', {
      statusCode: 409,
      body: { success: false, message: 'Email already registered' }
    }).as('citizenregistrationfailed')
    cy.visit('/register')
    cy.contains('Join as Citizen').click()
    cy.wait('@settings')
    cy.contains('First Name').parent().find('input').type('Arshdeep')
    cy.contains('Last Name').parent().find('input').type('Patiyal')
    cy.contains('Email').parent().find('input').type('adeepkaur727@gmail.com')
    cy.contains('Address').parent().find('input').type('Vill Palampur')
    cy.contains('City').parent().find('input').type('Himachal')
    cy.contains('ZIP Code').parent().find('input').type('176061')
    cy.contains('Password').first().parent().find('input').type('Arpita12345!')
    cy.contains('Confirm Password').parent().find('input').type('Arpita12345!')
    cy.get('input[id="agreeToTerms"]').check({ force: true })
    cy.contains('button', /create citizen account/i).click()
    cy.wait('@citizenregistrationfailed')
    cy.contains(/already registered/i).should('be.visible')
  })

  it('shows registration closed message', () => {
    cy.intercept('GET', '**/admin/settings', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          allowCitizenRegistration: false,
          supportEmail: 'support@civicfix.com'
        }
      }
    }).as('closedSettings')
  
    cy.visit('/register')
  
    cy.contains('Join as Citizen').click()
  
    cy.wait('@closedSettings')
  
    cy.contains('Citizen Registration is Temporarily Closed')
      .should('be.visible')
  })

  it('back to role selection works', () => {
    cy.visit('/register')
    cy.contains('Join as Citizen').click()
    cy.wait('@settings')
    cy.contains('Back to role selection').click()
    cy.contains('Create Your Account').should('be.visible')
  })

  it('sign in here goes to login', () => {
    cy.visit('/register')
    cy.contains('Join as Citizen').click()
    cy.wait('@settings')
    cy.contains('Sign in here').click()
    cy.url().should('include', '/login')
  })

})

