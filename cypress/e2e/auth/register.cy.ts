describe('Registration Page — Role Selection', () => {

  beforeEach(() => {
    cy.visit('/register');
  });

  it('shows both role cards', () => {
    cy.contains(/join as citizen/i).should('be.visible');
    cy.contains(/become.*volunteer/i).should('be.visible');
  });

  it('shows "Create Your Account" heading', () => {
    cy.contains(/create your account/i).should('be.visible');
  });

  it('shows sign in link', () => {
    cy.contains(/sign in here/i).should('be.visible');
    cy.contains('a', /sign in here/i).should('have.attr', 'href', '/login');
  });

  it('clicking Join as Citizen shows citizen registration form', () => {
    cy.contains('button', /join as citizen/i).click();

    cy.contains('button', /become.*volunteer/i).should('not.exist');

    cy.contains(/join as citizen/i).should('be.visible');
  });

  it('clicking Become Volunteer shows volunteer registration form', () => {
    cy.contains('button', /become.*volunteer/i).click();

    cy.contains('button', /join as citizen/i).should('not.exist');
    cy.contains(/volunteer.*registration|become.*volunteer/i).should('be.visible');
  });

  it('back button returns to role selection', () => {
    cy.contains('button', /join as citizen/i).click();

    cy.contains('button', /back.*role selection/i).click();

    cy.contains('button', /join as citizen/i).should('be.visible');
    cy.contains('button', /become.*volunteer/i).should('be.visible');
  });

  it('clicking sign in navigates to login page', () => {
    cy.contains(/sign in here/i).click();
    cy.url().should('include', '/login');
  });
});


