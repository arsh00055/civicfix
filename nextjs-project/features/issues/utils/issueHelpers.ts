import type { Issue, IssueFilters } from '@/types/issue.types';

export const getIssueStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    reported: 'Reported',
    in_review: 'In Review',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

export const getIssuePriorityDisplay = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };

  return priorityMap[priority] || priority.charAt(0).toUpperCase() + priority.slice(1);
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
  if (!userId) return false;
  if (userRole === 'admin') return true;
  if (userRole === 'volunteer' && issue.assignedTo?.id === userId) return true;
  if (issue.reporter?.id === userId) return true;
  return false;
};

export const canUserDeleteIssue = (issue: Issue, userId?: string, userRole?: string): boolean => {
  if (!userId) return false;
  if (userRole === 'admin') return true;
  if (issue.reporter?.id === userId) return true;
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

  if (userRole === 'admin') {
    return availableNextStatuses[0];
  } else if (userRole === 'volunteer') {
    return availableNextStatuses[0];
  }

  return null;
};

export const calculateIssueAge = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInMs = now.getTime() - created.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
  }
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }
  if (diffInDays < 7) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  }
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffInDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
};

export const isIssueUrgent = (issue: Issue): boolean => {
  const created = new Date(issue.createdAt);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  return (
    (issue.priority === 'critical' && diffInDays > 3) ||
    (issue.priority === 'high' && diffInDays > 7) ||
    (issue.upvotes > 20 && diffInDays > 14)
  );
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
    summary.byStatus[issue.status] = (summary.byStatus[issue.status] || 0) + 1;
    summary.byPriority[issue.priority] = (summary.byPriority[issue.priority] || 0) + 1;
    summary.byCategory[issue.category] = (summary.byCategory[issue.category] || 0) + 1;
    
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

  // Apply date range filter
  if (filters.dateRange?.start) {
    const startDate = new Date(filters.dateRange.start);
    filtered = filtered.filter(issue => new Date(issue.createdAt) >= startDate);
  }
  if (filters.dateRange?.end) {
    const endDate = new Date(filters.dateRange.end);
    filtered = filtered.filter(issue => new Date(issue.createdAt) <= endDate);
  }

  // Apply assignedTo filter
  if (filters.assignedTo) {
    filtered = filtered.filter(issue => issue.assignedTo?.id === filters.assignedTo);
  }

  // Apply reporter filter
  if (filters.reporterId) {
    filtered = filtered.filter(issue => issue.reporter?.id === filters.reporterId);
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
      return sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    
    case 'location':
      return sorted.sort((a, b) => a.location.localeCompare(b.location));
    
    case 'updated':
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    default:
      return sorted;
  }
};

export interface IssueFormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateIssueForm = (data: {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
}): IssueFormValidationResult => {
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
  } else if (data.description.length > 2000) {
    errors.description = 'Description must be less than 2000 characters';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (!data.location.trim()) {
    errors.location = 'Location description is required';
  } else if (data.location.length < 5) {
    errors.location = 'Location must be at least 5 characters long';
  }

  if (data.latitude === undefined || data.longitude === undefined) {
    errors.location = 'Please select a location on the map';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const generateIssueId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `issue_${timestamp}_${random}`;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

export const getIssuesNearLocation = (
  issues: Issue[], 
  lat: number, 
  lng: number, 
  radiusKm: number = 5
): Issue[] => {
  return issues.filter(issue => {
    if (!issue.latitude || !issue.longitude) return false;
    const distance = calculateDistance(lat, lng, issue.latitude, issue.longitude);
    return distance <= radiusKm;
  });
};

export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const getCategoryDisplayName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    infrastructure: 'Infrastructure',
    safety: 'Safety',
    environment: 'Environment',
    public_services: 'Public Services',
    other: 'Other',
  };

  return categoryMap[category] || category.replace('_', ' ').charAt(0).toUpperCase() + 
    category.replace('_', ' ').slice(1);
};

export const shouldNotifyVolunteers = (issue: Issue): boolean => {
  return issue.priority === 'critical' || issue.priority === 'high';
};