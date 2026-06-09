export {};

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsCitizen(email?: string, password?: string): Chainable<void>;
      loginAsVolunteer(email?: string, password?: string): Chainable<void>;
      loginAsAdmin(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      seedIssue(issueData?: Partial<{
        title: string;
        description: string;
        category: string;
        priority: string;
        location: string;
      }>): Chainable<string>;
    }
  }
}

// ── Shared login helper ────────────────────────────────────────────────────────
function doLogin(email: string, password: string, role: string, securityKey?: string) {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password, role, securityKey },
    failOnStatusCode: false, // so we can log the body on failure
  }).then((response) => {
    // Log full body for debugging — remove once stable
    cy.log('LOGIN RESPONSE', JSON.stringify(response.body));

    expect(response.status, `Login as ${role} failed with status ${response.status}`).to.eq(200);

    // Handle both response shapes:
    //   Shape A: { data: { token, user } }   ← original assumption
    //   Shape B: { token, user }              ← what the API actually returns
    const body = response.body;
    const token: string = body?.data?.token ?? body?.token;
    const user: object  = body?.data?.user  ?? body?.user;

    if (!token) {
      throw new Error(
        `loginAs${role}: No token found in response. Body was: ${JSON.stringify(body)}`
      );
    }

    window.localStorage.setItem('auth_token', token);
    window.localStorage.setItem('user_data', JSON.stringify(user));

    // Stub /api/auth/me so useAuth() resolves without a real network call
    // This must be set up AFTER login so the user object is available
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: { success: true, data: user },
    }).as('getAuthMe');
  });
}

// ── loginAsCitizen ─────────────────────────────────────────────────────────────
Cypress.Commands.add('loginAsCitizen', (
  email    = Cypress.env('CITIZEN_EMAIL')   as string,
  password = Cypress.env('CITIZEN_PASSWORD') as string,
) => {
  if (!email || !password) {
    throw new Error('Missing credentials. Set CITIZEN_EMAIL and CITIZEN_PASSWORD in cypress.env.json');
  }
  doLogin(email, password, 'citizen');
});

// ── loginAsVolunteer ───────────────────────────────────────────────────────────
Cypress.Commands.add('loginAsVolunteer', (
  email    = Cypress.env('VOLUNTEER_EMAIL')   as string,
  password = Cypress.env('VOLUNTEER_PASSWORD') as string,
) => {
  if (!email || !password) {
    throw new Error('Missing credentials. Set VOLUNTEER_EMAIL and VOLUNTEER_PASSWORD in cypress.env.json');
  }
  doLogin(email, password, 'volunteer');
});

// ── loginAsAdmin ───────────────────────────────────────────────────────────────
Cypress.Commands.add('loginAsAdmin', (
  email    = Cypress.env('ADMIN_EMAIL')   as string,
  password = Cypress.env('ADMIN_PASSWORD') as string,
  securityKey = Cypress.env('ADMIN_SECURITY_KEY') as string,
) => {
  if (!email || !password) {
    throw new Error('Missing credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD in cypress.env.json');
  }
  doLogin(email, password, 'admin', securityKey );
});

// ── logout ─────────────────────────────────────────────────────────────────────
Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  // Stub auth/me to return 401 so useAuth() sees no user
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 401,
    body: { success: false, message: 'Not authenticated' },
  }).as('getAuthMeUnauth');
});

// ── seedIssue ──────────────────────────────────────────────────────────────────
Cypress.Commands.add('seedIssue', (issueData = {}) => {
  const defaults = {
    title:       'Test Pothole on Main Street',
    description: 'Large pothole causing traffic issues near the intersection',
    category:    'infrastructure',
    priority:    'high',
    location:    '123 Main Street, Test City',
    latitude:    30.7333,
    longitude:   76.7794,
  };

  cy.request({
    method: 'POST',
    url: '/api/issues',
    body: { ...defaults, ...issueData },
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('auth_token')}`,
    },
  }).then((response) => {
    expect(response.status).to.eq(201);
    return cy.wrap(response.body.id ?? response.body.data?.id);
  });
});