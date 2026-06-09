import {
    REPORTER_ID,
    MOCK_ISSUE_REPORTED,
    MOCK_ISSUE_RESOLVED,
    stubSingleIssue,
    stubRateCheck,
    setReporterSession,
    visitDetail,
  } from './fixtures';
  
  describe('ResolutionRating', () => {
    it('does NOT render rating widget for non-resolved issues', () => {
      stubSingleIssue(MOCK_ISSUE_REPORTED);
      cy.loginAsCitizen();
      cy.visit('/issues/issue-001');
      cy.wait('@getIssue');
      cy.contains('This issue has been resolved!').should('not.exist');
    });
  
    it('does NOT render rating widget for non-reporter viewers on resolved issues', () => {
      stubRateCheck('issue-003', { canRate: false });
      stubSingleIssue(MOCK_ISSUE_RESOLVED);
      cy.loginAsVolunteer();
      cy.visit('/issues/issue-003');
      cy.wait('@getIssue');
      cy.contains('This issue has been resolved!').should('not.exist');
    });
  
    it('shows rating widget for reporter on resolved issue', () => {
        cy.loginAsCitizen();
      stubRateCheck('issue-003', { canRate: true });
      stubSingleIssue({ ...MOCK_ISSUE_RESOLVED, reporterId: REPORTER_ID });
      setReporterSession();
      visitDetail('/issue-003');
      cy.wait('@getIssue');
      cy.wait('@getRateCheck');
      cy.contains('This issue has been resolved!').should('be.visible');
      cy.contains('How well was it handled?').should('be.visible');
    });
  
    it('allows selecting a star rating and shows label', () => {
        cy.loginAsCitizen();
      stubRateCheck('issue-003', { canRate: true });
      stubSingleIssue({ ...MOCK_ISSUE_RESOLVED, reporterId: REPORTER_ID });
      setReporterSession();
      visitDetail('/issue-003');
      cy.wait('@getIssue');
      cy.wait('@getRateCheck');
  
      cy.get('button[class*="transition-transform"]').eq(3).click(); // 4th star
      cy.contains('Very Good').should('be.visible');
    });
  
    it('submits rating and shows thank you message', () => {
      stubRateCheck('issue-003', { canRate: true });
      cy.intercept('POST', `/api/issues/issue-003/rate`, {
        statusCode: 200,
        body: { success: true },
      }).as('submitRating');
  
      stubSingleIssue({ ...MOCK_ISSUE_RESOLVED, reporterId: REPORTER_ID });
      cy.loginAsCitizen();
      setReporterSession();
      visitDetail('/issue-003');
      cy.wait('@getIssue');
      cy.wait('@getRateCheck');
  
      cy.get('button[class*="transition-transform"]').eq(4).click(); // 5 stars
      cy.contains('button', 'Submit Rating').click();
      cy.wait('@submitRating');
      cy.contains('Rating submitted successfully').should('be.visible');
    });
  
    it('shows previously submitted rating in read-only mode', () => {
      stubRateCheck('issue-003', {
        canRate: false,
        hasRated: true,
        rating: { score: 3, comment: 'Could have been faster.' },
      });
      stubSingleIssue({ ...MOCK_ISSUE_RESOLVED, reporterId: REPORTER_ID });
      cy.loginAsCitizen();
      setReporterSession();
      visitDetail('/issue-003');
      cy.wait('@getIssue');
      cy.wait('@getRateCheck');
  
      cy.contains('This issue has been resolved!').should('be.visible');
      cy.contains('Thank you for your feedback.').should('be.visible');
      cy.contains('Submit Rating').should('not.exist');
    });
  });