describe('Citizen Registration', () => {

  const fillCitizenForm = (overrides: Record<string, string> = {}) => {
    const defaults = {
      firstName:       'Jaspreet',
      lastName:        'Kaur',
      email:           `testcitizen${Date.now()}@civicfix.com`,
      address:         '123 Main Street',
      city:            'Ludhiana',
      zipCode:         '141001',
      password:        'Test1234!',
      confirmPassword: 'Test1234!',
    };
    const data = { ...defaults, ...overrides };

    cy.get('input[placeholder="First Name"], input[placeholder*="first name" i]')
      .clear().type(data.firstName);
    cy.get('input[placeholder="Last Name"], input[placeholder*="last name" i]')
      .clear().type(data.lastName);
    cy.get('input[placeholder*="email" i]')
      .clear().type(data.email);
    cy.get('input[placeholder="123 Main Street"]')
      .clear().type(data.address);
    cy.get('input[placeholder="New York"]')
      .clear().type(data.city);
    cy.get('input[placeholder="10001"]')
      .clear().type(data.zipCode);
    cy.get('input[placeholder*="at least 8" i]')
      .clear().type(data.password);
    cy.get('input[placeholder*="confirm" i]')
      .clear().type(data.confirmPassword);

    cy.get('input[type="checkbox"]#agreeToTerms').check();
  };

  beforeEach(() => {
    cy.visit('/register');
    cy.contains('button', /join as citizen/i).click();
  });


  describe('rendering', () => {

    it('shows all required fields', () => {
      cy.get('input[placeholder="First Name"], input[placeholder*="first name" i]').should('exist');
      cy.get('input[placeholder="Last Name"], input[placeholder*="last name" i]').should('exist');
      cy.get('input[placeholder*="email" i]').should('exist');
      cy.get('input[placeholder="123 Main Street"]').should('exist');
      cy.get('input[placeholder="New York"]').should('exist');
      cy.get('input[placeholder="10001"]').should('exist');
      cy.get('input[placeholder*="at least 8" i]').should('exist');
      cy.get('input[placeholder*="confirm" i]').should('exist');
    });

    it('shows terms and conditions checkbox', () => {
      cy.get('input[type="checkbox"]').should('exist');
      cy.contains(/terms and conditions/i).should('be.visible');
    });

    it('shows Create Citizen Account button', () => {
      cy.contains('button', /create citizen account/i).should('be.visible');
    });
  });


  describe('validation', () => {

    it('shows errors when submitting empty form', () => {
      cy.contains('button', /create citizen account/i).click();

      cy.get('[role="alert"]').should('have.length.greaterThan', 0);
    });

    it('shows error when passwords do not match', () => {
      fillCitizenForm({ confirmPassword: 'DifferentPass123!' });
      cy.contains('button', /create citizen account/i).click();

      cy.contains(/passwords don't match|passwords do not match/i).should('be.visible');
    });

    it('shows error for password shorter than 8 characters', () => {
      fillCitizenForm({ password: 'short', confirmPassword: 'short' });
      cy.contains('button', /create citizen account/i).click();

      cy.contains(/at least 8 characters/i).should('be.visible');
    });

    it('shows error for invalid email format', () => {
      fillCitizenForm({ email: 'notanemail' });
      cy.contains('button', /create citizen account/i).click();

      cy.contains(/invalid email/i).should('be.visible');
    });

    it('shows error when terms are not agreed', () => {
      cy.get('input[placeholder="First Name"], input[placeholder*="first name" i]').type('Jaspreet');
      cy.get('input[placeholder="Last Name"], input[placeholder*="last name" i]').type('Kaur');
      cy.get('input[placeholder*="email" i]').type('test@test.com');
      cy.get('input[placeholder="123 Main Street"]').type('123 Main St');
      cy.get('input[placeholder="New York"]').type('Ludhiana');
      cy.get('input[placeholder="10001"]').type('141001');
      cy.get('input[placeholder*="at least 8" i]').type('Test1234!');
      cy.get('input[placeholder*="confirm" i]').type('Test1234!');

      cy.contains('button', /create citizen account/i).click();
      cy.contains(/agree to the terms/i).should('be.visible');
    });
  });


  describe('successful registration', () => {

    it('shows success screen after successful registration', () => {
      cy.intercept('POST', '/auth/register/citizen', {
        statusCode: 200,
        body: { success: true, message: 'Registration successful' },
      }).as('citizenRegister');

      fillCitizenForm();
      cy.contains('button', /create citizen account/i).click();

      cy.wait('@citizenRegister');

      cy.contains(/registration successful/i).should('be.visible');
    });

    it('shows verification email message after registration', () => {
      cy.intercept('POST', '/auth/register/citizen', {
        statusCode: 200,
        body: { success: true },
      }).as('citizenRegister');

      fillCitizenForm();
      cy.contains('button', /create citizen account/i).click();

      cy.wait('@citizenRegister');

      cy.contains(/verification email|check your inbox/i).should('be.visible');
    });

    it('shows loading state while submitting', () => {
      cy.intercept('POST', '/auth/register/citizen', (req) => {
        req.reply({ delay: 2000, statusCode: 200, body: { success: true } });
      }).as('slowRegister');

      fillCitizenForm();
      cy.contains('button', /create citizen account/i).click();

      cy.contains('button', /creating account/i).should('be.disabled');
    });

    it('Continue to Login button redirects to /login after success', () => {
      cy.intercept('POST', '/auth/register/citizen', {
        statusCode: 200,
        body: { success: true },
      }).as('citizenRegister');

      fillCitizenForm();
      cy.contains('button', /create citizen account/i).click();
      cy.wait('@citizenRegister');

      cy.contains('button', /continue to login/i).click();
      cy.url().should('include', '/login');
    });
  });


  describe('duplicate email error', () => {

    it('shows error when email already exists', () => {
      cy.intercept('POST', '/auth/register/citizen', {
        statusCode: 409,
        body: {
          success: false,
          message: 'Email already registered. Please login or use a different email.',
        },
      }).as('duplicateEmail');

      fillCitizenForm({ email: 'existing@civicfix.com' });
      cy.contains('button', /create citizen account/i).click();

      cy.wait('@duplicateEmail');
      cy.contains(/already registered/i).should('be.visible');
    });
  });
});


describe('Volunteer Registration', () => {

  const selectVolunteerRequirements = () => {
    cy.get('#skill-Cleaning').check({ force: true });
    cy.get('#availability-Weekends').check({ force: true });
    cy.get('#volunteerAgreeToTerms').check({ force: true });
  };

  const fillVolunteerForm = (overrides: Record<string, string> = {}) => {
    const data = {
      firstName: 'Arshdeep',
      lastName:  'Singh',
      email:     `testvolunteer${Date.now()}@civicfix.com`,
      password:  'Test1234!',
      confirmPassword: 'Test1234!',
      ...overrides,
    };

    cy.get('input[placeholder*="first name" i]').clear().type(data.firstName);
    cy.get('input[placeholder*="last name" i]').clear().type(data.lastName);
    cy.get('input[placeholder*="email" i]').clear().type(data.email);
    cy.get('input[placeholder*="at least 8" i]').clear().type(data.password);
    cy.get('input[placeholder*="confirm" i]').clear().type(data.confirmPassword);
  };

  beforeEach(() => {
    cy.visit('/register');
    cy.contains('button', /become.*volunteer/i).click();
  });


  describe('rendering', () => {
    it('shows volunteer specific heading', () => {
      cy.contains(/volunteer.*registration|become.*volunteer/i).should('be.visible');
    });

    it('shows skills section', () => {
      cy.contains(/skills/i).should('be.visible');
    });

    it('shows availability section', () => {
      cy.contains(/availability/i).should('be.visible');
    });

    it('shows experience level dropdown', () => {
      cy.contains(/experience level/i).should('be.visible');
      cy.get('select').should('exist');
    });
  });


  describe('skills selection', () => {

    it('can select at least one skill', () => {
      cy.get('#skill-Cleaning').check({ force: true });
      cy.get('#skill-Cleaning').should('be.checked');
    });

    it('shows error when no skill is selected on submit', () => {
      cy.intercept('POST', '/auth/register/volunteer').as('volRegister');

      fillVolunteerForm();

      cy.get('select').select('beginner');

      cy.contains('button', /register.*volunteer|create.*volunteer|submit/i).click();

      cy.contains(/at least one skill/i).should('be.visible');
    });
  });


  describe('availability selection', () => {

    it('can select availability slots', () => {
      cy.get('#availability-Weekends').check({ force: true });
      cy.get('#availability-Weekends').should('be.checked');
    });

    it('shows error when no availability is selected', () => {
      fillVolunteerForm();
      cy.get('select').select('beginner');
      cy.get('#skill-Cleaning').check({ force: true });

      cy.contains('button', /register.*volunteer|submit/i).click();
      cy.contains(/at least one availability/i).should('be.visible');
    });
  });

  describe('experience level', () => {

    it('can select experience level from dropdown', () => {
      cy.get('select').select('intermediate');
      cy.get('select').should('have.value', 'intermediate');
    });

    it('has all three options — beginner, intermediate, expert', () => {
      cy.get('select').within(() => {
        cy.contains('Beginner').should('exist');
        cy.contains('Intermediate').should('exist');
        cy.contains('Expert').should('exist');
      });
    });
  });

  describe('successful registration', () => {

    it('shows pending approval message after volunteer registration', () => {
      cy.intercept('POST', '/auth/register/volunteer', {
        statusCode: 201,
        body: {
          success: true,
          message: 'Registration successful! Your application has been submitted for admin approval.',
          data: { approvalStatus: 'pending' },
        },
      }).as('volunteerRegister');

      fillVolunteerForm();
      cy.get('select').select('beginner');
      selectVolunteerRequirements();

      cy.contains('button', /register.*volunteer|create.*volunteer|submit/i).click();

      cy.wait('@volunteerRegister');

      cy.contains(/submitted.*approval|pending.*approval|admin.*review/i).should('be.visible');
    });
  });

  describe('registration closed', () => {

    it('shows closed message when volunteer registration is disabled', () => {
      cy.intercept('POST', '/auth/register/volunteer', {
        statusCode: 403,
        body: {
          success: false,
          message: 'Volunteer registration is currently closed. Please contact support.',
        },
      }).as('closedRegister');

      fillVolunteerForm();
      cy.get('select').select('beginner');
      selectVolunteerRequirements();

      cy.contains('button', /register.*volunteer|submit/i).click();
      cy.wait('@closedRegister');

      cy.contains(/registration is currently closed/i).should('be.visible');
    });
  });

  describe('duplicate email', () => {

    it('shows specific error when email already exists as citizen', () => {
      cy.intercept('POST', '/auth/register/volunteer', {
        statusCode: 409,
        body: {
          success: false,
          message: 'Email already registered as citizen. Please login with citizen account.',
        },
      }).as('citizenEmailError');

      fillVolunteerForm({ email: 'existingcitizen@test.com' });
      cy.get('select').select('beginner');
      selectVolunteerRequirements();

      cy.contains('button', /register.*volunteer|submit/i).click();
      cy.wait('@citizenEmailError');

      cy.contains(/already registered as citizen/i).should('be.visible');
    });
  });
});