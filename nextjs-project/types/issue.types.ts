export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  severity?: 'minor' | 'moderate' | 'severe' | 'emergency';
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  images: string[];
  videos?: string[];
  documents?: string[];
  reporterId: string;
  reporter?: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
    phone?: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
    role: 'volunteer' | 'admin';
    rating?: number;
  };
  upvotes: number;
  downvotes?: number;
  views: number;
  commentsCount: number;
  comments?: Comment[];
  tags?: string[];
  estimatedResolutionTime?: string;
  actualResolutionTime?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  reportedAt: string;
  reviewedAt?: string;
  assignedAt?: string;
  startedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  metadata?: Record<string, any>;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  text: string;
  attachments?: string[];
  parentId?: string;
  replies?: Comment[];
  upvotes: number;
  isEdited: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IssueFilters {
  status: string;
  category?: string;
  priority?: string;
  severity?: string;
  location?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  assignedTo?: string;
  reporterId?: string;
  tags?: string[];
  radius?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'votes' | 'comments';
  sortOrder?: 'asc' | 'desc';
}

export interface IssueStats {
  total: number;
  reported: number;
  inReview: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  bySeverity?: Record<string, number>;
  byLocation?: Record<string, number>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
  resolutionRate: number;
  averageResolutionTime: number;
  volunteerPerformance?: Array<{
    id: string;
    name: string;
    issuesResolved: number;
    averageTime: number;
    rating: number;
  }>;
}

export interface IssueReport {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  latitude: number;
  longitude: number;
  images?: File[];
  tags?: string[];
  anonymous?: boolean;
  notifyOnUpdate?: boolean;
}

export interface IssueUpdate {
  status?: Issue['status'];
  priority?: Issue['priority'];
  assignedToId?: string;
  estimatedResolutionTime?: string;
  resolutionNotes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface IssueVote {
  issueId: string;
  userId: string;
  type: 'upvote' | 'downvote';
  createdAt: string;
}

export interface IssueAssignment {
  issueId: string;
  volunteerId: string;
  assignedBy: string;
  assignedAt: string;
  estimatedCompletionTime?: string;
  notes?: string;
}

export interface IssueHistory {
  id: string;
  issueId: string;
  action: string;
  userId: string;
  userName: string;
  userRole: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  metadata?: Record<string, any>;
}