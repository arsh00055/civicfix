// lib/services/notificationService.ts
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export type NotificationType = 
  // Issue related
  | 'issue_reported'
  | 'issue_assigned'
  | 'issue_in_progress'
  | 'issue_resolved'
  | 'issue_closed'
  | 'issue_voted'
  | 'issue_commented'
  // Volunteer related
  | 'task_claimed'
  | 'task_started'
  | 'task_completed'
  // Admin related
  | 'new_issue_alert'
  | 'urgent_issue_alert'
  | 'issue_escalated';

export interface Notification {
  _id?: ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  targetRole: 'citizen' | 'volunteer' | 'admin';
  targetType: 'specific' | 'broadcast';
  targetUserId?: string;
  targetUserIds?: string[];
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  isArchived: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  targetRole: 'citizen' | 'volunteer' | 'admin';
  targetType: 'specific' | 'broadcast';
  targetUserId?: string;
  targetUserIds?: string[];
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const { db } = await connectToDatabase();
    
    const notification: Omit<Notification, '_id'> = {
      ...params,
      createdAt: new Date().toISOString(),
      isRead: false,
      isArchived: false
    };

    const result = await db.collection('notifications').insertOne(notification);
    return result.insertedId.toString();
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function notifyAdminsNewIssue(
  issueId: string,
  issueTitle: string,
  reporterName: string,
  priority: string
) {
  return createNotification({
    type: 'new_issue_alert',
    title: '📢 New Issue Reported',
    message: `${reporterName} reported a new issue: "${issueTitle}" (Priority: ${priority.toUpperCase()})`,
    targetRole: 'admin',
    targetType: 'broadcast',
    actionUrl: `/admin/issues/${issueId}`,
    actionText: 'View Issue',
    metadata: { issueId, issueTitle, reporterName, priority }
  });
}

export async function notifyAdminsUrgentIssue(
  issueId: string,
  issueTitle: string,
  reporterName: string,
  priority: string,
  location: string
) {
  return createNotification({
    type: 'urgent_issue_alert',
    title: '🚨 URGENT: High Priority Issue Reported!',
    message: `URGENT: ${reporterName} reported a ${priority.toUpperCase()} priority issue: "${issueTitle}" at ${location}. Requires immediate attention!`,
    targetRole: 'admin',
    targetType: 'broadcast',
    actionUrl: `/admin/issues/${issueId}`,
    actionText: 'Review Urgent Issue',
    metadata: { 
      issueId, 
      issueTitle, 
      reporterName, 
      priority,
      location,
      urgent: true 
    }
  });
}

export async function notifyVolunteerAssigned(
  volunteerId: string,
  issueId: string,
  issueTitle: string,
  location: string
) {
  return createNotification({
    type: 'issue_assigned',
    title: '📋 New Issue Assigned',
    message: `You have been assigned to: "${issueTitle}" at ${location}. Please review and start working on it.`,
    targetRole: 'volunteer',
    targetType: 'specific',
    targetUserId: volunteerId,
    actionUrl: `/issues/${issueId}`,
    actionText: 'View Issue',
    metadata: { issueId, issueTitle, location, status: 'assigned' }
  });
}

export async function notifyVolunteerStatusUpdate(
  volunteerId: string,
  issueId: string,
  issueTitle: string,
  newStatus: string
) {
  const statusMessages: Record<string, string> = {
    in_progress: 'You have started working on',
    resolved: 'You have marked as resolved',
    closed: 'has been closed'
  };

  return createNotification({
    type: 'issue_in_progress',
    title: '🔄 Issue Status Updated',
    message: `${statusMessages[newStatus] || 'Status updated for'}: "${issueTitle}"`,
    targetRole: 'volunteer',
    targetType: 'specific',
    targetUserId: volunteerId,
    actionUrl: `/issues/${issueId}`,
    actionText: 'View Issue',
    metadata: { issueId, issueTitle, status: newStatus }
  });
}

export async function notifyCitizenIssueResolved(
  citizenId: string,
  issueId: string,
  issueTitle: string,
  volunteerName: string
) {
  return createNotification({
    type: 'issue_resolved',
    title: '✅ Your Issue Has Been Resolved!',
    message: `Great news! The issue "${issueTitle}" you reported has been resolved by ${volunteerName}. Thank you for helping improve your community!`,
    targetRole: 'citizen',
    targetType: 'specific',
    targetUserId: citizenId,
    actionUrl: `/issues/${issueId}`,
    actionText: 'View Resolution',
    metadata: { issueId, issueTitle, volunteerName, status: 'resolved' }
  });
}

export async function notifyReporterIssueVoted(
  reporterId: string,
  issueId: string,
  issueTitle: string,
  voterName: string,
  totalVotes: number
) {
  return createNotification({
    type: 'issue_voted',
    title: '👍 Your Issue Received a Vote!',
    message: `${voterName} voted on your issue "${issueTitle}". It now has ${totalVotes} votes!`,
    targetRole: 'citizen',
    targetType: 'specific',
    targetUserId: reporterId,
    actionUrl: `/issues/${issueId}`,
    actionText: 'View Issue',
    metadata: { issueId, issueTitle, voterName, totalVotes }
  });
}

export async function notifyReporterNewComment(
  reporterId: string,
  issueId: string,
  issueTitle: string,
  commenterName: string,
  commentText: string
) {
  return createNotification({
    type: 'issue_commented',
    title: '💬 New Comment on Your Issue',
    message: `${commenterName} commented on "${issueTitle}": "${commentText.substring(0, 100)}${commentText.length > 100 ? '...' : ''}"`,
    targetRole: 'citizen',
    targetType: 'specific',
    targetUserId: reporterId,
    actionUrl: `/issues/${issueId}`,
    actionText: 'View Comment',
    metadata: { issueId, issueTitle, commenterName, commentText }
  });
}

export async function notifyVolunteerTaskClaimed(
  volunteerId: string,
  issueId: string,
  issueTitle: string,
  reporterName: string
) {
  return createNotification({
    type: 'task_claimed',
    title: '🎯 Task Claimed Successfully',
    message: `You have successfully claimed the task: "${issueTitle}" reported by ${reporterName}. You can now start working on it.`,
    targetRole: 'volunteer',
    targetType: 'specific',
    targetUserId: volunteerId,
    actionUrl: `/issues/${issueId}`,
    actionText: 'View Task',
    metadata: { issueId, issueTitle, reporterName }
  });
}

export async function notifyVolunteerTaskStarted(
  volunteerId: string,
  issueId: string,
  issueTitle: string
) {
  return createNotification({
    type: 'task_started',
    title: '🚀 Task Started',
    message: `You have started working on "${issueTitle}". Update the status when completed.`,
    targetRole: 'volunteer',
    targetType: 'specific',
    targetUserId: volunteerId,
    actionUrl: `/issues/${issueId}`,
    actionText: 'Update Status',
    metadata: { issueId, issueTitle, status: 'in_progress' }
  });
}

export async function notifyVolunteerTaskCompleted(
  volunteerId: string,
  issueId: string,
  issueTitle: string,
  resolutionTime?: string
) {
  const timeText = resolutionTime ? ` in ${resolutionTime}` : '';
  
  return createNotification({
    type: 'task_completed',
    title: '🎉 Task Completed!',
    message: `Great work! You have completed "${issueTitle}"${timeText}. Thank you for making a difference in the community!`,
    targetRole: 'volunteer',
    targetType: 'specific',
    targetUserId: volunteerId,
    actionUrl: `/issues/${issueId}`,
    actionText: 'View Completed Task',
    metadata: { issueId, issueTitle, resolutionTime, status: 'resolved' }
  });
}

export async function notifyAdminIssueClaimed(
  issueId: string,
  issueTitle: string,
  volunteerName: string
) {
  return createNotification({
    type: 'issue_assigned',
    title: '👥 Issue Claimed by Volunteer',
    message: `${volunteerName} has claimed the issue "${issueTitle}" and started working on it.`,
    targetRole: 'admin',
    targetType: 'broadcast',
    actionUrl: `/admin/issues/${issueId}`,
    actionText: 'Monitor Progress',
    metadata: { issueId, issueTitle, volunteerName }
  });
}

export async function notifyAdminIssueResolved(
  issueId: string,
  issueTitle: string,
  volunteerName: string
) {
  return createNotification({
    type: 'issue_resolved',
    title: '✅ Issue Resolved',
    message: `The issue "${issueTitle}" has been resolved by ${volunteerName}.`,
    targetRole: 'admin',
    targetType: 'broadcast',
    actionUrl: `/admin/issues/${issueId}`,
    actionText: 'Review Resolution',
    metadata: { issueId, issueTitle, volunteerName }
  });
}

export async function notifyAdminIssueEscalated(
  issueId: string,
  issueTitle: string,
  reason: string,
  previousStatus: string
) {
  return createNotification({
    type: 'issue_escalated',
    title: '⚠️ Issue Escalated',
    message: `The issue "${issueTitle}" has been escalated from ${previousStatus}. Reason: ${reason}. Requires immediate attention.`,
    targetRole: 'admin',
    targetType: 'broadcast',
    actionUrl: `/admin/issues/${issueId}`,
    actionText: 'Review Escalated Issue',
    metadata: { issueId, issueTitle, reason, previousStatus, urgent: true }
  });
}