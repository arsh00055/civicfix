import { USER_ROLES, ISSUE_STATUS, ISSUE_PRIORITY, ISSUE_CATEGORIES } from '../helpers/constants';

export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    [USER_ROLES.CITIZEN]: 'Citizen',
    [USER_ROLES.VOLUNTEER]: 'Community Volunteer',
    [USER_ROLES.ADMIN]: 'Administrator',
  };
  
  return roleNames[role] || 'User';
};

export const getStatusDisplayName = (status: string): string => {
  const statusNames: Record<string, string> = {
    [ISSUE_STATUS.REPORTED]: 'Reported',
    [ISSUE_STATUS.IN_REVIEW]: 'Under Review',
    [ISSUE_STATUS.ASSIGNED]: 'Assigned',
    [ISSUE_STATUS.IN_PROGRESS]: 'In Progress',
    [ISSUE_STATUS.RESOLVED]: 'Resolved',
    [ISSUE_STATUS.CLOSED]: 'Closed',
  };
  
  return statusNames[status] || status;
};

export const getPriorityDisplayName = (priority: string): string => {
  const priorityNames: Record<string, string> = {
    [ISSUE_PRIORITY.LOW]: 'Low',
    [ISSUE_PRIORITY.MEDIUM]: 'Medium',
    [ISSUE_PRIORITY.HIGH]: 'High',
    [ISSUE_PRIORITY.CRITICAL]: 'Critical',
  };
  
  return priorityNames[priority] || priority;
};

export const getCategoryDisplayName = (category: string): string => {
  const categoryObj = ISSUE_CATEGORIES.find(cat => cat.value === category);
  return categoryObj?.label || category;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    [ISSUE_STATUS.REPORTED]: '#6B7280',
    [ISSUE_STATUS.IN_REVIEW]: '#3B82F6',
    [ISSUE_STATUS.ASSIGNED]: '#8B5CF6',
    [ISSUE_STATUS.IN_PROGRESS]: '#F59E0B',
    [ISSUE_STATUS.RESOLVED]: '#10B981',
    [ISSUE_STATUS.CLOSED]: '#374151',
  };
  
  return colors[status] || '#6B7280';
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    [ISSUE_PRIORITY.LOW]: '#10B981',
    [ISSUE_PRIORITY.MEDIUM]: '#F59E0B',
    [ISSUE_PRIORITY.HIGH]: '#EF4444',
    [ISSUE_PRIORITY.CRITICAL]: '#DC2626',
  };
  
  return colors[priority] || '#6B7280';
};

export const getCategoryColor = (category: string): string => {
  const categoryObj = ISSUE_CATEGORIES.find(cat => cat.value === category);
  return categoryObj?.color || '#6B7280';
};

export const getCategoryIcon = (category: string): string => {
  const categoryObj = ISSUE_CATEGORIES.find(cat => cat.value === category);
  return categoryObj?.icon || '📋';
};

export const getNextStatus = (currentStatus: string): string[] => {
  const statusFlow: Record<string, string[]> = {
    [ISSUE_STATUS.REPORTED]: [ISSUE_STATUS.IN_REVIEW, ISSUE_STATUS.ASSIGNED],
    [ISSUE_STATUS.IN_REVIEW]: [ISSUE_STATUS.ASSIGNED, ISSUE_STATUS.REPORTED],
    [ISSUE_STATUS.ASSIGNED]: [ISSUE_STATUS.IN_PROGRESS, ISSUE_STATUS.REPORTED],
    [ISSUE_STATUS.IN_PROGRESS]: [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.ASSIGNED],
    [ISSUE_STATUS.RESOLVED]: [ISSUE_STATUS.CLOSED],
  };
  
  return statusFlow[currentStatus] || [];
};

export const getStatusProgress = (status: string): number => {
  const progress: Record<string, number> = {
    [ISSUE_STATUS.REPORTED]: 20,
    [ISSUE_STATUS.IN_REVIEW]: 40,
    [ISSUE_STATUS.ASSIGNED]: 60,
    [ISSUE_STATUS.IN_PROGRESS]: 80,
    [ISSUE_STATUS.RESOLVED]: 100,
    [ISSUE_STATUS.CLOSED]: 100,
  };
  
  return progress[status] || 0;
};

export const getPriorityWeight = (priority: string): number => {
  const weights: Record<string, number> = {
    [ISSUE_PRIORITY.LOW]: 1,
    [ISSUE_PRIORITY.MEDIUM]: 2,
    [ISSUE_PRIORITY.HIGH]: 3,
    [ISSUE_PRIORITY.CRITICAL]: 4,
  };
  
  return weights[priority] || 0;
};

export const getUserRolePermissions = (role: string): string[] => {
  const permissions: Record<string, string[]> = {
    [USER_ROLES.CITIZEN]: ['report_issues', 'vote_issues', 'comment', 'view_map'],
    [USER_ROLES.VOLUNTEER]: ['report_issues', 'claim_issues', 'update_status', 'view_assigned', 'comment', 'view_map'],
    [USER_ROLES.ADMIN]: ['manage_users', 'manage_issues', 'view_reports', 'system_settings', 'all_permissions'],
  };
  
  return permissions[role] || [];
};

export const canPerformAction = (role: string, action: string): boolean => {
  const permissions = getUserRolePermissions(role);
  return permissions.includes('all_permissions') || permissions.includes(action);
};

export const getRouteForRole = (role: string): string => {
  const routes: Record<string, string> = {
    [USER_ROLES.CITIZEN]: '/dashboard/citizen',
    [USER_ROLES.VOLUNTEER]: '/dashboard/volunteer',
    [USER_ROLES.ADMIN]: '/dashboard/admin/analytics',
  };
  
  return routes[role] || '/dashboard';
};