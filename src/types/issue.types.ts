export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  location: string;
  latitude: number;
  longitude: number;
  images: string[];
  reporterId: string;
  reporter?: {
    id: string;
    name: string;
    avatar?: string;
  };
  volunteerId?: string;
  volunteer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  votes: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Comment {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
}

export interface IssueFilters {
  status: string;
  category: string;
  priority: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search: string;
}

export interface IssueStats {
  total: number;
  reported: number;
  inProgress: number;
  resolved: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}