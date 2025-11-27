import { lazy } from 'react';

export const AnalyticsHeader = lazy(() => import('./AnalyticsHeader'));
export const ErrorBanner = lazy(() => import('./ErrorBanner'));
export const KeyMetrics = lazy(() => import('./KeyMetrics'));
export const IssuesByStatus = lazy(() => import('./IssuesByStatus'));
export const IssuesByCategory = lazy(() => import('./IssuesByCategory'));
export const IssueTrends = lazy(() => import('./IssueTrends'));
export const LoadingState = lazy(() => import('./LoadingState'));
export const ErrorState = lazy(() => import('./ErrorState'));