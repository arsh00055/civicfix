import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import {
  notifyVolunteerWarning,
  notifyIssueReassigned,
  notifyAllVolunteersNewTask,
} from '@/lib/helpers/notification.helper';

const PRIORITY_BUMP: Record<string, string> = {
  low:      'medium',
  medium:   'high',
  high:     'critical',
critical: 'critical',
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getCurrentUser(req);
    if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (admin.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });
    }

    const body = await req.json();
    const { action, reason } = body as {
      action: 'warn_volunteer' | 'reassign' | 'bump_priority' | 'close';
      reason?: string;
    };

    const { db } = await connectToDatabase();
    const issue = await db.collection('issues').findOne({ _id: new ObjectId(id) });

    if (!issue) return NextResponse.json({ message: 'Issue not found' }, { status: 404 });

    const now = new Date().toISOString();
    let updateFields: Record<string, any> = { updatedAt: now };
    let message = '';

    switch (action) {

      case 'warn_volunteer': {
        if (!issue.assignedToId) {
          return NextResponse.json({ message: 'Issue has no assigned volunteer' }, { status: 400 });
        }

        const extendedDeadline = new Date();
        extendedDeadline.setDate(extendedDeadline.getDate() + 2);

        updateFields = {
          ...updateFields,
          adminOverdueAlertSent: false,
          deadlineExtendedUntil: extendedDeadline.toISOString(),
          deadlineExtendedAt:    now,
          deadlineExtendedBy:    admin.id,
          adminWarnings:         (issue.adminWarnings || 0) + 1,
        };

        await notifyVolunteerWarning(
          issue.assignedToId,
          id,
          issue.title,
          reason || 'Your assigned task is overdue. Please complete it within 2 days or it will be reassigned.',
          2,
        );

        message = `Warning sent to ${issue.assignedTo?.name}. Deadline extended by 2 days.`;
        break;
      }

      case 'reassign': {
        const previousVolunteer = issue.assignedTo;

        updateFields = {
          ...updateFields,
          status:               'reported',
          assignedToId:         null,
          assignedTo:           null,
          assignedAt:           null,
          deadlineWarningsSent: false,
          adminOverdueAlertSent: false,
          adminStaleAlertSent:  false,
          overdueAt:            null,
          reassignedAt:         now,
          reassignedBy:         admin.id,
          reassignReason:       reason || 'Task overdue — reassigned by admin',
          previousAssignments: [
            ...(issue.previousAssignments || []),
            {
              volunteerId:   issue.assignedToId,
              volunteerName: previousVolunteer?.name,
              assignedAt:    issue.assignedAt,
              removedAt:     now,
              reason:        reason || 'Overdue',
            }
          ],
        };

        if (issue.assignedToId) {
          await notifyIssueReassigned(
            issue.assignedToId,
            id,
            issue.title,
            reason || 'Task was reassigned due to deadline not being met.',
          );
        }

        await notifyAllVolunteersNewTask(id, issue.title, issue.location, issue.priority);

        message = `Issue reassigned back to pool. ${previousVolunteer?.name || 'Volunteer'} has been notified.`;
        break;
      }

      case 'bump_priority': {
        const newPriority = PRIORITY_BUMP[issue.priority] || 'high';
        updateFields = {
          ...updateFields,
          priority:           newPriority,
          priorityBumpedAt:   now,
          priorityBumpedBy:   admin.id,
          priorityBumpReason: reason,
        };
        message = `Priority bumped from ${issue.priority} to ${newPriority}.`;
        break;
      }

      case 'close': {
        updateFields = {
          ...updateFields,
          status:      'closed',
          closedAt:    now,
          closedBy:    admin.id,
          closeReason: reason || 'Closed by admin',
        };
        message = 'Issue closed.';
        break;
      }

      default:
        return NextResponse.json({ message: `Unknown action: ${action}` }, { status: 400 });
    }

    await db.collection('issues').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    const updated = await db.collection('issues').findOne({ _id: new ObjectId(id) });
    const { _id, ...rest } = updated!;

    return NextResponse.json({
      success: true,
      message,
      issue: { ...rest, id: _id.toString() },
    });

  } catch (error: any) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}