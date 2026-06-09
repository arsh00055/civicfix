// cypress/e2e/issues/available-tasks.cy.ts

const MOCK_TASKS = [
    {
      id: 'task-001',
      title: 'Fix Broken Street Light',
      description: 'Street light on Main St has been non-functional for 3 days. Residents are facing safety issues at night.',
      category: 'safety',
      priority: 'high',
      location: '123 Main Street, Sector 4',
      estimatedTime: '2 hours',
      reportedBy: 'Jaspreet Kaur',
    },
    {
      id: 'task-002',
      title: 'Clear Blocked Drainage',
      description: 'Drainage near the park entrance is blocked causing water logging.',
      category: 'sanitation',
      priority: 'medium',
      location: 'City Park Entrance',
      estimatedTime: '3 hours',
      reportedBy: 'Ranjit Singh',
    },
    {
      id: 'task-003',
      title: 'Repair Pavement',
      description: 'Cracked pavement on residential road posing tripping hazard.',
      category: 'infrastructure',
      priority: 'low',
      location: '45 Green Avenue',
      estimatedTime: '4 hours',
      reportedBy: null, // test optional field
    },
  ];
  
  const stubAvailableTasks = (tasks = MOCK_TASKS) => {
    cy.intercept('GET', '/api/issues/available*', {
      statusCode: 200,
      body: { tasks },
    }).as('getAvailableTasks');
  };
  
  const stubClaimTask = (taskId: string, success = true) => {
    cy.intercept('POST', `/api/issues/${taskId}/claim`, {
      statusCode: success ? 200 : 500,
      body: success
        ? { success: true, message: 'Task claimed successfully' }
        : { success: false, message: 'Failed to claim task' },
    }).as('claimTask');
  };
  
  // ─────────────────────────────────────────────
  // Test Suite
  // ─────────────────────────────────────────────
  
  describe('Available Tasks Page', () => {
  
    // ── Page Load & Header ───────────────────────
  
    describe('Page Load', () => {
      beforeEach(() => {
        stubAvailableTasks();
        cy.loginAsVolunteer();
        cy.visit('/tasks/available'); // ✅ Changed to /tasks/available
        cy.wait('@getAvailableTasks');
      });
  
      it('renders the page header with correct title', () => {
        cy.contains('Available Tasks').should('exist');
      });
  
      it('shows correct task count in the header subtitle', () => {
        cy.contains(`${MOCK_TASKS.length} tasks available`).should('exist');
      });
  
      it('renders the Refresh button', () => {
        cy.contains('button', 'Refresh').should('exist');
      });
    });
  
    // ── Task Cards ──────────────────────────────
  
    describe('Task Cards', () => {
      beforeEach(() => {
        stubAvailableTasks();
        cy.loginAsVolunteer();
        cy.visit('/tasks/available'); // ✅ Changed to /tasks/available
        cy.wait('@getAvailableTasks');
      });
  
      it('renders a card for each task', () => {
        cy.get('[data-cy="task-card"], .grid > div').should('have.length', MOCK_TASKS.length);
      });
  
      it('displays task title, priority badge, and category badge', () => {
        cy.contains('Fix Broken Street Light').should('be.visible');
        cy.contains('HIGH').should('be.visible');
        cy.contains('SAFETY').should('be.visible');
      });
  
      it('applies red badge for high priority task', () => {
        cy.contains('HIGH')
          .should('have.class', 'bg-red-100')
          .and('have.class', 'text-red-800');
      });
  
      it('applies yellow badge for medium priority task', () => {
        cy.contains('MEDIUM')
          .should('have.class', 'bg-yellow-100')
          .and('have.class', 'text-yellow-800');
      });
  
      it('applies green badge for low priority task', () => {
        cy.contains('LOW')
          .should('have.class', 'bg-green-100')
          .and('have.class', 'text-green-800');
      });
  
      it('displays task description', () => {
        cy.contains('Street light on Main St has been non-functional').should('be.visible');
      });
  
      it('displays task location', () => {
        cy.contains('123 Main Street, Sector 4').should('be.visible');
      });
  
      it('displays estimated time', () => {
        cy.contains('2 hours').should('be.visible');
      });
  
      it('displays "Reported by" when reportedBy is present', () => {
        cy.contains('Reported by: Jaspreet Kaur').should('be.visible');
      });
  
      it('does not show "Reported by" row when reportedBy is null', () => {
        // task-003 has no reportedBy — its card should not show "Reported by"
        cy.contains('Repair Pavement')
          .closest('.bg-white')
          .within(() => {
            cy.contains('Reported by').should('not.exist');
          });
      });
  
      it('renders a "Claim Task" button on each card', () => {
        cy.contains('button', 'Claim Task').should('have.length.at.least', 1);
      });
    });
  
    // ── Claiming a Task ─────────────────────────
  
    describe('Claim Task Flow', () => {
      beforeEach(() => {
        stubAvailableTasks();
        cy.loginAsVolunteer();
        cy.visit('/tasks/available'); // ✅ Changed to /tasks/available
        cy.wait('@getAvailableTasks');
      });
  
      it('shows "Claiming..." on the button while the request is in flight', () => {
        stubClaimTask('task-001');
  
        // Intercept with a delay to observe intermediate state
        cy.intercept('POST', '/api/issues/task-001/claim', (req) => {
          req.on('response', (res) => { res.setDelay(500); });
          req.reply({ statusCode: 200, body: { success: true } });
        }).as('claimTaskDelayed');
  
        cy.contains('Fix Broken Street Light')
          .closest('.bg-white')
          .contains('button', 'Claim Task')
          .click();
  
        cy.contains('button', 'Claiming...').should('be.visible');
      });
  
      it('removes the task card from the list after a successful claim', () => {
        stubClaimTask('task-001');
  
        cy.contains('Fix Broken Street Light')
          .closest('.bg-white')
          .contains('button', 'Claim Task')
          .click();
  
        cy.wait('@claimTask');
  
        cy.contains('Fix Broken Street Light').should('not.exist');
      });
  
      it('shows a success toast after claiming', () => {
        stubClaimTask('task-001');
  
        cy.contains('Fix Broken Street Light')
          .closest('.bg-white')
          .contains('button', 'Claim Task')
          .click();
  
        cy.wait('@claimTask');
        cy.contains('Task claimed successfully!').should('be.visible');
      });
  
      it('remaining tasks stay visible after one task is claimed', () => {
        stubClaimTask('task-001');
  
        cy.contains('Fix Broken Street Light')
          .closest('.bg-white')
          .contains('button', 'Claim Task')
          .click();
  
        cy.wait('@claimTask');
  
        cy.contains('Clear Blocked Drainage').should('be.visible');
        cy.contains('Repair Pavement').should('be.visible');
      });
  
      it('shows an error message when claiming fails', () => {
        stubClaimTask('task-001', false);
  
        cy.contains('Fix Broken Street Light')
          .closest('.bg-white')
          .contains('button', 'Claim Task')
          .click();
  
        cy.wait('@claimTask');
  
        cy.contains(/failed to claim task/i).should('exist');
      });
  
      it('disables the Claim Task button for the task being claimed', () => {
        cy.intercept('POST', '/api/issues/task-001/claim', (req) => {
          req.on('response', (res) => { res.setDelay(500); });
          req.reply({ statusCode: 200, body: { success: true } });
        }).as('claimTaskSlow');
  
        cy.contains('Fix Broken Street Light')
          .closest('.bg-white')
          .contains('button', 'Claim Task')
          .click();
  
        cy.contains('Fix Broken Street Light')
          .closest('.bg-white')
          .contains('button', 'Claiming...')
          .should('be.disabled');
      });
    });
  
    // ── Empty State ─────────────────────────────
  
    describe('Empty State', () => {
      beforeEach(() => {
        cy.intercept('GET', '/api/issues/available*', {
          statusCode: 200,
          body: { tasks: [] },
        }).as('getEmptyTasks');
  
        cy.loginAsVolunteer();
        cy.visit('/tasks/available'); // ✅ Changed to /tasks/available
        cy.wait('@getEmptyTasks');
      });
  
      it('shows empty state when no tasks are available', () => {
        cy.contains('No available tasks').should('be.visible');
      });
  
      it('shows descriptive empty state message', () => {
        cy.contains('All current tasks have been claimed').should('be.visible');
      });
  
      it('shows "Check Again" button in empty state', () => {
        cy.contains('button', 'Check Again').should('be.visible');
      });
  
      it('header subtitle shows "No available tasks"', () => {
        // The header paragraph shows count or "No available tasks"
        cy.contains('p', 'No available tasks').should('be.visible');
      });
    });
  
    // ── Refresh / Retry ─────────────────────────
  
    describe('Refresh', () => {
      it('Refresh button re-fetches tasks', () => {
        stubAvailableTasks();
        cy.loginAsVolunteer();
        cy.visit('/tasks/available'); // ✅ Changed to /tasks/available
        cy.wait('@getAvailableTasks');
  
        // Set up a second intercept for the refresh call
        cy.intercept('GET', '/api/issues/available*', {
          statusCode: 200,
          body: { tasks: [MOCK_TASKS[0]] },
        }).as('refreshTasks');
  
        cy.contains('button', 'Refresh').click();
        cy.wait('@refreshTasks');
  
        // Only the first task should now be visible
        cy.contains('Fix Broken Street Light').should('be.visible');
        cy.contains('Clear Blocked Drainage').should('not.exist');
      });
  
      it('"Check Again" button in empty state triggers a re-fetch', () => {
        cy.intercept('GET', '/api/issues/available*', {
          statusCode: 200,
          body: { tasks: [] },
        }).as('getEmptyTasks');
  
        cy.loginAsVolunteer();
        cy.visit('/tasks/available'); // ✅ Changed to /tasks/available
        cy.wait('@getEmptyTasks');
  
        cy.intercept('GET', '/api/issues/available*', {
          statusCode: 200,
          body: { tasks: MOCK_TASKS },
        }).as('refetchTasks');
  
        cy.contains('button', 'Check Again').click();
        cy.wait('@refetchTasks');
  
        cy.contains('Fix Broken Street Light').should('be.visible');
      });
    });
  
    // ── Error State ─────────────────────────────
  
    describe('Error State', () => {
      it('shows an error message when the API call fails', () => {
        cy.intercept('GET', '/api/issues/available*', {
          statusCode: 500,
          body: { message: 'Internal Server Error' },
        }).as('failedTasks');
  
        cy.loginAsVolunteer();
        cy.visit('/tasks/available');
        cy.wait('@failedTasks');
  
        cy.contains(/failed to load tasks/i).should('exist');
      });
    });
  });