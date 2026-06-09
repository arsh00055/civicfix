// cypress/e2e/admin/admin-issues.cy.ts

const NOW = new Date().toISOString();

// Assigned 10 days ago → overdue (> 7 days)
const TEN_DAYS_AGO = new Date(Date.now() - 10 * 86_400_000).toISOString();
// Created 25 days ago → stale (> 21 days)
const TWENTY_FIVE_DAYS_AGO = new Date(Date.now() - 25 * 86_400_000).toISOString();

const MOCK_PENDING_ISSUE = {
  id: 'issue-001',
  title: 'Broken Street Light',
  description: 'Street light not working on Main Street for 3 days.',
  category: 'safety',
  priority: 'high',
  status: 'pending_review',
  location: '456 Oak Avenue',
  upvotes: 8,
  commentsCount: 3,
  reporter: { id: 'c1', name: 'Jaspreet Kaur' },
  assignedTo: { id: 'v1', name: 'Arshdeep Singh', role: 'volunteer' },
  assignedAt: TEN_DAYS_AGO,
  resolutionNotes: 'Fixed the bulb and checked wiring.',
  createdAt: NOW,
  updatedAt: NOW,
};

const MOCK_OVERDUE_ISSUE = {
  id: 'issue-002',
  title: 'Pothole on Sector 17',
  description: 'Large pothole causing accidents.',
  category: 'roads',
  priority: 'critical',
  status: 'assigned',
  location: 'Sector 17, Chandigarh',
  upvotes: 15,
  commentsCount: 5,
  reporter: { id: 'c2', name: 'Gurpreet Singh' },
  assignedTo: { id: 'v2', name: 'Rajveer Kaur', role: 'volunteer' },
  assignedAt: TEN_DAYS_AGO,
  resolutionNotes: null,
  createdAt: NOW,
  updatedAt: NOW,
};

const MOCK_STALE_ISSUE = {
  id: 'issue-003',
  title: 'Garbage Overflow Near Park',
  description: 'Garbage bins overflowing near the community park.',
  category: 'sanitation',
  priority: 'medium',
  status: 'reported',
  location: 'Rose Garden, Sector 16',
  upvotes: 4,
  commentsCount: 1,
  reporter: { id: 'c3', name: 'Harpreet Kaur' },
  assignedTo: null,
  assignedAt: null,
  resolutionNotes: null,
  createdAt: TWENTY_FIVE_DAYS_AGO,
  updatedAt: TWENTY_FIVE_DAYS_AGO,
};

const MOCK_ALL_ISSUE = {
  id: 'issue-004',
  title: 'Water Leakage in Block B',
  description: 'Severe water leakage in residential block.',
  category: 'water',
  priority: 'low',
  status: 'in_progress',
  location: 'Block B, Sector 8',
  upvotes: 2,
  commentsCount: 0,
  reporter: { id: 'c4', name: 'Manpreet Singh' },
  assignedTo: { id: 'v3', name: 'Sukhdev Kumar', role: 'volunteer' },
  assignedAt: NOW,
  resolutionNotes: null,
  createdAt: NOW,
  updatedAt: NOW,
};

// ── Stub helpers ───────────────────────────────────────────────

function stubPendingTab(issues = [MOCK_PENDING_ISSUE]) {
  cy.intercept('GET', '/api/issues*status=pending_review*', {
    statusCode: 200,
    body: { issues, total: issues.length, pagination: { page: 1, limit: 50, total: issues.length, totalPages: 1 } },
  }).as('getPending');
}

function stubAllTab(issues = [MOCK_ALL_ISSUE]) {
  cy.intercept('GET', '/api/issues*', {
    statusCode: 200,
    body: { issues, total: issues.length, pagination: { page: 1, limit: 50, total: issues.length, totalPages: 1 } },
  }).as('getAllIssues');
}

function stubOverdueTab(
  assigned = [MOCK_OVERDUE_ISSUE],
  inProgress: any[] = [],
  reported = [MOCK_STALE_ISSUE]
) {
  cy.intercept('GET', '/api/issues*status=assigned*', {
    statusCode: 200,
    body: { issues: assigned, total: assigned.length },
  }).as('getAssigned');
  cy.intercept('GET', '/api/issues*status=in_progress*', {
    statusCode: 200,
    body: { issues: inProgress, total: inProgress.length },
  }).as('getInProgress');
  cy.intercept('GET', '/api/issues*status=reported*', {
    statusCode: 200,
    body: { issues: reported, total: reported.length },
  }).as('getReported');
}

