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