// cypress/e2e/issues/image-lightbox.cy.ts
//
// Covers:
//   • IssueDetailPage — image thumbnails and lightbox overlay

import { MOCK_ISSUE_REPORTED, stubSingleIssue, visitDetail } from './fixtures';

const issueWithImages = {
  ...MOCK_ISSUE_REPORTED,
  images: ['https://picsum.photos/seed/a/400/300', 'https://picsum.photos/seed/b/400/300'],
};

describe('IssueDetailPage — image lightbox', () => {
  beforeEach(() => {
    stubSingleIssue(issueWithImages);
    cy.loginAsCitizen();
    visitDetail('issue-001');
    cy.contains('button', 'Details').click();
  });

  it('renders attached image thumbnails', () => {
    cy.contains('Attached Images').should('be.visible');
    cy.get('img[alt="Issue evidence 1"]').should('be.visible');
  });

  it('clicking an image opens the lightbox overlay', () => {
    cy.get('img[alt="Issue evidence 1"]').click();
    cy.get('img[alt="Preview"]').should('be.visible');
  });

  it('clicking close button dismisses the lightbox', () => {
    cy.get('img[alt="Issue evidence 1"]').click();
    cy.get('img[alt="Preview"]').should('be.visible');
    cy.get('button').filter(':has(svg)').last().click();
    cy.get('img[alt="Preview"]').should('not.exist');
  });

  it('clicking overlay background dismisses the lightbox', () => {
    cy.get('img[alt="Issue evidence 1"]').click();
    cy.get('img[alt="Preview"]').should('be.visible');
    cy.get('.fixed.inset-0').first().click({ force: true });
    cy.get('img[alt="Preview"]').should('not.exist');
  });
});