# CivicFix

CivicFix is a multi-role civic issue reporting and management platform designed to connect citizens, volunteers, and administrators for reporting and managing community issues.

## Features

- Role-based access for Citizens, Volunteers, and Admins
- User registration and login
- JWT-based authentication
- Password reset flow
- Create and manage civic issues
- Browse, filter, and sort reported issues
- Personal "My Reports" section
- Map-based issue visualization
- Volunteer task and assignment management
- Admin dashboard
- Notifications and activity tracking
- Leaderboard and achievements
- Community bulletin and polls
- User profile, privacy, location, and statistics
- Help center, FAQs, and support contact

## Tech Stack

- Next.js
- React
- TypeScript
- Redux Toolkit
- MongoDB
- REST APIs
- JWT Authentication
- Tailwind CSS
- Jest
- React Testing Library
- Cypress

## Testing

The project includes both unit/component testing and end-to-end testing.

### Unit & Component Testing

- Jest
- React Testing Library

### End-to-End Testing

- Cypress
- Authentication flows
- Issue-related flows
- Notifications
- Volunteer/admin flows

## Project Structure

```text
app/
├── (auth)/              # Authentication pages
├── (dashboard)/         # Role-based dashboards
├── api/                 # API routes
├── issues/              # Issue management
├── map/                 # Map-based issue view
├── notifications/       # Notifications
├── profile/             # User profile
├── tasks/               # Volunteer tasks
├── help/                # Help and support
└── polls/               # Community polls

components/              # Reusable UI components
hooks/                   # Custom React hooks
lib/                     # Services and utilities
cypress/                 # Cypress E2E tests
__tests__/               # Jest/RTL tests