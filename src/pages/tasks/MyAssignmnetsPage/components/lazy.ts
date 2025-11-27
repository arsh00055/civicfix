import { lazy } from 'react';

export const MyAssignmentsHeader = lazy(() => import('./MyAssignmentsHeader'));
export const ErrorBanner = lazy(() => import('./ErrorBanner'));
export const AssignmentsStats = lazy(() => import('./AssignmentStats'));
export const AssignmentsFilters = lazy(() => import('./AssignmentsFilters'));
export const AssignmentsList = lazy(() => import('./AssignmentList'));
export const LoadingState = lazy(() => import('./LoadingState'));
export const ErrorState = lazy(() => import('./ErrorState'));