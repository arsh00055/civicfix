// cypress/e2e/profile/edit-profile.cy.ts

const MOCK_CITIZEN_USER = {
  id: 'u1',
  name: 'Jaspreet Kaur',
  firstName: 'Jaspreet',
  lastName: 'Kaur',
  password: 'abc_#123A?',
  email: 'jk0006914008@gmail.com',
  phone: '+91 6280283455',
  bio: 'Civic enthusiast from Mohali.',
  city: 'Mohali',
  role: 'citizen',
  avatar: null,
  isActive: true,
};

const MOCK_VOLUNTEER_USER = {
  ...MOCK_CITIZEN_USER,
  id: 'u2',
  name: 'Arshdeep Kaur',
  firstName: 'Arshdeep',
  lastName: 'Kaur',
  password: 'arshdeep',
  email: 'kaur.arsh1104@gmail.com',
  role: 'volunteer',
  skills: ['plumbing', 'electrical'],
  availability: ['weekends'],
  experienceLevel: 'intermediate',
};

const MOCK_ADMIN_USER = {
  ...MOCK_CITIZEN_USER,
  id: 'u3',
  name: 'Admin User',
  firstName: 'Admin',
  lastName: 'User',
  password: 'admin@123',
  email: 'jk0006914008@gmail.com',
  role: 'admin',
  department: 'IT',
};

// Stub /api/auth/me so useAuth / refreshUser resolves with the right mock
function stubCurrentUser(user: object) {
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: { success: true, data: user },
  }).as('getMe');
  cy.intercept('GET', '/api/users/profile', {
    statusCode: 200,
    body: { success: true, data: user },
  }).as('getProfile');
}

function stubProfileUpdate(overrides: object = {}) {
  cy.intercept('PUT', '/api/users/profile', {
    statusCode: 200,
    body: { success: true, data: { name: 'Updated User', ...overrides } },
  }).as('updateProfile');
}

// ─────────────────────────────────────────────────────────────
describe('Edit Profile Page — Citizen', () => {
  beforeEach(() => {
    cy.loginAsCitizen(MOCK_CITIZEN_USER.email, MOCK_CITIZEN_USER.password);
    stubCurrentUser(MOCK_CITIZEN_USER);
    stubProfileUpdate();
    cy.visit('/profile/edit');
    cy.wait('@getMe');
  });

  it('renders the page heading and key sections', () => {
    cy.contains('h1', 'Edit Profile').should('be.visible');
    cy.contains('Personal Information').should('be.visible');
    cy.contains('Profile Picture').should('be.visible');
  });

  it('pre-fills form fields from current user data', () => {
    cy.get('input[placeholder="Enter your first name"]').should('have.value', 'Jaspreet');
    cy.get('input[placeholder="Enter your last name"]').should('have.value', 'Kaur');
    cy.get('input[type="email"]').should('have.value', 'jk0006914008@gmail.com');
    cy.get('input[type="tel"]').should('have.value', '+91 6280283455');
    cy.get('input[placeholder="Your city"]').should('have.value', 'Mohali');
  });

  it('email field is disabled and cannot be changed', () => {
    cy.get('input[type="email"]').should('be.disabled');
  });

  it('does NOT show Volunteer Details or Admin Details sections', () => {
    cy.contains('Volunteer Details').should('not.exist');
    cy.contains('Admin Details').should('not.exist');
  });

  it('updates first name and saves successfully', () => {
    cy.get('input[placeholder="Enter your first name"]').clear().type('Gurpreet');
    cy.contains('button', 'Save Changes').click();
    cy.wait('@updateProfile').its('request.body').should('include', { firstName: 'Gurpreet' });
    cy.contains('Profile updated successfully! Redirecting...').should('exist');
  });

  it('shows a red error banner when the API returns an error', () => {
    cy.intercept('PUT', '/api/users/profile', {
      statusCode: 500,
      body: { success: false, message: 'Internal Server Error' },
    }).as('updateProfileFail');

    cy.contains('button', 'Save Changes').click();
    cy.wait('@updateProfileFail');
    cy.contains('Internal Server Error').should('exist');
  });

  it('Cancel button navigates back', () => {
    cy.visit('/profile');
    cy.visit('/profile/edit');
    cy.wait('@getMe');
    cy.wait('@getProfile');
    cy.contains('button', 'Cancel').click();
    cy.url().should('include', '/profile');
  });

  it('updates bio textarea', () => {
    cy.get('textarea').clear().type('Updated bio text here.');
    cy.contains('button', 'Save Changes').click();
    cy.wait('@updateProfile').its('request.body').should('include', { bio: 'Updated bio text here.' });
  });

  it('updates city field', () => {
    cy.get('input[placeholder="Your city"]').clear().type('Chandigarh');
    cy.contains('button', 'Save Changes').click();
    cy.wait('@updateProfile').its('request.body').should('include', { city: 'Chandigarh' });
  });
});

