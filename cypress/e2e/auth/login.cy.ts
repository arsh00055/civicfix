import { getCitizenCredentials } from '../../support/credentials';

describe('Citizen Login', () => {
    beforeEach(() => {
        cy.visit('/login');
        cy.contains('button', 'Citizen').click();
    })

    describe('page rendering', () => {
        it('shows the email and password fields', () => {
            cy.get('input[placeholder="Enter your email"]').should('be.visible');
            cy.get('input[placeholder="Enter your password"]').should('be.visible');
        })

        it('shows the Sign In button', () => {
            cy.contains('button', /Sign in as Citizen/i).should('be.visible');
        });

        it('shows a link to register', () => {
            cy.contains(/Sign up/i).should('exist');
        });

        it('shows forgot password link', () => {
            cy.contains(/forgot password?/i).should('be.visible');
        });
    })

    describe('validation', () => {
        it('shows error when submitting with empty email', () => {
            cy.contains('button', /sign in/i).click();
            cy.contains(/Email is required.|required.*email/i).should('be.visible');
        });

        it('shows error when submitting with empty password', () => {
            cy.get('input[placeholder="Enter your email"]')
            .type('jaspreet@test.com');
            cy.contains('button', /sign in/i).click();
            cy.contains(/Password is required.|required.*password/i).should('be.visible');
        });

        it('does not submit when fields are empty', () => {
            let loginRequestMade = false;
            cy.intercept('POST', '/api/auth/login', () => {
                loginRequestMade = true;
            });
            cy.contains('button', /sign in/i).click();
            cy.contains(/Email is required.|required.*email/i).should('be.visible');
            cy.then(() => {
                expect(loginRequestMade, 'login API should not be called').to.be.false;
            });
        });
    })

    describe('password visibility toggle', () => {
        it('password is hidden by default', () => {
            cy.get('input[placeholder="Enter your password"]')
            .should('have.attr', 'type', 'password');
        });

        it('clicking show/hide toggles the input type', () => {
            cy.get('input[placeholder="Enter your password"]').as('passwordField');
            cy.get('button[aria-label*="password" i], button[title*="password" i]')
            .first()
            .click();
            cy.get('@passwordField').should('have.attr', 'type', 'text');
            cy.get('button[aria-label*="password" i], button[title*="password" i]')
            .first()
            .click();
    
            cy.get('@passwordField').should('have.attr', 'type', 'password');
        });
    })

    describe('successful login', () => {
        it('logs in with valid credentials and redirects to dashboard', () => {
            const { email, password } = getCitizenCredentials();
            cy.intercept('POST', '/api/auth/login').as('loginRequest');
    
            cy.get('input[placeholder="Enter your email"]')
            .type(email);
    
            cy.get('input[placeholder="Enter your password"]')
            .type(password, { log: false });
    
            cy.contains('button', /sign in/i).click();
    
            cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
    
            cy.url().should('match', /\/(dashboard|citizen)?$/);

            cy.contains(/welcome/i).should('be.visible');
        });

        it('stores auth token in localStorage after login', () => {
            const { email, password } = getCitizenCredentials();
            cy.intercept('POST', '/api/auth/login').as('loginRequest');
    
            cy.get('input[placeholder="Enter your email"]').type(email);
            cy.get('input[placeholder="Enter your password"]').type(password, { log: false });
            cy.contains('button', /sign in/i).click();
    
            cy.wait('@loginRequest');

            cy.window().then((win) => {
            const token = win.localStorage.getItem('auth_token');
            expect(token).to.not.be.null;
            expect(token?.length).to.be.greaterThan(10);
            });
        });

        it('stub login — tests UI without real API call', () => {
            const testEmail = 'citizen@example.com';
            const testPassword = 'Test1234!';
            cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                token: 'fake-jwt-token-for-testing',
                user: {
                    id: 'test-user-1',
                    name: 'Test Citizen',
                    email: testEmail,
                    role: 'citizen',
                },
                },
            },
            }).as('stubbedLogin');
    
            cy.get('input[placeholder="Enter your email"]').type(testEmail);
            cy.get('input[placeholder="Enter your password"]').type(testPassword, { log: false });
            cy.contains('button', /sign in as citizen/i).click();
    
            cy.wait('@stubbedLogin');
            cy.url().should('not.include', '/login');
        });
    })

    describe('failed login', () => {
        it('shows error when credentials are wrong', () => {
            cy.intercept('POST', '/api/auth/login', {
            statusCode: 200, 
            body: {
                success: false,
                message: 'Incorrect password. Please try again.',
                code: 'INCORRECT_PASSWORD',
            },
            }).as('failedLogin');
    
            cy.get('input[placeholder="Enter your email"]').type('wrong@test.com');
            cy.get('input[placeholder="Enter your password"]').type('wrongpassword');
            cy.contains('button', /sign in as citizen/i).click();
    
            cy.wait('@failedLogin');
    
            cy.contains(/incorrect password/i).should('be.visible');
    
            cy.url().should('include', '/login');
        });

        it('shows error when account not found', () => {
            cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: {
                success: false,
                message: 'No account found with this email. Please sign up first.',
                code: 'ACCOUNT_NOT_FOUND',
            },
            }).as('notFoundLogin');
    
            cy.get('input[placeholder="Enter your email"]').type('nobody@test.com');
            cy.get('input[placeholder="Enter your password"]').type('Test1234!');
            cy.contains('button', /sign in/i).click();
    
            cy.wait('@notFoundLogin');
            cy.contains(/no account found/i).should('be.visible');
        });

        it('shows loading state while request is in flight', () => {
            cy.intercept('POST', '/api/auth/login', (req) => {
            req.reply({ delay: 2000, statusCode: 200, body: { success: false } });
            }).as('slowLogin');
    
            cy.get('input[placeholder="Enter your email"]').type('test@test.com');
            cy.get('input[placeholder="Enter your password"]').type('Test1234!');
            cy.contains('button', /sign in as citizen/i).click();
    
            cy.contains('button', /Signing in...|loading/i).should('be.disabled');
        });
    })

    describe('navigation', () => {
    
        it('clicking forgot password goes to forgot-password page', () => {
        cy.contains(/forgot password/i).click();
        cy.url().should('include', '/forgot-password');
        });
    
        it('clicking register/signup goes to register page', () => {
        cy.contains(/sign up|register|create.*account/i).click();
        cy.url().should('include', '/register');
        });
    });
});

