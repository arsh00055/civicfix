import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { notifyDeadlineWarning, notifyAdminOverdueTask, notifyAdminStaleIssue } from '@/lib/helpers/notification.helper';

function isAuthorized(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  return req.headers.get('authorization') === `Bearer ${cronSecret}`;
}

const TASK_WARNING_DAYS  = 5;
const TASK_OVERDUE_DAYS  = 7;
const ISSUE_STALE_DAYS   = 21;

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { db } = await connectToDatabase();
  const now = new Date();

  const results = {
    warningsSent:  0,
    overdueAlerts: 0,
    staleAlerts:   0,
    errors:        [] as string[],
  };

  try {
    const warningThreshold = new Date(now);
    warningThreshold.setDate(warningThreshold.getDate() - TASK_WARNING_DAYS);

    const overdueThreshold = new Date(now);
    overdueThreshold.setDate(overdueThreshold.getDate() - TASK_OVERDUE_DAYS);

    const warningTasks = await db.collection('issues').find({
      status:     { $in: ['assigned', 'in_progress'] },
      assignedAt: {
        $gte: new Date(warningThreshold.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        $lte: warningThreshold.toISOString(),
      },
      deadlineWarningsSent: { $ne: true },
    }).toArray();

    for (const task of warningTasks) {
      try {
        const daysLeft = TASK_OVERDUE_DAYS - Math.floor(
          (now.getTime() - new Date(task.assignedAt).getTime()) / 86_400_000
        );

        await notifyDeadlineWarning(
          task.assignedToId,
          task._id.toString(),
          task.title,
          daysLeft,
        );

        await db.collection('issues').updateOne(
          { _id: task._id },
          { $set: { deadlineWarningsSent: true } }
        );

        results.warningsSent++;
      } catch (e: any) {
        results.errors.push(`Warning for ${task._id}: ${e.message}`);
      }
    }

    const overdueTasks = await db.collection('issues').find({
      status:     { $in: ['assigned', 'in_progress'] },
      assignedAt: { $lte: overdueThreshold.toISOString() },
      adminOverdueAlertSent: { $ne: true },
    }).toArray();

    for (const task of overdueTasks) {
      try {
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(task.assignedAt).getTime()) / 86_400_000
        ) - TASK_OVERDUE_DAYS;

        await notifyAdminOverdueTask(
          task._id.toString(),
          task.title,
          task.assignedTo?.name || 'Unknown volunteer',
          task.assignedToId,
          daysOverdue,
          task.priority,
        );

        await db.collection('issues').updateOne(
          { _id: task._id },
          {
            $set: {
              adminOverdueAlertSent: true,
              overdueAt: now.toISOString(),
            }
          }
        );

        results.overdueAlerts++;
      } catch (e: any) {
        results.errors.push(`Overdue alert for ${task._id}: ${e.message}`);
      }
    }
  } catch (e: any) {
    results.errors.push(`Task deadline check failed: ${e.message}`);
  }

  try {
    const staleThreshold = new Date(now);
    staleThreshold.setDate(staleThreshold.getDate() - ISSUE_STALE_DAYS);

    const staleIssues = await db.collection('issues').find({
      status:    { $nin: ['resolved', 'closed'] },
      createdAt: { $lte: staleThreshold.toISOString() },
      adminStaleAlertSent: { $ne: true },
    }).toArray();

    for (const issue of staleIssues) {
      try {
        const daysOld = Math.floor(
          (now.getTime() - new Date(issue.createdAt).getTime()) / 86_400_000
        );

        await notifyAdminStaleIssue(
          issue._id.toString(),
          issue.title,
          issue.status,
          issue.priority,
          daysOld,
          issue.assignedTo?.name,
        );

        await db.collection('issues').updateOne(
          { _id: issue._id },
          { $set: { adminStaleAlertSent: true } }
        );

        results.staleAlerts++;
      } catch (e: any) {
        results.errors.push(`Stale alert for ${issue._id}: ${e.message}`);
      }
    }
  } catch (e: any) {
    results.errors.push(`Stale issue check failed: ${e.message}`);
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    ...results,
  });
}