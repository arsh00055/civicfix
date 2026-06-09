import {
    REPORTER_ID,
    MOCK_ISSUE_REPORTED,
    MOCK_COMMENTS,
    stubSingleIssue,
    visitDetail,
    setReporterSession,
  } from './fixtures';
  
  // ═════════════════════════════════════════════
  // 1. Viewing comments
  // ═════════════════════════════════════════════
  
  describe('CommentSection — viewing', () => {
    beforeEach(() => {
        cy.loginAsCitizen();
      stubSingleIssue({ ...MOCK_ISSUE_REPORTED, comments: MOCK_COMMENTS });
      visitDetail('issue-001');
      cy.wait('@getIssue');
      cy.contains('button', 'Comments').click();
    });
  
    it('shows comments count heading', () => {
      cy.contains(/comments \(2\)/i).should('be.visible');
    });
  
    it('renders each comment with author name and text', () => {
      cy.contains('Jaspreet Kaur').should('exist');
      cy.contains('This has been an issue for weeks!').should('exist');
      cy.contains('Ranjit Singh').should('exist');
      cy.contains('Reported to municipal corporation yesterday.').should('exist');
    });
  });
  
  // ═════════════════════════════════════════════
  // 2. Adding a comment
  // ═════════════════════════════════════════════
  
  describe('CommentSection — adding a comment', () => {
    beforeEach(() => {
      stubSingleIssue({ ...MOCK_ISSUE_REPORTED, comments: [] });
      cy.loginAsCitizen();
      visitDetail('issue-001');
      cy.wait('@getIssue');
      cy.contains('button', 'Comments').click();
    });
  
    it('shows comment textarea for authenticated users', () => {
      cy.get('textarea[aria-label="Add a comment"]').should('be.visible');
    });
  
    it('submits a new comment and shows it in the list', () => {
      cy.intercept('POST', `/api/issues/issue-001/comments`, {
        statusCode: 200,
        body: {
          id: 'cmt-new',
          text: 'Great that someone noticed this!',
          userId: REPORTER_ID,
          user: { id: REPORTER_ID, name: 'Jaspreet Kaur', avatar: null },
          createdAt: new Date().toISOString(),
          isEdited: false,
        },
      }).as('addComment');
  
      cy.get('textarea[aria-label="Add a comment"]').type('Great that someone noticed this!');
      cy.contains('button', 'Post Comment').click();
      cy.wait('@addComment');
      cy.contains('Comment posted successfully').should('be.visible');
      cy.contains('Great that someone noticed this!').should('be.visible');
    });
  
    it('Post Comment button is disabled when textarea is empty', () => {
      cy.contains('button', 'Post Comment').should('be.disabled');
    });
  });
  
  // ═════════════════════════════════════════════
  // 3. Editing a comment
  // ═════════════════════════════════════════════
  
  describe('CommentSection — editing a comment', () => {
    beforeEach(() => {
        cy.loginAsCitizen();
      stubSingleIssue({ ...MOCK_ISSUE_REPORTED, comments: MOCK_COMMENTS });
      setReporterSession();
      visitDetail('issue-001');
        cy.wait('@getIssue');
        cy.contains('button', 'Comments').click();
    });
  
    it('shows Edit button for own comments', () => {
      cy.contains('This has been an issue for weeks!')
        .closest('.bg-white')
        .contains('button', 'Edit')
        .should('exist');
    });
  
    it('saves edited comment and shows (edited) label', () => {
      cy.intercept('PUT', `/api/issues/issue-001/comments?commentId=cmt-001`, {
        statusCode: 200,
        body: { success: true },
      }).as('editComment');
  
      cy.contains('This has been an issue for weeks!')
        .closest('.bg-white')
        .contains('button', 'Edit')
        .click();
  
      cy.get('textarea').last().clear().type('Updated comment text');
      cy.contains('button', 'Save').click();
      cy.wait('@editComment');
      cy.contains('Comment updated successfully').should('be.visible');
      cy.contains('Updated comment text').should('be.visible');
      cy.contains('(edited)').should('be.visible');
    });
  
    it('Cancel in edit mode restores original text', () => {
      cy.contains('This has been an issue for weeks!')
        .closest('.bg-white')
        .contains('button', 'Edit')
        .click();
  
      cy.get('textarea').last().clear().type('Something else');
      cy.contains('button', 'Cancel').last().click();
      cy.contains('This has been an issue for weeks!').should('be.visible');
      cy.contains('Something else').should('not.exist');
    });
  });
  
  // ═════════════════════════════════════════════
  // 4. Deleting a comment
  // ═════════════════════════════════════════════
  
  describe('CommentSection — deleting a comment', () => {
    beforeEach(() => {
      stubSingleIssue({ ...MOCK_ISSUE_REPORTED, comments: MOCK_COMMENTS });
      cy.loginAsCitizen();
      setReporterSession();
      cy.reload();
      visitDetail('issue-001');
      cy.wait('@getIssue');
      cy.contains('button', 'Comments').click();
    });
  
    it('opens delete confirm modal on Delete click', () => {
      cy.contains('This has been an issue for weeks!')
        .closest('.bg-white')
        .contains('button', 'Delete')
        .click();
      cy.contains('Delete Comment').should('be.visible');
      cy.contains('This action cannot be undone').should('be.visible');
    });
  
    it('Cancel in delete modal keeps comment in the list', () => {
      cy.contains('This has been an issue for weeks!')
        .closest('.bg-white')
        .contains('button', 'Delete')
        .click();
      cy.contains('button', 'Cancel').click();
      cy.contains('This has been an issue for weeks!').should('be.visible');
    });
  
    it('confirming deletion removes the comment', () => {
      cy.intercept('DELETE', `/api/issues/issue-001/comments?commentId=cmt-001`, {
        statusCode: 200,
        body: { success: true },
      }).as('deleteComment');
  
      cy.contains('This has been an issue for weeks!')
        .closest('.bg-white')
        .contains('button', 'Delete')
        .click();
      cy.contains('button', 'Delete').last().click();
      cy.wait('@deleteComment');
      cy.contains('Comment deleted successfully').should('be.visible');
      cy.contains('This has been an issue for weeks!').should('not.exist');
    });
  });