describe('Volunteer Login', () => {
 
    beforeEach(() => {
      cy.visit('/login');
      cy.contains('button', /volunteer/i).click();
    });
   
    it('shows Volunteer Login heading', () => {
      cy.contains(/volunteer login/i).should('be.visible');
    });
   
    it('shows Apply to be a Volunteer button', () => {
      cy.contains(/apply.*volunteer|become.*volunteer/i).should('be.visible');
    });
   
    it('shows pending approval message for unapproved volunteer', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 403,
        body: {
          success: false,
          message: 'Your account is pending admin approval. You will receive an email once approved.',
          code: 'ACCOUNT_PENDING_APPROVAL',
        },
      }).as('pendingLogin');
   
      cy.get('input[placeholder="Enter your email"]').type('pending@test.com');
      cy.get('input[placeholder="Enter your password"]').type('Test1234!');
      cy.contains('button', /sign in as volunteer/i).click();
   
      cy.wait('@pendingLogin');
   
      cy.contains(/pending admin approval/i).should('be.visible');
   
      cy.contains(/check your email/i).should('be.visible');
    });
   
    it('shows rejection message and contact support button for rejected volunteer', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 403,
        body: {
          success: false,
          message: 'Your volunteer application has been rejected. Please contact support.',
          code: 'ACCOUNT_REJECTED',
        },
      }).as('rejectedLogin');
   
      cy.get('input[placeholder="Enter your email"]').type('rejected@test.com');
      cy.get('input[placeholder="Enter your password"]').type('Test1234!');
      cy.contains('button', /sign in as volunteer/i).click();
   
      cy.wait('@rejectedLogin');
   
      cy.contains(/rejected/i).should('be.visible');
      cy.contains('button', /contact support/i).should('be.visible');
    });
   
    it('successful volunteer login redirects to volunteer dashboard', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            token: 'fake-volunteer-token',
            user: { id: 'vol-1', name: 'Test Volunteer', email: 'volunteer@example.com', role: 'volunteer' },
          },
        },
      }).as('volunteerLogin');
   
      cy.get('input[placeholder="Enter your email"]').type('volunteer@example.com');
      cy.get('input[placeholder="Enter your password"]').type('Test1234!', { log: false });
      cy.contains('button', /sign in as volunteer/i).click();
   
      cy.wait('@volunteerLogin');
      cy.url().should('match', /volunteer|dashboard/);
    });
   
    it('clicking Apply to be a Volunteer navigates to register page', () => {
      cy.contains(/apply.*volunteer|become.*volunteer/i).click();
      cy.url().should('include', '/register');
    });
  });