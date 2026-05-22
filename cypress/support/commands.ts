export {} 

declare global{
    namespace Cypress {
        interface Chainable {
            loginAsCitizen(email?: string, password?: string): Chainable<void>;
            loginAsVolunteer(email?: string, password?:string): Chainable<void>;
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

// login as citizen

Cypress.Commands.add('loginAsCitizen', (
    email = Cypress.env('CITIZEN_EMAIL') as string,
    password = Cypress.env('CITIZEN_PASSWORD') as string,
) => {
    if (!email || !password) {
        throw new Error('Set CYPRESS_CITIZEN_EMAIL and CYPRESS_CITIZEN_PASSWORD');
    }
    cy.request('POST', '/api/auth/login', {
        email,
        password,
        role: 'citizen',
    }).then((response) => {
        expect(response.status).to.eq(200);
        const { token, user} = response.body.data;
        window.localStorage.setItem('auth_token', token);
        window.localStorage.setItem('user_data', JSON.stringify(user));
    })
})

// login as volunteer

Cypress.Commands.add('loginAsVolunteer', (
    email    = Cypress.env('VOLUNTEER_EMAIL') as string,
    password = Cypress.env('VOLUNTEER_PASSWORD') as string,
) => {
    if (!email || !password) {
        throw new Error('Set CYPRESS_VOLUNTEER_EMAIL and CYPRESS_VOLUNTEER_PASSWORD');
    }
    cy.request('POST', '/api/auth/login', {
        email,
        password,
        role: 'volunteer',
    }).then((response) => {
        expect(response.status).to.eq(200);
        const { token, user } = response.body.data;
        window.localStorage.setItem('auth_token', token);
        window.localStorage.setItem('user_data', JSON.stringify(user));
    })
})

// login as admin

Cypress.Commands.add('loginAsAdmin', (
    email    = Cypress.env('ADMIN_EMAIL') as string,
    password = Cypress.env('ADMIN_PASSWORD') as string,
) => {
    if (!email || !password) {
        throw new Error('Set CYPRESS_ADMIN_EMAIL and CYPRESS_ADMIN_PASSWORD');
    }
    cy.request('POST', '/api/auth/login', {
        email,
        password,
        role: 'admin',
    }).then((response) => {
        expect(response.status).to.eq(200);
        const { token, user } = response.body.data;
        window.localStorage.setItem('auth_token', token);
        window.localStorage.setItem('user_data', JSON.stringify(user));
    })
})

// logout

Cypress.Commands.add('logout', () => {
    cy.clearLocalStorage();
    cy.clearCookies();
})

// seed issue

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
        return cy.wrap(response.body.id);
    })
})
