import { lazy } from 'react';

export const AvailableTasksHeader = lazy(() => import('./AvailableTasksHeader'));
export const ErrorBanner = lazy(() => import('./ErrorBanner'));
export const TasksStats = lazy(() => import('./TasksStats'));
export const TasksFilters = lazy(() => import('./TasksFilters'));
export const TasksGrid = lazy(() => import('./TasksGrid'));
export const LoadingState = lazy(() => import('./LoadingState'));
export const ErrorState = lazy(() => import('./ErrorState'));