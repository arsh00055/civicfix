const NOW_ISO = new Date().toISOString();

const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Jaspreet Kaur',
    email: 'jaspreet@test.com',
    role: 'citizen',
    isActive: true,
    avatar: null,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  },
  {
    id: 'u2',
    name: 'Arshdeep Singh',
    email: 'arshdeep@test.com',
    role: 'volunteer',
    isActive: true,
    avatar: null,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  },
  {
    id: 'u3',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    isActive: true,
    avatar: null,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  },
  {
    id: 'u4',
    name: 'Inactive User',
    email: 'inactive@test.com',
    role: 'citizen',
    isActive: false,
    avatar: null,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  },
];

const MOCK_PENDING_VOLUNTEERS = [
  {
    _id: 'pv1',
    name: 'Rajveer Kaur',
    email: 'rajveer@test.com',
    skills: ['plumbing', 'electrical', 'carpentry'],
    experienceLevel: 'intermediate',
    phone: '+91 98765 43210',
    bio: 'Experienced volunteer ready to help.',
    createdAt: NOW_ISO,
  },
  {
    _id: 'pv2',
    name: 'Sukhdev Kumar',
    email: 'sukhdev@test.com',
    skills: ['painting'],
    experienceLevel: 'beginner',
    createdAt: NOW_ISO,
  },
];

// ── Stub helpers ────────────────────────────────────────────────────────────

function stubUsers(users = MOCK_USERS) {
  cy.intercept('GET', '/api/admin/users*', {
    statusCode: 200,
    body: users,
  }).as('getUsers');
}

function stubPendingVolunteers(volunteers = MOCK_PENDING_VOLUNTEERS) {
  cy.intercept('GET', '/api/admin/volunteers/pending*', {
    statusCode: 200,
    body: { success: true, data: volunteers, count: volunteers.length },
  }).as('getPendingVolunteers');
}

function stubDeactivate(userId = '*') {
  cy.intercept('PATCH', `/api/admin/users/${userId}/deactivate`, {
    statusCode: 200,
    body: { success: true, message: 'User deactivated' },
  }).as('deactivateUser');
}

function stubActivate(userId = '*') {
  cy.intercept('PATCH', `/api/admin/users/${userId}/activate`, {
    statusCode: 200,
    body: { success: true, message: 'User activated' },
  }).as('activateUser');
}

function stubUpdateRole(userId = '*') {
  cy.intercept('PATCH', `/api/admin/users/${userId}/role`, {
    statusCode: 200,
    body: { success: true },
  }).as('updateRole');
}

function stubApproveVolunteer(id = '*') {
  cy.intercept('POST', `/api/admin/volunteers/${id}/approve`, {
    statusCode: 200,
    body: { success: true, message: 'Volunteer approved' },
  }).as('approveVolunteer');
}

function stubRejectVolunteer(id = '*') {
  cy.intercept('POST', `/api/admin/volunteers/${id}/reject`, {
    statusCode: 200,
    body: { success: true, message: 'Volunteer rejected' },
  }).as('rejectVolunteer');
}

// ─────────────────────────────────────────────────────────────
describe('User Management — Rendering & Header', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubUsers();
    stubPendingVolunteers();
    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@getPendingVolunteers');
  });

  it('renders the page heading', () => {
    cy.contains('h1', 'User Management').should('be.visible');
    cy.contains('Manage all users and their roles in the system').should('be.visible');
  });

  it('renders the Refresh button (desktop)', () => {
    cy.get('button[aria-label="Refresh user list"]').should('exist');
  });

  it('clicking Refresh re-fetches users', () => {
    stubUsers();
    stubPendingVolunteers();
    cy.get('button[aria-label="Refresh user list"]').click({ force: true });
    cy.wait('@getUsers');
  });
});

