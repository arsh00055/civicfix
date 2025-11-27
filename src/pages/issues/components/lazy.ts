import { lazy } from 'react';

export const MyReportsHeader = lazy(() => import('./MyReportsHeader'));
export const ErrorBanner = lazy(() => import('./ErrorBanner'));
export const ReportsStats = lazy(() => import('./ReportsStats'));
export const ReportsFilters = lazy(() => import('./ReportsFilters'));
export const AuthRequired = lazy(() => import('./AuthRequired'));
export const LoadingState = lazy(() => import('./LoadingState'));
export const ErrorState = lazy(() => import('./ErrorState'));