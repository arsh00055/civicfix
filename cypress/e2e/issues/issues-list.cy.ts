export const REPORTER_ID = 'citizen-001';
export const VOLUNTEER_ID = 'volunteer-001';

export const MOCK_ISSUE_REPORTED = {
  id: 'issue-001',
  title: 'Broken Street Light',
  description: 'Street light on Main St has not worked for 3 days. Residents face safety issues at night.',
  category: 'safety',
  priority: 'high',
  status: 'reported',
  location: '123 Main Street, Sector 4',
  upvotes: 8,
  commentsCount: 2,
  reporterId: REPORTER_ID,
  reporter: { id: REPORTER_ID, name: 'Jaspreet Kaur' },
  assignedTo: null,
  assignedToId: null,
  resolutionNotes: null,
  resolutionProof: [],
  images: [],
  comments: [],
  latitude: 31.326,
  longitude: 75.576,
  createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  updatedAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
  resolvedAt: null,
};

export const MOCK_ISSUE_ASSIGNED = {
  ...MOCK_ISSUE_REPORTED,
  id: 'issue-002',
  title: 'Blocked Drainage',
  status: 'assigned',
  assignedToId: VOLUNTEER_ID,
  assignedTo: { id: VOLUNTEER_ID, name: 'Arshdeep Singh' },
};

export const MOCK_ISSUE_RESOLVED = {
  ...MOCK_ISSUE_REPORTED,
  id: 'issue-003',
  title: 'Repaired Footpath',
  status: 'resolved',
  resolutionNotes: 'Repaved cracked section near park gate.',
  resolvedAt: new Date().toISOString(),
  assignedTo: { id: VOLUNTEER_ID, name: 'Arshdeep Singh' },
  assignedToId: VOLUNTEER_ID,
};

export const MOCK_ISSUES = [MOCK_ISSUE_REPORTED, MOCK_ISSUE_ASSIGNED, MOCK_ISSUE_RESOLVED];

export const MOCK_COMMENTS = [
  {
    id: 'cmt-001',
    text: 'This has been an issue for weeks!',
    userId: REPORTER_ID,
    user: { id: REPORTER_ID, name: 'Jaspreet Kaur', avatar: null },
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    isEdited: false,
  },
  {
    id: 'cmt-002',
    text: 'Reported to municipal corporation yesterday.',
    userId: 'other-user',
    user: { id: 'other-user', name: 'Ranjit Singh', avatar: null },
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    isEdited: false,
  },
];

// ─────────────────────────────────────────────
// Stub helpers
// ─────────────────────────────────────────────

export const stubIssuesList = (issues = MOCK_ISSUES) => {
  cy.intercept('GET', '/api/issues*', {
    statusCode: 200,
    body: { issues, total: issues.length, pagination: { page: 1, limit: 50, total: issues.length, totalPages: 1 } },
  }).as('getIssues');
};

export const stubSingleIssue = (issue = MOCK_ISSUE_REPORTED) => {
  cy.intercept('GET', `/api/issues/${issue.id}`, {
    statusCode: 200,
    body: { data: issue },
  }).as('getIssue');
};

export const stubComments = (issueId: string, comments = MOCK_COMMENTS) => {
  cy.intercept('GET', `/api/issues/${issueId}/comments*`, {
    statusCode: 200,
    body: comments,
  }).as('getComments');
};

export const stubRateCheck = (
  issueId: string,
  opts: { canRate?: boolean; hasRated?: boolean; rating?: object | null } = {},
) => {
  cy.intercept('GET', `/api/issues/${issueId}/rate`, {
    statusCode: 200,
    body: {
      canRate: opts.canRate ?? true,
      hasRated: opts.hasRated ?? false,
      rating: opts.rating ?? null,
    },
  }).as('getRateCheck');
};

export const visitDetail = (issueId: string) => {
  cy.visit(`/issues/${issueId}`);
  cy.wait('@getIssue');
};

export const setReporterSession = () => {
  cy.then(() => {
    const userData = JSON.parse(window.localStorage.getItem('user_data') || '{}');
    userData.id = REPORTER_ID;
    window.localStorage.setItem('user_data', JSON.stringify(userData));
  });
};