// ─────────────────────────────────────────────────────────────
describe('User Management — UserStats', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubUsers();
    stubPendingVolunteers();
    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@getPendingVolunteers');
  });

  it('shows correct Total Users count', () => {
    // MOCK_USERS has 4 users
    cy.contains('Total Users').parent().contains('4').should('exist');
  });

  it('shows correct Citizens count', () => {
    // 2 citizens (u1 active, u4 inactive)
    cy.contains('Citizens').parent().contains('2').should('exist');
  });

  it('shows correct Volunteers count', () => {
    cy.contains('Volunteers').parent().contains('1').should('exist');
  });

  it('shows Pending Approvals count with amber styling when > 0', () => {
    cy.contains('Pending Approvals')
      .closest('[class*="rounded-xl"]')
      .should('have.class', 'bg-amber-50');
  });

  it('shows 0 Pending Approvals with neutral styling when none', () => {
    cy.intercept('GET', '/api/admin/volunteers/pending*', {
      statusCode: 200,
      body: { success: true, data: [], count: 0 },
    }).as('noPending');

    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@noPending');

    cy.contains('Pending Approvals')
      .closest('[class*="rounded-xl"]')
      .should('have.class', 'bg-gray-50');
  });
});

// ─────────────────────────────────────────────────────────────
describe('User Management — UsersTable Rendering', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubUsers();
    stubPendingVolunteers([]);
    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@getPendingVolunteers');
  });

  it('renders table headers', () => {
    cy.contains('th', 'User').should('exist');
    cy.contains('th', 'Email').should('exist');
    cy.contains('th', 'Role').should('exist');
    cy.contains('th', 'Status').should('exist');
    cy.contains('th', 'Joined').should('exist');
    cy.contains('th', 'Actions').should('exist');
  });

  it('renders all user names', () => {
    cy.contains('Jaspreet Kaur').should('exist');
    cy.contains('Arshdeep Singh').should('exist');
    cy.contains('Admin User').should('exist');
    cy.contains('Inactive User').should('exist');
  });

  it('renders user emails', () => {
    // Email column is inside overflow-hidden table — use exist + scrollIntoView
    cy.contains('jaspreet@test.com').scrollIntoView().should('exist');
    cy.contains('arshdeep@test.com').scrollIntoView().should('exist');
  });
  
  it('shows correct role badge colours', () => {
    // Scope to the row, then find the role badge td specifically (3rd td = Role column)
    cy.contains('tr', 'Jaspreet Kaur')
      .find('td').eq(2)          // Role column (0=User, 1=Email, 2=Role)
      .find('span')
      .should('have.class', 'bg-blue-100');
  
    cy.contains('tr', 'Arshdeep Singh')
      .find('td').eq(2)
      .find('span')
      .should('have.class', 'bg-green-100');
  
    cy.contains('tr', 'Admin User')
      .find('td').eq(2)
      .find('span')
      .should('have.class', 'bg-purple-100');
  });
  
  it('shows Active status badge for active users', () => {
    cy.contains('tr', 'Jaspreet Kaur')
      .find('td').eq(3)          // Status column
      .contains('Active')
      .should('exist');          // exist not be.visible — clipped by overflow
  });
  
  it('shows Deactivated status badge for inactive users', () => {
    cy.contains('tr', 'Inactive User')
      .find('td').eq(3)
      .contains('Deactivated')
      .should('exist');
  });
  
  it('shows Deactivate button for active users', () => {
    cy.contains('tr', 'Jaspreet Kaur')
      .find('td').eq(5)          // Actions column
      .contains('button', 'Deactivate')
      .should('exist');
  });
  
  it('shows Activate button for inactive users', () => {
    cy.contains('tr', 'Inactive User')
      .find('td').eq(5)
      .contains('button', 'Activate')
      .should('exist');
  });
  
  it('applies opacity to inactive user rows', () => {
    cy.contains('tr', 'Inactive User')
      .should('have.class', 'opacity-60');
  });

  it('shows empty state when no users', () => {
    cy.intercept('GET', '/api/admin/users*', {
      statusCode: 200,
      body: [],
    }).as('emptyUsers');

    cy.visit('/admin/user-management');
    cy.wait('@emptyUsers');

    cy.contains('No users found').should('exist');
    cy.contains('No users in the system yet.').should('exist');
  });
});