// ─────────────────────────────────────────────────────────────
describe('Edit Profile Page — Avatar Upload', () => {
  beforeEach(() => {
    cy.loginAsCitizen(MOCK_CITIZEN_USER.email, MOCK_CITIZEN_USER.password);
    stubCurrentUser(MOCK_CITIZEN_USER);
    stubProfileUpdate();
    cy.visit('/profile/edit');
    cy.wait('@getMe');
  });

  it('shows Choose Image button and hidden file input', () => {
    cy.contains('button', 'Choose Image').should('be.visible');
    cy.get('input[type="file"]').should('exist');
  });

  it('selecting a valid image shows Remove button and preview updates', () => {
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('fake-image-bytes'),
        fileName: 'avatar.jpg',
        mimeType: 'image/jpeg',
      },
      { force: true }
    );
    cy.contains('button', 'Remove').should('be.visible');
  });

  it('clicking Remove resets the file selection', () => {
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('fake-image-bytes'),
        fileName: 'avatar.jpg',
        mimeType: 'image/jpeg',
      },
      { force: true }
    );
    cy.contains('button', 'Remove').click();
    cy.contains('button', 'Remove').should('not.exist');
  });

  it('uploads avatar and saves profile in one submit', () => {
    cy.intercept('POST', '/api/upload/avatar', {
      statusCode: 200,
      body: { success: true, data: { avatar: 'https://cdn.civicfix.com/avatars/u1.jpg' } },
    }).as('uploadAvatar');
    stubProfileUpdate({ avatar: 'https://cdn.civicfix.com/avatars/u1.jpg' });

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('fake-image-bytes'),
        fileName: 'avatar.jpg',
        mimeType: 'image/jpeg',
      },
      { force: true }
    );
    cy.contains('button', 'Save Changes').click();
    cy.wait('@uploadAvatar');
    cy.wait('@updateProfile');
    cy.contains('Profile updated successfully! Redirecting...', { timeout: 1000 }).should('exist');
    cy.url({ timeout: 5000 }).should('include', '/profile');
  });

  it('shows error banner when avatar upload fails', () => {
    cy.intercept('POST', '/api/upload/avatar', {
      statusCode: 500,
      body: { success: false },
    }).as('uploadAvatarFail');

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('fake-image-bytes'),
        fileName: 'avatar.jpg',
        mimeType: 'image/jpeg',
      },
      { force: true }
    );
    cy.contains('button', 'Save Changes').click();
    cy.wait('@uploadAvatarFail');
    cy.contains('Failed to upload profile picture').should('exist');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Edit Profile Page — Volunteer role', () => {
  beforeEach(() => {
    cy.loginAsVolunteer(MOCK_VOLUNTEER_USER.email, MOCK_VOLUNTEER_USER.password);
    stubCurrentUser(MOCK_VOLUNTEER_USER);
    stubProfileUpdate();
    cy.visit('/profile/edit');
    cy.wait('@getMe');
  });

  it('shows the Volunteer Details section', () => {
    cy.contains('Volunteer Details').should('exist');
    cy.contains('Experience Level').should('exist');
  });

  it('does NOT show Admin Details section', () => {
    cy.contains('Admin Details').should('not.exist');
  });

  it('pre-fills experience level from user data', () => {
    cy.get('select').should('have.value', 'intermediate');
  });

  it('can change experience level and save', () => {
    cy.get('select').select('expert');
    cy.contains('button', 'Save Changes').click();
    cy.wait('@updateProfile').its('request.body').should('include', { experienceLevel: 'expert' });
    cy.contains('Profile updated successfully! Redirecting...').should('exist');
  });

  it('Save Changes button has green styling for volunteers', () => {
    cy.contains('button', 'Save Changes').should('have.class', 'bg-green-600');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Edit Profile Page — Admin role', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubCurrentUser(MOCK_ADMIN_USER);
    stubProfileUpdate();
    cy.visit('/profile/edit');
    cy.wait('@getMe');
  });

  it('shows the Admin Details section', () => {
    cy.contains('Admin Details').should('exist');
    cy.contains('Department').should('exist');
  });

  it('does NOT show Volunteer Details section', () => {
    cy.contains('Volunteer Details').should('not.exist');
  });

  it('pre-fills department from user data', () => {
    cy.get('input[placeholder="e.g., Administration, IT, HR"]').should('have.value', 'IT');
  });

  it('can update department and save', () => {
    cy.get('input[placeholder="e.g., Administration, IT, HR"]').clear().type('HR');
    cy.contains('button', 'Save Changes').click();
    cy.wait('@updateProfile').its('request.body').should('include', { department: 'HR' });
    cy.contains('Profile updated successfully! Redirecting...').should('exist');
  });

  it('Save Changes button has purple styling for admins', () => {
    cy.contains('button', 'Save Changes').should('have.class', 'bg-purple-600');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Edit Profile Page — Unauthenticated access', () => {
  it('shows Log In prompt when user is not authenticated', () => {
    // Stub auth endpoint to return no user
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 401,
      body: { success: false },
    }).as('getMeUnauth');

    cy.logout();
    cy.visit('/profile/edit');
    cy.contains('Please log in to edit your profile.').should('be.visible');
    cy.contains('button', 'Log In').should('be.visible');
  });

  it('Log In button redirects to /login', () => {
    cy.intercept('GET', '/api/auth/me', { statusCode: 401, body: { success: false } });
    cy.logout();
    cy.visit('/profile/edit');
    cy.contains('button', 'Log In').click({ force: true });
    cy.url().should('include', '/login');
  });
});