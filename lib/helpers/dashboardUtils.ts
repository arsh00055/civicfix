// lib/helpers/dashboardUtils.ts

/**
 * Unwrap API responses that may return data in several shapes:
 *   - raw array
 *   - { [key]: array }  e.g. { issues: [...] }, { users: [...] }
 *   - { data: array }
 *
 * Pass candidate keys in priority order.
 */
export function unwrapArray<T = any>(raw: any, ...keys: string[]): T[] {
    if (Array.isArray(raw)) return raw as T[];
    if (raw && typeof raw === 'object') {
      for (const key of keys) {
        if (Array.isArray(raw[key])) return raw[key] as T[];
      }
      if (Array.isArray(raw.data)) return raw.data as T[];
    }
    return [];
  }
  
  /**
   * Format relative time.
   * - Defined once at module level — never recreated on render
   * - Cascading divisions instead of re-dividing diffMs 3× separately
   */
  export function formatRelativeTime(dateString: string): string {
    if (!dateString) return 'Just now';
    const diffMins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60_000);
    if (diffMins < 1)   return 'Just now';
    if (diffMins < 60)  return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24); // reuses diffHours — no extra division
    if (diffDays < 7)   return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return new Date(dateString).toLocaleDateString();
  }
  
  /**
   * Unified notification formatter used by all 3 dashboards.
   * Accepts a welcomeMessage so each dashboard can customize the fallback.
   */
  export function formatNotifications(
    notifications: any[],
    welcomeMessage = 'Welcome to CivicFix!'
  ): any[] {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return [WELCOME_NOTIFICATION(welcomeMessage)];
    }
    return notifications.map((n: any) => ({
      id:        n.id || n._id,
      type:      n.type,
      title:     n.title,
      message:   n.message,
      time:      formatRelativeTime(n.createdAt),
      timestamp: n.createdAt,
      user:      extractUserFromNotification(n),
      actionUrl: n.actionUrl,
      metadata:  n.metadata || {},
    }));
  }
  
  /**
   * Single canonical user extractor — union of all metadata keys
   * used across citizen, volunteer, and admin dashboards.
   */
  export function extractUserFromNotification(notification: any): string {
    const m = notification.metadata;
    return (
      m?.userName ||
      m?.reporterName ||
      m?.volunteerName ||
      m?.commenterName ||
      m?.adminName ||
      'System'
    );
  }
  
  /**
   * Sort an array of objects by a date field (newest first) and slice.
   * Uses .slice() before .sort() to avoid mutating the original array.
   * Uses ISO string comparison — avoids O(N log N) Date allocations.
   */
  export function sortAndSliceByDate<T extends Record<string, any>>(
    arr: T[],
    dateKey: string,
    limit = 10
  ): T[] {
    return arr
      .slice() // shallow copy — never mutate source
      .sort((a, b) =>
        // ISO 8601 strings are lexicographically sortable — zero Date allocations
        a[dateKey] > b[dateKey] ? -1 : a[dateKey] < b[dateKey] ? 1 : 0
      )
      .slice(0, limit);
  }
  
  function WELCOME_NOTIFICATION(message: string) {
    return Object.freeze({
      id:        'welcome',
      type:      'welcome',
      title:     message,
      message:   'Your community platform is ready.',
      time:      'Just now',
      timestamp: new Date().toISOString(),
      user:      'System',
    });
  }