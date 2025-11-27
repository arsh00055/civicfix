import type { Issue, IssueFilters } from '../../../types';

export const getIssueStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    reported: 'Reported',
    in_review: 'In Review',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  return statusMap[status] || status;
};

export const getIssuePriorityDisplay = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };

  return priorityMap[priority] || priority;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    reported: 'gray',
    in_review: 'blue',
    assigned: 'yellow',
    in_progress: 'orange',
    resolved: 'green',
    closed: 'gray',
  };

  return colorMap[status] || 'gray';
};

export const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    low: 'green',
    medium: 'yellow',
    high: 'orange',
    critical: 'red',
  };

  return colorMap[priority] || 'gray';
};

export const canUserEditIssue = (issue: Issue, userId?: string, userRole?: string): boolean => {
  if (userRole === 'admin') return true;
  if (userRole === 'volunteer' && issue.volunteerId === userId) return true;
  if (issue.reporterId === userId) return true;
  return false;
};

export const canUserDeleteIssue = (issue: Issue, userId?: string, userRole?: string): boolean => {
  if (userRole === 'admin') return true;
  if (issue.reporterId === userId) return true;
  return false;
};

export const getNextStatus = (currentStatus: string, userRole: string): string | null => {
  const statusFlow: Record<string, string[]> = {
    reported: ['in_review', 'assigned'],
    in_review: ['assigned', 'reported'],
    assigned: ['in_progress', 'reported'],
    in_progress: ['resolved', 'assigned'],
    resolved: ['closed'],
  };

  const availableNextStatuses = statusFlow[currentStatus];
  if (!availableNextStatuses) return null;

  // Based on user role, determine which status transitions are allowed
  if (userRole === 'admin') {
    return availableNextStatuses[0]; // Admins can move to any next status
  } else if (userRole === 'volunteer') {
    // Volunteers can only move issues they've claimed forward
    return availableNextStatuses[0];
  }

  return null;
};

export const calculateIssueAge = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
};

export const isIssueUrgent = (issue: Issue): boolean => {
  const created = new Date(issue.createdAt);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  return issue.priority === 'critical' && diffInDays > 3 ||
         issue.priority === 'high' && diffInDays > 7 ||
         issue.votes > 20 && diffInDays > 14;
};

export const generateIssueSummary = (issues: Issue[]): {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  urgentCount: number;
} => {
  const summary = {
    total: issues.length,
    byStatus: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    urgentCount: 0,
  };

  issues.forEach(issue => {
    // Count by status
    summary.byStatus[issue.status] = (summary.byStatus[issue.status] || 0) + 1;
    
    // Count by priority
    summary.byPriority[issue.priority] = (summary.byPriority[issue.priority] || 0) + 1;
    
    // Count by category
    summary.byCategory[issue.category] = (summary.byCategory[issue.category] || 0) + 1;
    
    // Count urgent issues
    if (isIssueUrgent(issue)) {
      summary.urgentCount++;
    }
  });

  return summary;
};

export const filterIssues = (issues: Issue[], filters: IssueFilters): Issue[] => {
  let filtered = [...issues];

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(issue => issue.status === filters.status);
  }

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(issue => issue.category === filters.category);
  }

  // Apply priority filter
  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter(issue => issue.priority === filters.priority);
  }

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(issue =>
      issue.title.toLowerCase().includes(searchLower) ||
      issue.description.toLowerCase().includes(searchLower) ||
      issue.location.toLowerCase().includes(searchLower)
    );
  }

  // Apply location filter
  if (filters.location) {
    const locationLower = filters.location.toLowerCase();
    filtered = filtered.filter(issue =>
      issue.location.toLowerCase().includes(locationLower)
    );
  }

  return filtered;
};

export const sortIssues = (issues: Issue[], sortBy: string): Issue[] => {
  const sorted = [...issues];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    case 'priority':
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return sorted.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    
    case 'votes':
      return sorted.sort((a, b) => b.votes - a.votes);
    
    case 'location':
      return sorted.sort((a, b) => a.location.localeCompare(b.location));
    
    default:
      return sorted;
  }
};

export const validateIssueForm = (data: {
  title: string;
  description: string;
  category: string;
  location: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length < 5) {
    errors.title = 'Title must be at least 5 characters long';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  if (!data.description.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  } else if (data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (!data.location.trim()) {
    errors.location = 'Location is required';
  } else if (data.location.length < 5) {
    errors.location = 'Location must be at least 5 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const generateIssueId = (): string => {
  return `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getIssuesNearLocation = (issues: Issue[], lat: number, lng: number, radiusKm: number = 5): Issue[] => {
  return issues.filter(issue => {
    const distance = calculateDistance(lat, lng, issue.latitude, issue.longitude);
    return distance <= radiusKm;
  });
};