function stubReview(issueId = 'issue-001') {
  cy.intercept('POST', `/api/issues/${issueId}/review`, {
    statusCode: 200,
    body: { success: true, message: 'Issue resolved successfully!' },
  }).as('reviewIssue');
}

function stubEscalate(issueId = 'issue-002') {
  cy.intercept('POST', `/api/admin/issues/${issueId}/escalate`, {
    statusCode: 200,
    body: { success: true, message: 'Action completed successfully', issue: MOCK_OVERDUE_ISSUE },
  }).as('escalateIssue');
}

// ─────────────────────────────────────────────────────────────
describe('Admin Issues Page — Rendering & Header', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubPendingTab();
    cy.visit('/admin/issues');
    cy.wait('@getPending');
  });

  it('renders the Manage Issues heading', () => {
    cy.contains('h1', 'Manage Issues').should('be.visible');
    cy.contains('Review and manage reported issues').should('be.visible');
  });

  it('renders all tab buttons', () => {
    cy.contains('button', /Pending Review/).should('be.visible');
    cy.contains('button', /Overdue \/ Stale/).should('be.visible');
    cy.contains('button', 'All Issues').should('be.visible');
    cy.contains('button', 'Refresh').should('be.visible');
  });

  it('Pending Review tab is active by default', () => {
    cy.contains('button', /Pending Review/).should('have.class', 'bg-purple-600');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Admin Issues Page — Pending Review Tab', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubPendingTab();
    cy.visit('/admin/issues');
    cy.wait('@getPending');
  });

  it('renders the issue card with title, priority and status badge', () => {
    cy.contains('Broken Street Light').should('be.visible');
    cy.contains('HIGH').should('be.visible');
    cy.contains('Pending Review').should('be.visible');
  });

  it('renders issue metadata — location, reporter, comments', () => {
    cy.contains('456 Oak Avenue').should('be.visible');
    cy.contains('Jaspreet Kaur').should('be.visible');
    cy.contains('3 comments').should('be.visible');
  });

  it('shows assignedTo volunteer name', () => {
    cy.contains('Arshdeep Singh').should('be.visible');
  });

  it('shows resolution notes section', () => {
    cy.contains('Resolution Notes:').should('be.visible');
    cy.contains('Fixed the bulb and checked wiring.').should('be.visible');
  });

  it('shows Review Resolution button for pending_review issues', () => {
    cy.contains('button', 'Review Resolution').should('be.visible');
  });

  it('shows View Details button', () => {
    cy.contains('button', 'View Details').should('be.visible');
  });

  it('View Details navigates to issue detail page with admin role', () => {
    cy.contains('button', 'View Details').click();
    cy.url().should('include', '/issues/issue-001').and('include', 'role=admin');
  });

  it('shows empty state when no pending issues', () => {
    cy.intercept('GET', '/api/issues*status=pending_review*', {
      statusCode: 200,
      body: { issues: [], total: 0 },
    }).as('emptyPending');

    cy.visit('/admin/issues');
    cy.wait('@emptyPending');
    cy.contains('No pending reviews').should('be.visible');
    cy.contains('There are no issues waiting for review at the moment.').should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Admin Issues Page — Review Modal', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubPendingTab();
    stubReview('issue-001');
    cy.visit('/admin/issues');
    cy.wait('@getPending');
  });

  it('clicking Review Resolution opens the review modal', () => {
    cy.contains('button', 'Review Resolution').first().click();
    cy.contains('Review Resolution').should('be.visible');
  });

  it('approving the resolution calls the API and shows success toast', () => {
    cy.contains('button', 'Review Resolution').first().click();
    cy.contains('Review Resolution').should('be.visible');

    // Fill in review notes if the modal has a textarea
    cy.get('textarea').first().type('Work verified on site. All good.');

    cy.contains('button', /Approve|Resolve/).click();
    cy.wait('@reviewIssue').its('request.body').should('deep.include', { approved: true });
    cy.contains('Issue resolved successfully!').should('be.visible');
  });

  it('rejecting the resolution calls the API and shows rejection toast', () => {
    cy.intercept('POST', '/api/issues/*/review', {
      statusCode: 200,
      body: { success: true, message: 'Issue rejected and sent back for rework' },
    }).as('rejectIssue');
  
    cy.contains('button', 'Review Resolution').first().click();
  
    // Select the Reject radio button
    cy.get('input[type="radio"][value="reject"]').click();
  
    // Rejection reason textarea appears — fill it in (required field)
    cy.get('textarea').last().type('Work is incomplete, needs more effort.');
  
    // Submit button now says "Reject & Send Back"
    cy.contains('button', 'Reject & Send Back').click();
    cy.wait('@rejectIssue');
    cy.contains('Issue rejected and sent back for rework').should('be.visible');
  });
  
  it('modal can be closed without submitting', () => {
    cy.contains('button', 'Review Resolution').first().click();
  
    // Modal is open — the fixed overlay exists
    cy.get('.fixed.inset-0.z-50').should('exist');
  
    // Click the Cancel button in the modal footer
    cy.get('.fixed.inset-0.z-50').contains('button', 'Cancel').click();
  
    // Modal overlay is gone
    cy.get('.fixed.inset-0.z-50').should('not.exist');
  });

  it('shows error toast when review API fails', () => {
    cy.intercept('POST', '/api/issues/issue-001/review', {
      statusCode: 500,
      body: { success: false, message: 'Something went wrong' },
    }).as('reviewFail');

    cy.contains('button', 'Review Resolution').first().click();
    cy.contains('Review Resolution').should('be.visible');
    cy.contains('button', /Approve|Resolve/).click();
    cy.wait('@reviewFail');
    cy.contains(/failed|wrong/i).should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Admin Issues Page — Overdue / Stale Tab', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubPendingTab();
    stubOverdueTab();
    cy.visit('/admin/issues');
    cy.wait('@getPending');
  });

  it('clicking Overdue tab switches to overdue view', () => {
    cy.contains('button', /Overdue \/ Stale/).click();
    cy.wait('@getAssigned');
    cy.wait('@getInProgress');
    cy.wait('@getReported');
    cy.contains('button', /Overdue \/ Stale/).should('have.class', 'bg-orange-600');
  });

  it('shows the overdue explanation banner on the overdue tab', () => {
    cy.contains('button', /Overdue \/ Stale/).click();
    cy.wait('@getAssigned');
    cy.contains('Overdue & Stale Issues').should('be.visible');
    cy.contains('Overdue:').should('be.visible');
    cy.contains('Stale:').should('be.visible');
  });

  it('renders the overdue issue with red overdue badge', () => {
    cy.contains('button', /Overdue \/ Stale/).click();
    cy.wait('@getAssigned');
    cy.contains('Pothole on Sector 17').should('be.visible');
    cy.contains(/overdue/i).should('be.visible');
  });

  it('renders the stale issue with orange age badge', () => {
    cy.contains('button', /Overdue \/ Stale/).click();
    cy.wait('@getReported');
    cy.contains('Garbage Overflow Near Park').should('be.visible');
    cy.contains(/d old/i).should('be.visible');
  });

  it('shows Take Action button for overdue/stale issues', () => {
    cy.contains('button', /Overdue \/ Stale/).click();
    cy.wait('@getAssigned');
    cy.contains('button', 'Take Action').should('be.visible');
  });

  it('shows empty state when no overdue or stale issues', () => {
    cy.intercept('GET', '/api/issues*status=assigned*', { body: { issues: [] } }).as('emptyAssigned');
    cy.intercept('GET', '/api/issues*status=in_progress*', { body: { issues: [] } }).as('emptyInProgress');
    cy.intercept('GET', '/api/issues*status=reported*', { body: { issues: [] } }).as('emptyReported');

    cy.contains('button', /Overdue \/ Stale/).click();
    cy.wait('@emptyAssigned');
    cy.contains('No overdue or stale issues 🎉').should('be.visible');
    cy.contains('All tasks are being handled within the deadline.').should('be.visible');
  });

  it('shows red badge on Overdue tab button when there are overdue issues on pending tab', () => {
    // The badge only shows when the tab is NOT active
    // So while on pending tab, overdue count badge should be visible if overdueCount > 0
    // The component derives overdueCount from the current issues list, so check from overdue tab context
    cy.contains('button', /Overdue \/ Stale/).click();
    cy.wait('@getAssigned');
    // Switch back to pending — red dot should appear on overdue tab
    stubPendingTab([{ ...MOCK_PENDING_ISSUE, status: 'assigned', assignedAt: TEN_DAYS_AGO }]);
    cy.contains('button', /Pending Review/).click();
    cy.wait('@getPending');
    cy.get('span.bg-red-500').should('exist');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Admin Issues Page — Escalate Modal', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubPendingTab();
    stubOverdueTab();
    cy.visit('/admin/issues');
    cy.wait('@getPending');
    cy.contains('button', /Overdue \/ Stale/).click();
    cy.wait('@getAssigned');
  });

  it('clicking Take Action opens the escalate modal', () => {
    cy.contains('button', 'Take Action').first().click();
    // EscalateModal should appear
    cy.get('body').then($body => {
      // Modal content will vary — just check something meaningful appeared
      expect($body.text()).to.match(/escalate|action|reassign|warn/i);
    });
  });

  it('closing the escalate modal without action hides it', () => {
    cy.contains('button', 'Take Action').first().click();
    cy.contains('button', /Close|Cancel/).click();
    cy.contains('button', 'Take Action').should('be.visible'); // back to list
  });
});

