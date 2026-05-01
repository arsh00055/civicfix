export interface Volunteer {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  skills: string[];
  certifications?: string[];
  status: 'available' | 'busy' | 'offline' | 'inactive';
  rating: number;
  totalTasks: number;
  completedTasks: number;
  joinedAt: string;
  lastActive: string;
  assignedToIssue?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;  
  rejectionReason?: string;
}

export interface VolunteerTask {
  id: string;
  issueId: string;
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'available' | 'claimed' | 'in_progress' | 'completed' | 'cancelled';
  claimedBy?: string;
  claimedAt?: string;
  estimatedTime?: number;
  requiredSkills?: string[];
  createdAt: string;
  updatedAt: string;
  issue?: {
    id: string;
    title: string;
    priority: string;
  };
}

export interface VolunteerAssignment {
  id: string;
  taskId: string;
  volunteerId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  assignedAt: string;
  completedAt?: string;
  task: VolunteerTask;
  volunteer?: Volunteer;
}

export interface VolunteerFilters {
  status?: Volunteer['status'];
  skills?: string[];
  location?: string;
  radius?: number;
  minRating?: number;
  availableOnly?: boolean;
  limit?: number;
  page?: number;
  sortBy?: 'rating' | 'tasks' | 'name' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

export interface VolunteerDashboardStats {
  completedTasks: number;
  activeTasks: number;
  totalClaimed: number;
  responseTime: string;
  rating: string;
  communityRank: string;
  points: number;
  level: number;
  averageResolutionHours: number;
}

export interface Assignment {
  id: string;
  taskId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'assigned' | 'in_progress' | 'pending_review' | 'resolved' | 'closed';
  location: string;
  claimedAt: string;
  updatedAt: string;
  progress: number;
  reporter?: { name: string; avatar?: string };
  resolutionNotes?: string;
  resolutionProof?: string[];
}

export interface AvailableTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  location: string;
  reportedBy: string;
  reportedAt: string;
  upvotes: number;
  images: string[];
  latitude?: number;
  longitude?: number;
  reporterId?: string;
  reporter?: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
    phone?: string;
  };
}

export interface VolunteerDashboardResponse {
  stats: VolunteerDashboardStats;
  myAssignments: Assignment[];
  availableTasks: AvailableTask[];
  recentNotifications: any[];
  communityStats: {
    totalVolunteers: number;
    activeVolunteers: number;
    totalIssuesResolved: number;
    averageRating: number;
  };
}