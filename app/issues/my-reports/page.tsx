'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';
import type { Issue } from '@/types/issue.types';
import {
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid';

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  reported:    { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-400',  label: 'Reported'    },
  in_review:   { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400',    label: 'In Review'   },
  assigned:    { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-400',  label: 'Assigned'    },
  in_progress: { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-400',  label: 'In Progress' },
  resolved:    { bg: 'bg-green-50',   text: 'text-green-700',   dot: 'bg-green-500',   label: 'Resolved'    },
  closed:      { bg: 'bg-gray-50',    text: 'text-gray-600',    dot: 'bg-gray-400',    label: 'Closed'      },
};

const PRIORITY_STYLES: Record<string, { border: string; text: string; label: string }> = {
  critical: { border: 'border-l-red-500',    text: 'text-red-600',    label: 'Critical' },
  high:     { border: 'border-l-orange-500', text: 'text-orange-600', label: 'High'     },
  medium:   { border: 'border-l-yellow-500', text: 'text-yellow-600', label: 'Medium'   },
  low:      { border: 'border-l-green-500',  text: 'text-green-600',  label: 'Low'      },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.reported;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function MyReportsPage() {
  const router  = useRouter();
  const { user } = useAuth();

  const [issues, setIssues]     = useState<Issue[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (status) params.status = status;
      if (search) params.search = search;

      const res  = await apiClient.get('/issues/my-reports', { params });
      const data = res.data;
      setIssues(data.issues || []);
      setTotal(data.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load your reports.');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchReports(); }, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { fetchReports(); }, [page, status]);

  const { resolved, inProgress, pending } = useMemo(() => {
    let resolved = 0, inProgress = 0, pending = 0;
    for (const i of issues) {
      if (i.status === 'resolved') resolved++;
      else if (i.status === 'assigned' || i.status === 'in_progress') inProgress++;
      else if (i.status === 'reported' || i.status === 'in_review') pending++;
    }
    return { resolved, inProgress, pending };
  }, [issues]);

  return (
    <MainLayout role={user?.role ?? null}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
                <p className="text-sm text-gray-500">{total} issue{total !== 1 ? 's' : ''} reported</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchReports}
                className="flex gap-1.5 text-green-500 items-center px-4 py-2 text-sm cursor-pointer  hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => router.push('/issues/new')}
                className="flex cursor-pointer items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Report New
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard value={total}      label="Total"       color="text-gray-800" />
            <StatCard value={pending}    label="Pending"     color="text-yellow-600" />
            <StatCard value={inProgress} label="In Progress" color="text-blue-600" />
            <StatCard value={resolved}   label="Resolved"    color="text-green-600" />
          </div>

          {/* ── Search & Filter ── */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search your reports…"
                  className="w-full text-black pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                  showFilters || status
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="h-4 w-4" />
                Filter
                {status && <span className="ml-1 w-2 h-2 rounded-full bg-blue-500" />}
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-gray-200">
                {['', 'reported', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatus(s); setPage(1); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      status === s
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {s === '' ? 'All Status' : STATUS_STYLES[s]?.label || s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              {error}
              <button onClick={fetchReports} className="ml-auto font-medium underline">Retry</button>
            </div>
          )}

          {/* ── List ── */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 p-5">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                {search || status ? 'No results found' : 'No reports yet'}
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                {search || status
                  ? 'Try adjusting your filters.'
                  : 'Report an issue in your community to get started.'}
              </p>
              {!search && !status && (
                <button
                  onClick={() => router.push('/issues/new')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Report Your First Issue
                </button>
              )}
              {(search || status) && (
                <button
                  onClick={() => { setSearch(''); setStatus(''); }}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map(issue => {
                const p = PRIORITY_STYLES[issue.priority] || PRIORITY_STYLES.low;
                return (
                  <button
                    key={issue.id}
                    onClick={() => router.push(`/issues/${issue.id}`)}
                    className={`w-full cursor-pointer text-left bg-white rounded-xl border border-gray-100 border-l-4 ${p.border} shadow-sm hover:shadow-md transition-all p-5`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <StatusBadge status={issue.status} />
                          <span className={`text-xs font-medium ${p.text}`}>
                            {p.label} Priority
                          </span>
                          <span className="text-xs text-gray-400 capitalize">
                            {issue.category.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-2">
                          {issue.title}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                          {issue.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {issue.location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[180px]">{issue.location}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {timeAgo(issue.createdAt)}
                          </span>
                          {(issue.upvotes ?? 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <HandThumbUpSolid className="w-6 h-6 text-blue-600" /> {issue.upvotes}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRightIcon className="h-4 w-4 text-gray-300 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}