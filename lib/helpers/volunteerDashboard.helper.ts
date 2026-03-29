// lib/helpers/volunteerDashboard.helper.ts
import { issuesAPI, usersAPI, volunteersAPI, notificationsAPI, analyticsAPI } from '@/lib/services/api/endpoints';
import type { Issue } from '@/types/issue.types';

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

export interface VolunteerDashboardData {
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

export interface VolunteerDashboardResponse {
  stats: VolunteerDashboardStats;
  myAssignments: Assignment[];
  availableTasks: AvailableTask[];
  recentNotifications: any[];
  communityStats: VolunteerDashboardData['communityStats'];
}

/**
 * Fetch all dashboard data for a volunteer user
 */
export async function fetchVolunteerDashboard(userId: string): Promise<VolunteerDashboardResponse> {
  try {
    // Fetch all required data in parallel
    const [
      userProfile,
      assignmentsResponse,
      availableTasksResponse,
      notificationsResponse,
      analyticsResponse
    ] = await Promise.all([
      usersAPI.getUser(userId).catch(() => ({ data: null })),
      volunteersAPI.getMyAssignments().catch(() => ({ data: { assignments: [] } })),
      issuesAPI.getAvailableTasks().catch(() => ({ data: { tasks: [] } })),
      notificationsAPI.getNotifications().catch(() => ({ data: { notifications: [] } })),
      analyticsAPI.getOverview({ timeframe: 'month' }).catch(() => ({ data: null })),
    ]);

    const userData = userProfile.data;
    const analyticsData = analyticsResponse.data;
    
    // Process assignments
    let assignmentsData: any[] = [];
    const assignmentsRaw = assignmentsResponse.data;
    if (Array.isArray(assignmentsRaw)) {
      assignmentsData = assignmentsRaw;
    } else if (assignmentsRaw && Array.isArray(assignmentsRaw.assignments)) {
      assignmentsData = assignmentsRaw.assignments;
    } else if (assignmentsRaw && Array.isArray(assignmentsRaw.data)) {
      assignmentsData = assignmentsRaw.data;
    }
    
    // Process available tasks
    let tasksData: any[] = [];
    const tasksRaw = availableTasksResponse.data;
    if (Array.isArray(tasksRaw)) {
      tasksData = tasksRaw;
    } else if (tasksRaw && Array.isArray(tasksRaw.tasks)) {
      tasksData = tasksRaw.tasks;
    } else if (tasksRaw && Array.isArray(tasksRaw.data)) {
      tasksData = tasksRaw.data;
    }
    
    // Process notifications
    let notificationsData: any[] = [];
    const notificationsRaw = notificationsResponse.data;
    if (Array.isArray(notificationsRaw)) {
      notificationsData = notificationsRaw;
    } else if (notificationsRaw && Array.isArray(notificationsRaw.notifications)) {
      notificationsData = notificationsRaw.notifications;
    } else if (notificationsRaw && Array.isArray(notificationsRaw.data)) {
      notificationsData = notificationsRaw.data;
    }
    
    // Sort notifications by newest first
    const recentNotifications = notificationsData
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    // Calculate stats from user data
    const volunteerStats = userData?.volunteerStats || {};
    const userStats = userData?.stats || {};
    
    const completedTasks = volunteerStats.tasksCompleted || 0;
    const activeTasks = assignmentsData.filter(a => 
      a.status === 'assigned' || a.status === 'in_progress'
    ).length;
    const totalClaimed = volunteerStats.totalClaimed || 0;
    
    // Calculate average response time from completed assignments
    let avgResolutionHours = 0;
    const completedAssignments = assignmentsData.filter(a => 
      a.status === 'resolved' && a.claimedAt && a.updatedAt
    );
    
    if (completedAssignments.length > 0) {
      const totalHours = completedAssignments.reduce((sum: number, a: any) => {
        const claimed = new Date(a.claimedAt);
        const resolved = new Date(a.updatedAt);
        const hours = (resolved.getTime() - claimed.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgResolutionHours = Math.round(totalHours / completedAssignments.length);
    }
    
    const responseTime = avgResolutionHours > 0 
      ? avgResolutionHours < 24 
        ? `${avgResolutionHours}h`
        : `${Math.round(avgResolutionHours / 24)}d`
      : 'N/A';
    
    const rating = volunteerStats.averageRating || '0.0';
    const points = userStats.points || 0;
    const level = userStats.level || 1;
    
    // Calculate community rank based on completed tasks
    let communityRank = 'Volunteer';
    if (completedTasks >= 100) communityRank = 'Hero Volunteer';
    else if (completedTasks >= 50) communityRank = 'Elite Volunteer';
    else if (completedTasks >= 25) communityRank = 'Senior Volunteer';
    else if (completedTasks >= 10) communityRank = 'Active Volunteer';
    else if (completedTasks >= 5) communityRank = 'Regular Volunteer';
    
    // Get community stats from analytics
    const activeVolunteers = analyticsData?.overview?.activeVolunteers ?? 0;
    const totalIssuesResolved = analyticsData?.overview?.resolvedIssues ?? 0;
    
    const stats: VolunteerDashboardStats = {
      completedTasks,
      activeTasks,
      totalClaimed,
      responseTime,
      rating: typeof rating === 'number' ? rating.toFixed(1) : rating,
      communityRank,
      points,
      level,
      averageResolutionHours: avgResolutionHours,
    };
    
    // Format assignments
    const formattedAssignments = formatAssignments(assignmentsData);
    
    // Format available tasks
    const formattedTasks = formatAvailableTasks(tasksData);
    
    // Format notifications
    const formattedNotifications = formatNotifications(recentNotifications);

    return {
      stats,
      myAssignments: formattedAssignments,
      availableTasks: formattedTasks,
      recentNotifications: formattedNotifications,
      communityStats: {
        totalVolunteers: activeVolunteers,
        activeVolunteers,
        totalIssuesResolved,
        averageRating: parseFloat(rating),
      },
    };

  } catch (error) {
    console.error('Error fetching volunteer dashboard:', error);
    return {
      stats: {
        completedTasks: 0,
        activeTasks: 0,
        totalClaimed: 0,
        responseTime: 'N/A',
        rating: '0.0',
        communityRank: 'Volunteer',
        points: 0,
        level: 1,
        averageResolutionHours: 0,
      },
      myAssignments: [],
      availableTasks: [],
      recentNotifications: [],
      communityStats: {
        totalVolunteers: 0,
        activeVolunteers: 0,
        totalIssuesResolved: 0,
        averageRating: 0,
      },
    };
  }
}

/**
 * Format assignments for display
 */
function formatAssignments(assignments: any[]): Assignment[] {
  if (!Array.isArray(assignments)) {
    console.warn('formatAssignments received non-array:', assignments);
    return [];
  }
  
  return assignments.map((assignment: any) => {
    let progress = 0;
    if (assignment.status === 'assigned') progress = 25;
    else if (assignment.status === 'in_progress') progress = 50;
    else if (assignment.status === 'pending_review') progress = 75;
    else if (assignment.status === 'resolved') progress = 100;
    
    return {
      id: assignment.id || assignment._id,
      taskId: assignment.taskId || assignment.id,
      title: assignment.title || 'Untitled',
      description: assignment.description || '',
      category: assignment.category || 'general',
      priority: assignment.priority || 'medium',
      status: assignment.status || 'assigned',
      location: assignment.location || '',
      claimedAt: assignment.claimedAt || assignment.assignedAt || new Date().toISOString(),
      updatedAt: assignment.updatedAt || new Date().toISOString(),
      progress,
      reporter: assignment.reporter || { name: assignment.reportedBy || 'Community Member' },
      resolutionNotes: assignment.resolutionNotes,
      resolutionProof: assignment.resolutionProof,
    };
  });
}

/**
 * Format available tasks for display
 */
// lib/helpers/volunteerDashboard.helper.ts - Update formatAvailableTasks

function formatAvailableTasks(tasks: any[]): AvailableTask[] {
    if (!Array.isArray(tasks)) {
      console.warn('formatAvailableTasks received non-array:', tasks);
      return [];
    }
    
    return tasks.map((task: any) => ({
      id: task.id || task._id,
      title: task.title || 'Untitled',
      description: task.description || '',
      category: task.category || 'general',
      priority: task.priority || 'medium',
      location: task.location || '',
      reportedBy: task.reporter?.name || task.reportedBy || 'Community Member',
      reportedAt: task.reportedAt || task.createdAt || new Date().toISOString(),
      upvotes: task.upvotes || 0,
      images: task.images || [],
      latitude: task.latitude,
      longitude: task.longitude,
      reporterId: task.reporterId || task.reporter?.id || '',
      reporter: task.reporter ? {
        id: task.reporter.id || task.reporterId,
        name: task.reporter.name || task.reportedBy || 'Community Member',
        avatar: task.reporter.avatar,
        email: task.reporter.email,
        phone: task.reporter.phone,
      } : undefined,
    }));
  }

/**
 * Format notifications for display
 */
function formatNotifications(notifications: any[]): any[] {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Welcome to CivicFix!',
        message: 'Start claiming tasks to help your community',
        time: 'Just now',
        timestamp: new Date().toISOString(),
        user: 'System',
      },
    ];
  }

  return notifications.map((notification: any) => ({
    id: notification.id || notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    time: formatRelativeTime(notification.createdAt),
    timestamp: notification.createdAt,
    user: extractUserFromNotification(notification),
    actionUrl: notification.actionUrl,
    metadata: notification.metadata || {},
  }));
}

/**
 * Extract user name from notification
 */
function extractUserFromNotification(notification: any): string {
  if (notification.metadata?.userName) return notification.metadata.userName;
  if (notification.metadata?.volunteerName) return notification.metadata.volunteerName;
  if (notification.metadata?.reporterName) return notification.metadata.reporterName;
  if (notification.metadata?.commenterName) return notification.metadata.commenterName;
  return 'System';
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Just now';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

/**
 * Calculate community rank based on completed tasks
 */
export function calculateVolunteerRank(completedTasks: number): string {
  if (completedTasks >= 100) return 'Hero Volunteer';
  if (completedTasks >= 50) return 'Elite Volunteer';
  if (completedTasks >= 25) return 'Senior Volunteer';
  if (completedTasks >= 10) return 'Active Volunteer';
  if (completedTasks >= 5) return 'Regular Volunteer';
  return 'Volunteer';
}

/**
 * Refresh dashboard data (for real-time updates)
 */
export async function refreshVolunteerDashboard(userId: string): Promise<VolunteerDashboardResponse> {
  return fetchVolunteerDashboard(userId);
}