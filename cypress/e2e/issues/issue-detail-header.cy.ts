import {
    REPORTER_ID,
    MOCK_ISSUE_REPORTED,
    MOCK_ISSUE_ASSIGNED,
    MOCK_ISSUE_RESOLVED,
    stubSingleIssue,
    stubIssuesList,
    visitDetail,
    setReporterSession,
  } from './fixtures';
  
  // ═════════════════════════════════════════════
  // 1. Header & metadata
  // ═════════════════════════════════════════════
  
  describe('IssueDetailPage — header & metadata', () => {
    beforeEach(() => {
      stubSingleIssue(MOCK_ISSUE_REPORTED);
      cy.loginAsCitizen();
      visitDetail('issue-001');
    });
  
    it('renders Back button and page heading', () => {
      cy.contains('button', /back/i).should('be.visible');
      cy.contains('Issue Details').should('be.visible');
    });
  
    it('displays issue title', () => {
      cy.contains('Broken Street Light').should('be.visible');
    });
  
    it('shows status badge', () => {
      cy.contains('REPORTED').should('be.visible');
    });
  
    it('shows priority badge', () => {
      cy.contains('HIGH PRIORITY').should('be.visible');
    });
  
    it('shows category badge', () => {
      cy.contains('SAFETY').should('be.visible');
    });
  
    it('shows location metadata card', () => {
      cy.contains('Location').should('be.visible');
      cy.contains('123 Main Street, Sector 4').should('be.visible');
    });
  
    it('shows reporter name', () => {
      cy.contains('Reporter').should('be.visible');
      cy.contains('Jaspreet Kaur').should('be.visible');
    });
  
    it('shows issue description', () => {
      cy.contains('Street light on Main St has not worked').should('be.visible');
    });
  
    it('shows coordinate section when lat/lng present', () => {
      cy.contains('button', 'Details').click();
      cy.contains('Location Coordinates').should('be.visible');
      cy.contains('31.326').should('be.visible');
    });
  
    it('Back button calls router.back()', () => {
        stubIssuesList();
        cy.visit('/issues');
        cy.wait('@getIssues').then(() => {
          stubSingleIssue(MOCK_ISSUE_REPORTED);
        });
        
        // ✅ Click View Details button, not the heading
        cy.contains('Broken Street Light')
          .closest('.issue-card, [data-testid="issue-card"], .bg-white, .border')
          .within(() => {
            cy.contains('button', 'View details').click();
          });
        
        cy.url().should('include', '/issues/issue-001');
        cy.contains('button', /back/i).click();
        cy.url().should('include', '/issues');
      });
  });
  
  // ═════════════════════════════════════════════
  // 2. Assigned volunteer banner
  // ═════════════════════════════════════════════
  
  describe('IssueDetailPage — assigned volunteer banner', () => {
    it('shows assigned volunteer banner when issue is assigned', () => {
      stubSingleIssue(MOCK_ISSUE_ASSIGNED);
      cy.loginAsCitizen();
      visitDetail('issue-002');
      cy.contains('Assigned Volunteer').should('be.visible');
      cy.contains('Arshdeep Singh').should('be.visible');
    });
  
    it('does NOT show volunteer banner for unassigned issues', () => {
      stubSingleIssue(MOCK_ISSUE_REPORTED);
      cy.loginAsCitizen();
      visitDetail('issue-001');
      cy.wait('@getIssue');
      cy.contains('Assigned Volunteer').should('not.exist');
    });
  });
  
  // ═════════════════════════════════════════════
  // 3. Resolution notes
  // ═════════════════════════════════════════════
  
  describe('IssueDetailPage — resolution notes', () => {
    it('shows resolution notes panel for resolved issue', () => {
      stubSingleIssue(MOCK_ISSUE_RESOLVED);
      cy.loginAsCitizen();
      visitDetail('issue-003');
      cy.contains('Resolution Notes').should('be.visible');
      cy.contains('Repaved cracked section near park gate.').should('be.visible');
    });
  
    it('does NOT show resolution notes for unresolved issue', () => {
      stubSingleIssue(MOCK_ISSUE_REPORTED);
      cy.loginAsCitizen();
      visitDetail('issue-001');
      cy.contains('Resolution Notes').should('not.exist');
    });
  });
  
  // ═════════════════════════════════════════════
  // 4. Edit button visibility
  // ═════════════════════════════════════════════
  
  describe('IssueDetailPage — Edit button', () => {
    it('shows Edit button when viewer is the reporter and status is "reported"', () => {
        cy.loginAsCitizen();
      stubSingleIssue(MOCK_ISSUE_REPORTED);
      setReporterSession();
      visitDetail('issue-001');
      cy.wait('@getIssue');
      cy.contains('button', /edit/i).should('be.visible');
    });
  
    it('does NOT show Edit button for non-reporter viewers', () => {
      stubSingleIssue(MOCK_ISSUE_REPORTED);
      cy.loginAsVolunteer();
      visitDetail('issue-001');
      cy.wait('@getIssue');
      cy.contains('button', /edit/i).should('not.exist');
    });
  
    it('does NOT show Edit button when status is not "reported"', () => {
      stubSingleIssue(MOCK_ISSUE_ASSIGNED);
      cy.loginAsCitizen();
      setReporterSession();
      visitDetail('issue-002');
      cy.contains('button', /edit/i).should('not.exist');
    });
  });
  
  // ═════════════════════════════════════════════
  // 5. Tabs
  // ═════════════════════════════════════════════
  
  describe('IssueDetailPage — Tabs', () => {
    beforeEach(() => {
      stubSingleIssue(MOCK_ISSUE_REPORTED);
      cy.loginAsCitizen();
      visitDetail('issue-001');
    });
  
    it('renders three tabs: Details, Comments, Timeline', () => {
      cy.contains('button', 'Details').should('be.visible');
      cy.contains('button', 'Comments').should('be.visible');
      cy.contains('button', 'Timeline').should('be.visible');
    });
  
    it('Details tab is active by default', () => {
      cy.contains('button', 'Details').should('have.attr', 'aria-selected', 'true');
    });
  
    it('clicking Comments tab shows comment section', () => {
      cy.intercept('GET', '/api/issues/issue-001/comments*', { statusCode: 200, body: [] }).as('getComments');
      cy.contains('button', 'Comments').click();
      cy.contains(/comments/i).should('be.visible');
    });
  
    it('clicking Timeline tab shows timeline section', () => {
      cy.contains('button', 'Timeline').click();
      cy.contains('Issue Timeline').should('be.visible');
      cy.contains('Issue Reported').should('be.visible');
    });
  });
  
  // ═════════════════════════════════════════════
  // 6. IssueTimeline
  // ═════════════════════════════════════════════
  
  describe('IssueTimeline', () => {
    it('shows "Issue Reported" event for all issues', () => {
      stubSingleIssue(MOCK_ISSUE_REPORTED);
      cy.loginAsCitizen();
      visitDetail('issue-001');
      cy.contains('button', 'Timeline').click();
      cy.contains('Issue Reported').should('be.visible');
      cy.contains('Jaspreet Kaur').should('be.visible');
    });
  
    it('shows "Assigned to Volunteer" event when issue is assigned', () => {
      stubSingleIssue(MOCK_ISSUE_ASSIGNED);
      cy.loginAsCitizen();
      visitDetail('issue-002');
      cy.contains('button', 'Timeline').click();
      cy.contains('Assigned to Volunteer').should('exist');
      cy.contains('Arshdeep Singh').should('exist');
    });
  
    it('shows "Issue Resolved" event for resolved issues', () => {
      stubSingleIssue(MOCK_ISSUE_RESOLVED);
      cy.loginAsCitizen();
      visitDetail('issue-003');
      cy.contains('button', 'Timeline').click();
      cy.contains('Issue Resolved').should('be.visible');
      cy.contains('successfully resolved').should('be.visible');
    });
  
    it('does NOT show resolved event for non-resolved issues', () => {
      stubSingleIssue(MOCK_ISSUE_REPORTED);
      cy.loginAsCitizen();
      visitDetail('issue-001');
      cy.contains('button', 'Timeline').click();
      cy.contains('Issue Resolved').should('not.exist');
    });
  });
  
  // ═════════════════════════════════════════════
  // 7. Error & not-found states
  // ═════════════════════════════════════════════
  
  describe('IssueDetailPage — error & not-found states', () => {
    it('shows error component on API failure', () => {
      cy.intercept('GET', '/api/issues/issue-999', {
        statusCode: 500,
        body: { message: 'Server error' },
      }).as('failIssue');
  
      cy.loginAsCitizen();
      cy.visit('/issues/issue-999');
      cy.wait('@failIssue');
      cy.contains(/failed to load issue/i).should('be.visible');
    });
  
    it('shows not-found UI when API returns null data', () => {
      cy.intercept('GET', '/api/issues/issue-404', {
        statusCode: 404,
        body: { error: 'Issue not found' },
      }).as('nullIssue');
  
      cy.loginAsCitizen();
      cy.visit('/issues/issue-404');
      cy.wait('@nullIssue');
      cy.contains('Issue Not Found').should('be.visible');
      cy.contains('Return to Issues').should('be.visible');
    });
  });