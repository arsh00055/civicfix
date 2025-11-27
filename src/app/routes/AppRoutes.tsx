import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import PageLoader from '../../components/UI/loading/PageLoader';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import HelpSupportPage from '../../pages/help/help';
import NotificationsPage from '../../pages/notifications/NotificationsPage';
import IssueDetail from '../../features/issues/components/IssueDetail/IssueDetail';

const lazyLoad = (importFunc: () => Promise<any>) => {
  return React.lazy(() => importFunc().catch(error => {
    console.error('Lazy loading error:', error);
    return { default: () => <div>Error loading component</div> };
  }));
};

const Login = lazyLoad(() => import('../../pages/login/LoginPage'));
const RegistrationPage = lazyLoad(() => import('../../pages/register/RegistrationPage'));
const Dashboard = lazyLoad(() => import('../../pages/dashboard/Dashboard'));
const MapPage = lazyLoad(() => import('../../pages/map/MapPage'));
const Profile = lazyLoad(() => import('../../pages/profile/ProfilePage'));
const ReportIssue = lazyLoad(() => import('../../pages/ReportIssue/ReportIssuePage'));
const NotFound = lazyLoad(() => import('../../pages/NotFound/NotFound'));

const MyReportsPage = lazyLoad(() => import('../../pages/issues/MyReportsPage'));
const AchievementsPage = lazyLoad(() => import('../../pages/profile/AchievementPage/AchievementsPage'));
const AvailableTasksPage = lazyLoad(() => import('../../pages/tasks/AvailableTasksPage/AvailableTasksPage'));
const MyAssignmentsPage = lazyLoad(() => import('../../pages/tasks/MyAssignmnetsPage/MyAssignmentsPage'));
const FindTasksPage = lazyLoad(() => import('../../pages/tasks/FindTasksPage/FindTasksPage'));
const UserManagementPage = lazyLoad(() => import('../../pages/admin/UserManagement/UserManagement'));
const AnalyticsPage = lazyLoad(() => import('../../pages/admin/AnalyticsPage/AnalyticsPage'));
const ReportsPage = lazyLoad(() => import('../../pages/admin/ReportsPage/ReportsPage'));

function AppRoutes(): React.ReactNode {
  const {userRole} = useAuth();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
            } 
          />
          
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? <RegistrationPage /> : <Navigate to="/dashboard" replace />
            } 
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['citizen', 'volunteer', 'admin']}>
                  <Dashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage role={ userRole }/>
              </ProtectedRoute>
            }
          />

          <Route 
            path="/issues/:id"
            element={
              <ProtectedRoute>
                <IssueDetail />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report-issue"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['citizen', 'volunteer']}>
                  <ReportIssue />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Notifications - Common for all roles */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage role={ userRole }/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpSupportPage role={ userRole }/>
              </ProtectedRoute>
            }
          />

          {/* CITIZEN ROUTES */}
          <Route
            path="/my-reports"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['citizen']}>
                  <MyReportsPage role={ userRole }/>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['citizen']}>
                  <AchievementsPage role={ userRole }/>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* VOLUNTEER ROUTES */}
          <Route
            path="/available-tasks"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['volunteer']}>
                  <AvailableTasksPage role={ userRole }/>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-assignments"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['volunteer']}>
                  <MyAssignmentsPage role={ userRole }/>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/find-tasks"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['volunteer']}>
                  <FindTasksPage role={ userRole }/>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <UserManagementPage role={ userRole }/>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AnalyticsPage role={ userRole }/>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <ReportsPage role={ userRole }/>
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Default routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;