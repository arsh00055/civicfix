// app/api/admin/issues/[id]/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { notifyCitizenIssueResolved, notifyVolunteerTaskCompleted } from '@/lib/helpers/notification.helper';
import { checkAndAwardAchievements } from '@/lib/services/achievementService';

function toObjectId(id: string) {
  try { return new ObjectId(id); } catch { return null; }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can review and resolve issues' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });

    const body = await req.json();
    const { approved, rejectionReason, reviewNotes } = body;

    const { db } = await connectToDatabase();
    const existing = await db.collection('issues').findOne({ _id: oid });
    
    if (!existing) {
      return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    }

    if (existing.status !== 'pending_review') {
      return NextResponse.json(
        { message: `Issue is not pending review. Current status: ${existing.status}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    
    if (approved) {
      // Approve and mark as resolved
      const updates = {
        status: 'resolved',
        resolvedAt: now,
        resolvedBy: user.id,
        resolvedByName: user.name,
        reviewedAt: now,
        reviewedBy: user.id,
        reviewedByName: user.name,
        reviewNotes: reviewNotes || '',
        updatedAt: now,
      };

      await db.collection('issues').updateOne({ _id: oid }, { $set: updates });
      
      // Update volunteer stats if issue was assigned to a volunteer
      if (existing.assignedToId) {
        const volunteerId = existing.assignedToId;
        
        // Update volunteer's stats
        await db.collection('volunteers').updateOne(
          { _id: new ObjectId(volunteerId) },
          { 
            $inc: { 
              'volunteerStats.tasksCompleted': 1,
              'volunteerStats.pointsEarned': 50,
              'stats.points': 50,
            },
            $set: { updatedAt: now }
          }
        );

        await db.collection('admins').updateOne(
          { _id: new ObjectId(user.id) },
          {
            $inc: { 'stats.issuesReviewed': 1, 'stats.points': 10 },
            $set: { updatedAt: now }
          }
        );        

        const updatedAdmin = await db.collection('admins').findOne(
          { _id: new ObjectId(user.id) },
          { projection: { stats: 1 } }
        );

        await checkAndAwardAchievements(user.id, 'admin', {
          issuesReviewed: updatedAdmin?.stats?.issuesReviewed ?? 0,
          level:          updatedAdmin?.stats?.level ?? 1,
          points:         updatedAdmin?.stats?.points ?? 0,
        });
        
        // Get updated volunteer stats for achievement checking
        const updatedVolunteer = await db.collection('volunteers').findOne(
          { _id: new ObjectId(volunteerId) },
          { projection: { stats: 1, volunteerStats: 1, role: 1 } }
        );
        
        if (updatedVolunteer) {
          // Check and award achievements for the volunteer
          await checkAndAwardAchievements(
            volunteerId,
            'volunteer',
            {
              tasksCompleted: updatedVolunteer.volunteerStats?.tasksCompleted || 0,
              totalClaimed: updatedVolunteer.volunteerStats?.totalClaimed || 0,
              points: updatedVolunteer.stats?.points || 0,
              level: updatedVolunteer.stats?.level || 1,
            }
          );
        }
      }
      
      // Update citizen reporter's stats (for having issue resolved)
      if (existing.reporterId) {
        await db.collection('citizens').updateOne(
          { _id: new ObjectId(existing.reporterId) },
          { 
            $inc: { 
              'stats.resolvedReports': 1,
              'stats.points': 20, // Add points for having issue resolved
            },
            $set: { updatedAt: now }
          }
        );
        
        // Get updated citizen stats for achievement checking
        const updatedCitizen = await db.collection('citizens').findOne(
          { _id: new ObjectId(existing.reporterId) },
          { projection: { stats: 1, role: 1 } }
        );
        
        if (updatedCitizen) {
          // Check and award achievements for the citizen
          await checkAndAwardAchievements(
            existing.reporterId,
            'citizen',
            {
              resolvedReports: updatedCitizen.stats?.resolvedReports || 0,
              totalReports: updatedCitizen.stats?.totalReports || 0,
              points: updatedCitizen.stats?.points || 0,
              level: updatedCitizen.stats?.level || 1,
            }
          );
        }
      }
      
      // Send notifications
      if (existing.reporterId) {
        await notifyCitizenIssueResolved(
          existing.reporterId,
          id,
          existing.title,
          existing.assignedTo?.name || 'a volunteer'
        );
      }
      
      if (existing.assignedToId) {
        await notifyVolunteerTaskCompleted(
          existing.assignedToId,
          id,
          existing.title
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Issue approved and marked as resolved',
        data: {
          volunteerPointsAwarded: 50,
          citizenPointsAwarded: 20,
        },
      });
    } else {
      // Reject and send back for rework
      const updates = {
        status: 'in_progress',
        statusHistory: [
          ...(existing.statusHistory || []),
          {
            from: 'pending_review',
            to: 'in_progress',
            reason: rejectionReason,
            by: user.id,
            byName: user.name,
            timestamp: now,
          }
        ],
        rejectionReason: rejectionReason || 'Insufficient proof or incomplete work',
        reviewNotes: reviewNotes || '',
        reviewedAt: now,
        reviewedBy: user.id,
        reviewedByName: user.name,
        updatedAt: now,
      };

      await db.collection('issues').updateOne({ _id: oid }, { $set: updates });
      
      return NextResponse.json({
        success: true,
        message: 'Issue rejected. Volunteer needs to rework.',
        rejectionReason: rejectionReason,
      });
    }
  } catch (error: any) {
    console.error('POST /api/admin/issues/[id]/review error:', error);
    return NextResponse.json(
      { message: 'Failed to review issue', error: error.message },
      { status: 500 }
    );
  }
}