// ─────────────────────────────────────────────────────────────
describe('User Management — Deactivate User', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubUsers();
    stubPendingVolunteers([]);
    stubDeactivate('u1');
    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@getPendingVolunteers');
  });

  it('clicking Deactivate opens the deactivate reason modal', () => {
    cy.contains('tr', 'Jaspreet Kaur')
      .contains('button', 'Deactivate')
      .click();

    cy.contains('Deactivate User').should('be.visible');
    cy.contains('Please provide a reason for deactivation.').should('be.visible');
    cy.get('textarea[placeholder*="Violation of community guidelines"]').should('be.visible');
    cy.contains('button', 'Confirm Deactivate').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });

  it('Cancel button closes the deactivate modal', () => {
    cy.contains('tr', 'Jaspreet Kaur')
      .contains('button', 'Deactivate')
      .click();

    cy.contains('Deactivate User').should('be.visible');
    cy.get('.fixed.inset-0').contains('button', 'Cancel').click();
    cy.contains('Deactivate User').should('not.exist');
  });

  it('confirms deactivation with a reason and shows success toast', () => {
    cy.contains('tr', 'Jaspreet Kaur')
      .contains('button', 'Deactivate')
      .click();

    cy.get('textarea[placeholder*="Violation of community guidelines"]')
      .type('Violation of community guidelines');

    cy.contains('button', 'Confirm Deactivate').click();
    cy.wait('@deactivateUser')
      .its('request.body')
      .should('have.property', 'reason', 'Violation of community guidelines');

    cy.contains('User deactivated successfully').should('exist');
  });

  it('shows error toast when deactivate API fails', () => {
    cy.intercept('PATCH', '/api/admin/users/u1/deactivate', {
      statusCode: 500,
      body: { message: 'Server error' },
    }).as('deactivateFail');

    cy.contains('tr', 'Jaspreet Kaur')
      .contains('button', 'Deactivate')
      .click();

    cy.get('textarea[placeholder*="Violation of community guidelines"]').type('Some reason');
    cy.contains('button', 'Confirm Deactivate').click();
    cy.wait('@deactivateFail');
    cy.contains(/action failed|please try again/i).should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────
describe('User Management — Activate User', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubUsers();
    stubPendingVolunteers([]);
    stubActivate('u4');
    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@getPendingVolunteers');
  });

  it('clicking Activate shows Sonner warning toast with Activate and Cancel actions', () => {
    cy.contains('tr', 'Inactive User')
      .contains('button', 'Activate')
      .click();

    cy.contains('Activate this user?').should('be.visible');
    cy.contains('The user will be able to log in again.').should('be.visible');
    cy.contains('button', 'Activate').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });

  it('confirming Activate calls the activate API and shows success toast', () => {
    cy.contains('tr', 'Inactive User')
      .contains('button', 'Activate')
      .click();

    cy.contains('Activate this user?').should('be.visible');
    // Click the Activate action in the Sonner toast
    cy.get('[data-sonner-toaster]').contains('button', 'Activate').click();
    cy.wait('@activateUser');
    cy.contains('User activated successfully').should('be.visible');
  });

  it('cancelling Activate shows cancelled toast', () => {
    cy.contains('tr', 'Inactive User')
      .contains('button', 'Activate')
      .click();

    cy.contains('Activate this user?').should('be.visible');
    cy.get('[data-sonner-toaster]').contains('button', 'Cancel').click();
    cy.contains('Action cancelled').should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────
describe('User Management — UserFilters', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubUsers();
    stubPendingVolunteers([]);
    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@getPendingVolunteers');
  });

  it('renders search input and role dropdown', () => {
    cy.contains('Search Users').parent().find('label');
    cy.contains('Filter by Role').parent().find('label');
    cy.contains('Clear Filters').parent().find('button');
  });

  it('searching by name filters the table', () => {
    cy.contains('Search Users').parent().find('input').type('Jaspreet');
    cy.contains('Jaspreet Kaur').should('exist');
    cy.contains('Arshdeep Singh').should('not.exist');
  });

  it('searching by email filters the table', () => {
    cy.contains('Search Users').parent().find('input').type('arshdeep@test.com')
    cy.contains('Arshdeep Singh').should('exist');
    cy.contains('Jaspreet Kaur').should('not.exist');
  });

  it('filtering by role shows only matching users', () => {
    cy.get('select[aria-label="Filter users by role"]').select('volunteer');
    cy.contains('Arshdeep Singh').should('be.visible');
    cy.contains('Jaspreet Kaur').should('not.exist');
  });

  it('filtering by citizen role shows only citizens', () => {
    cy.get('select[aria-label="Filter users by role"]').select('citizen');
    cy.contains('Jaspreet Kaur').should('be.visible');
    cy.contains('Inactive User').should('be.visible');
    cy.contains('Arshdeep Singh').should('not.exist');
  });

  it('Clear Filters resets search and role filter', () => {
    cy.contains('Search Users').parent().find('input').type('Jaspreet');
    cy.contains('Filter by Role').parent().find('select').select('citizen');

    cy.contains('button', 'Clear Filters').click();

    cy.contains('Search Users').parent().find('input').should('have.value', '');
    cy.contains('Filter by Role').parent().find('select').should('have.value', '');
    // All users visible again
    cy.contains('Arshdeep Singh').should('be.visible');
    cy.contains('Jaspreet Kaur').should('be.visible');
  });

  it('shows no results message when search matches nobody', () => {
    cy.contains('Search Users').parent().find('input').type('zzznobodymatchesthis');
    cy.contains('No users found').should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────
describe('User Management — Pending Volunteers Section', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubUsers();
    stubPendingVolunteers();
    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@getPendingVolunteers');
  });

  it('shows pending volunteer section with count badge', () => {
    cy.contains('Pending Volunteer Approvals').should('be.visible');
    cy.contains('2 Pending').should('be.visible');
  });

  it('renders pending volunteer names and emails', () => {
    cy.contains('Rajveer Kaur').should('be.visible');
    cy.contains('rajveer@test.com').should('be.visible');
    cy.contains('Sukhdev Kumar').should('be.visible');
  });

  it('renders volunteer skills', () => {
    cy.contains('plumbing').should('be.visible');
    cy.contains('electrical').should('be.visible');
  });

  it('renders experience level badge', () => {
    cy.contains('intermediate').should('be.visible');
  });

  it('renders Approve and Reject buttons for each volunteer', () => {
    cy.contains('✓ Approve').should('be.visible');
    cy.contains('✕ Reject').should('be.visible');
  });

  it('shows All clear state when no pending volunteers', () => {
    cy.intercept('GET', '/api/admin/volunteers/pending*', {
      statusCode: 200,
      body: { success: true, data: [], count: 0 },
    }).as('noPending');

    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@noPending');

    cy.contains('No pending volunteer applications.').should('be.visible');
    cy.contains('All clear').should('be.visible');
  });

  it('approving a volunteer calls the API and removes them from the list', () => {
    stubApproveVolunteer('pv1');
    // Also stub the re-fetch of users that happens after approve
    stubUsers();

    cy.contains('Rajveer Kaur')
      .closest('[class*="p-4"]')
      .contains('button', '✓ Approve')
      .click();

    cy.wait('@approveVolunteer');
    cy.contains('Volunteer approved successfully!').should('be.visible');
    cy.contains('Rajveer Kaur').should('not.exist');
  });

  it('clicking Reject opens the reject reason modal', () => {
    cy.contains('Rajveer Kaur')
      .closest('[class*="p-4"]')
      .contains('button', '✕ Reject')
      .click();

    cy.contains('Reject Volunteer').should('be.visible');
    cy.contains('Please provide a reason for rejection').should('be.visible');
    cy.get('textarea[placeholder*="Skills do not match"]').should('be.visible');
    cy.contains('button', 'Confirm Reject').should('be.visible');
  });

  it('confirming reject calls the API with reason and removes volunteer', () => {
    stubRejectVolunteer('pv1');

    cy.contains('Rajveer Kaur')
      .closest('[class*="p-4"]')
      .contains('button', '✕ Reject')
      .click();

    cy.get('textarea[placeholder*="Skills do not match"]').type('Profile incomplete');
    cy.contains('button', 'Confirm Reject').click();
    cy.wait('@rejectVolunteer');
    cy.contains('Volunteer rejected successfully.').should('be.visible');
    cy.contains('Rajveer Kaur').should('not.exist');
  });

  it('cancelling the reject modal closes it without action', () => {
    cy.contains('Rajveer Kaur')
      .closest('[class*="p-4"]')
      .contains('button', '✕ Reject')
      .click();

    cy.contains('Reject Volunteer').should('be.visible');
    cy.get('.fixed.inset-0').contains('button', 'Cancel').click();
    cy.contains('Reject Volunteer').should('not.exist');
    cy.contains('Rajveer Kaur').should('exist');
  });

  it('shows approve error toast when API fails', () => {
    cy.intercept('POST', '/api/admin/volunteers/*/approve', {
      statusCode: 500,
      body: { message: 'Server error' },
    }).as('approveFail');

    cy.contains('Rajveer Kaur')
      .closest('[class*="p-4"]')
      .contains('button', '✓ Approve')
      .click();

    cy.wait('@approveFail');
    cy.contains(/Server Error/i).should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────
describe('User Management — Error States', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubPendingVolunteers([]);
  });

  it('shows error UI when users API fails on initial load', () => {
    cy.intercept('GET', '/api/admin/users*', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('getUsersFail');

    cy.visit('/admin/user-management');
    cy.wait('@getUsersFail');

    // Shows Error component or inline error banner
    cy.get('body').then($body => {
      const hasError = $body.text().match(/failed to load|error|something went wrong/i);
      expect(hasError).to.be.ok;
    });
  });

  it('shows inline error banner with Retry and Dismiss when users reload fails', () => {
    // First load succeeds, then refresh fails
    stubUsers();
    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@getPendingVolunteers');

    cy.intercept('GET', '/api/admin/users*', {
      statusCode: 500,
      body: { message: 'Failed to load users' },
    }).as('retryFail');

    // Trigger refresh via header button
    cy.get('button[aria-label="Refresh user list"]').click({ force: true });
    cy.wait('@retryFail');

    cy.contains('button', 'Retry').should('be.visible');
    cy.contains('button', 'Dismiss').should('be.visible');
  });

  it('Dismiss button hides the error banner', () => {
    stubUsers();
    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.wait('@getPendingVolunteers');

    cy.intercept('GET', '/api/admin/users*', {
      statusCode: 500,
      body: { message: 'Failed to load users' },
    }).as('retryFail');

    cy.get('button[aria-label="Refresh user list"]').click({ force: true });
    cy.wait('@retryFail');

    cy.contains('button', 'Dismiss').click();
    cy.contains('Failed to load users').should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────
describe('User Management — Access Control', () => {
  it('allows admin to access user management page', () => {
    cy.loginAsAdmin();
    stubUsers();
    stubPendingVolunteers([]);
    cy.visit('/admin/user-management');
    cy.wait('@getUsers');
    cy.contains('h1', 'User Management').should('be.visible');
  });
});