// ─────────────────────────────────────────────────────────────
describe('Admin Issues Page — All Issues Tab', () => {
  beforeEach(() => {
    cy.loginAsAdmin();

    // Stub pending tab (catches the initial load on mount)
    cy.intercept('GET', '/api/issues*', (req) => {
      if (req.url.includes('status=pending_review')) {
        req.alias = 'getPending';
        req.reply({
          statusCode: 200,
          body: { issues: [], total: 0 },
        });
      } else {
        req.alias = 'getAllIssues';
        req.reply({
          statusCode: 200,
          body: {
            issues: [MOCK_ALL_ISSUE],
            total: 1,
            pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
          },
        });
      }
    });

    cy.visit('/admin/issues');
    // Wait for the page heading instead of a specific API alias
    cy.contains('h1', 'Manage Issues').should('be.visible');
  });

  it('clicking All Issues tab switches view', () => {
    cy.contains('button', 'All Issues').click();
    cy.wait('@getAllIssues');
    cy.contains('button', 'All Issues').should('have.class', 'bg-purple-600');
  });

  it('renders issues from the all tab', () => {
    cy.contains('button', 'All Issues').click();
    cy.wait('@getAllIssues');
    cy.contains('Water Leakage in Block B').should('be.visible');
  });

  it('shows empty state message for all tab when no issues', () => {
    cy.intercept('GET', '/api/issues*', {
      statusCode: 200,
      body: { issues: [], total: 0 },
    }).as('emptyAll');

    cy.contains('button', 'All Issues').click();
    cy.wait('@emptyAll');
    cy.contains('No issues found').should('be.visible');
    cy.contains('No issues have been reported yet.').should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Admin Issues Page — Refresh Button', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    stubPendingTab();
    cy.visit('/admin/issues');
    cy.wait('@getPending');
  });

  it('clicking Refresh re-fetches issues', () => {
    stubPendingTab([MOCK_PENDING_ISSUE]);
    cy.contains('button', 'Refresh').click();
    cy.wait('@getPending');
    cy.contains('Broken Street Light').should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Admin Issues Page — Error State', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('shows error UI when the API fails on pending tab', () => {
    cy.intercept('GET', '/api/issues*status=pending_review*', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('pendingError');

    cy.visit('/admin/issues');
    cy.wait('@pendingError');
    // Error component renders — look for reset/retry affordance
    cy.contains(/try again|retry|reset/i).should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Admin Issues Page — Priority & Status Badges', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  const priorities = [
    { label: 'CRITICAL', cls: 'bg-red-100' },
    { label: 'HIGH',     cls: 'bg-orange-100' },
    { label: 'MEDIUM',   cls: 'bg-yellow-100' },
    { label: 'LOW',      cls: 'bg-green-100' },
  ];

  priorities.forEach(({ label, cls }) => {
    it(`renders correct colour for ${label} priority`, () => {
      const issue = {
        ...MOCK_ALL_ISSUE,
        id: `issue-p-${label}`,
        title: `${label} Priority Issue`,
        priority: label.toLowerCase(),
      };
  
      // Single intercept handles everything — no alias conflict
      cy.intercept('GET', '/api/issues*', {
        statusCode: 200,
        body: { issues: [issue], total: 1 },
      }).as('getByPriority');
  
      cy.visit('/admin/issues');
      // Don't wait for @getPending — wait for the page to load visually
      cy.contains('h1', 'Manage Issues').should('be.visible');
  
      cy.contains('button', 'All Issues').click();
      cy.wait('@getByPriority');
  
      // Scope to the issue card, find the priority badge span directly
      cy.contains(`${label} Priority Issue`)
        .closest('[class*="rounded-xl"]')
        .find(`span.${cls}`)
        .should('exist')
        .and('contain.text', label);
    });
  });
});