import { lazy } from 'react';

export const UserManagementHeader = lazy(() => import('./UserManagementHeader'));
export const ErrorBanner = lazy(() => import('./ErrorBanner'));
export const UserStats = lazy(() => import('./UsersStats'));
export const UserFilters = lazy(() => import('./UserFilters'));
export const UsersTable = lazy(() => import('./UsersTable'));
export const LoadingState = lazy(() => import('./LoadingState'));
export const ErrorState = lazy(() => import('./ErrorState'));