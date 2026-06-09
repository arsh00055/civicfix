import type { Issue, Comment } from '@/types/issue.types'; // adjust path as needed

export const REPORTER_ID = 'citizen-001';
export const VOLUNTEER_ID = 'volunteer-001';

// ── Reusable sub-objects ─────────────────────

const EMPTY_ASSIGNED_TO = {
  id: '',
  name: '',
  avatar: '',
  role: 'volunteer' as const,
  rating: undefined,
} satisfies Issue['assignedTo'];

const makeVolunteer = (id: string, name: string): NonNullable<Issue['assignedTo']> => ({
  id,
  name,
  avatar: '',
  role: 'volunteer' as const,
  rating: undefined,
});

// ── Base mock ────────────────────────────────

export const MOCK_ISSUE_REPORTED = {
  id: 'issue-001',
  title: 'Broken Street Light',
  description: 'Street light on Main St has not worked for 3 days. Residents face safety issues at night.',
  category: 'safety',
  priority: 'high' as const,
  status: 'reported' as const,
  location: '123 Main Street, Sector 4',
  upvotes: 8,
  commentsCount: 2,
  reporterId: REPORTER_ID,
  reporter: { id: REPORTER_ID, name: 'Jaspreet Kaur' },
  assignedTo: null,
  assignedToId: null,
  resolutionNotes: undefined,
  resolutionProof: [] as string[],
  images: [] as string[],
  comments: [] as Comment[],
  latitude: 31.326,
  longitude: 75.576,
  voters: [] as string[],
  views: 0,
  createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  updatedAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
  reportedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  resolvedAt: undefined,
} satisfies Partial<Issue>;   // `satisfies` catches shape mismatches without widening literals

export const MOCK_ISSUE_ASSIGNED = {
  ...MOCK_ISSUE_REPORTED,
  id: 'issue-002',
  title: 'Blocked Drainage',
  status: 'assigned' as const,
  assignedToId: VOLUNTEER_ID,
  assignedTo: makeVolunteer(VOLUNTEER_ID, 'Arshdeep Singh'),
} satisfies Partial<Issue>;

export const MOCK_ISSUE_RESOLVED = {
  ...MOCK_ISSUE_REPORTED,
  id: 'issue-003',
  title: 'Repaired Footpath',
  status: 'resolved' as const,
  resolutionNotes: 'Repaved cracked section near park gate.',
  resolvedAt: new Date().toISOString(),
  assignedTo: makeVolunteer(VOLUNTEER_ID, 'Arshdeep Singh'),
  assignedToId: VOLUNTEER_ID,
} satisfies Partial<Issue>;

export const MOCK_ISSUES = [MOCK_ISSUE_REPORTED, MOCK_ISSUE_ASSIGNED, MOCK_ISSUE_RESOLVED];

// ── Comments ─────────────────────────────────

export const MOCK_COMMENTS: Partial<Comment>[] = [
  {
    id: 'cmt-001',
    text: 'This has been an issue for weeks!',
    userId: REPORTER_ID,
    user: { id: REPORTER_ID, name: 'Jaspreet Kaur', avatar: undefined, role: 'citizen' },
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    isEdited: false,
    isPinned: false,
    upvotes: 0,
    updatedAt: new Date().toISOString(),
    issueId: 'issue-001',
  },
  {
    id: 'cmt-002',
    text: 'Reported to municipal corporation yesterday.',
    userId: 'other-user',
    user: { id: 'other-user', name: 'Ranjit Singh', avatar: undefined, role: 'citizen' },
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    isEdited: false,
    isPinned: false,
    upvotes: 0,
    updatedAt: new Date().toISOString(),
    issueId: 'issue-001',
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