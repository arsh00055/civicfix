// app/api/analytics/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getCurrentUser(req: NextRequest): { id: string; role: string } | null {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.id || decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
    try {
      const user = getCurrentUser(req);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      const { db } = await connectToDatabase();
      const { searchParams } = new URL(req.url);
      const format = searchParams.get('format') || 'json';
  
      // Fetch all data for export
      const [issues, users, volunteers] = await Promise.all([
        db.collection('issues').find({}).toArray(),
        db.collection('citizens').find({ role: 'citizen' }).toArray(),
        db.collection('citizens').find({ role: 'volunteer' }).toArray(),
      ]);
  
      const exportData = {
        generatedAt: new Date().toISOString(),
        generatedBy: user.id,
        summary: {
          totalIssues: issues.length,
          resolvedIssues: issues.filter(i => i.status === 'resolved').length,
          pendingIssues: issues.filter(i => i.status === 'reported' || i.status === 'assigned').length,
          totalUsers: users.length + volunteers.length,
          totalVolunteers: volunteers.length,
          totalCitizens: users.length,
        },
        issues: issues.map(issue => ({
          id: issue._id,
          title: issue.title,
          category: issue.category,
          priority: issue.priority,
          status: issue.status,
          location: issue.location,
          createdAt: issue.createdAt,
          resolvedAt: issue.resolvedAt,
          reportedBy: issue.reporter?.name,
          assignedTo: issue.assignedTo?.name,
        })),
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'citizen',
          createdAt: user.createdAt,
          isActive: user.isActive,
          totalReports: user.stats?.totalReports || 0,
          totalVotes: user.stats?.totalVotes || 0,
        })),
        volunteers: volunteers.map(volunteer => ({
          id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          role: 'volunteer',
          createdAt: volunteer.createdAt,
          isActive: volunteer.isActive,
          tasksCompleted: volunteer.volunteerStats?.tasksCompleted || 0,
          rating: volunteer.volunteerStats?.averageRating || 0,
        })),
      };
  
      const filename = `analytics-export-${new Date().toISOString().split('T')[0]}`;
  
      if (format === 'json') {
        const jsonString = JSON.stringify(exportData, null, 2);
        return new NextResponse(jsonString, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${filename}.json"`,
          },
        });
      }
  
      if (format === 'csv') {
        // Generate CSV for issues
        const issuesCsv = [
          ['ID', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Created At', 'Resolved At', 'Reported By', 'Assigned To'],
          ...exportData.issues.map(issue => [
            issue.id,
            issue.title,
            issue.category,
            issue.priority,
            issue.status,
            issue.location,
            issue.createdAt,
            issue.resolvedAt || '',
            issue.reportedBy || '',
            issue.assignedTo || '',
          ])
        ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  
        const usersCsv = [
          ['ID', 'Name', 'Email', 'Role', 'Created At', 'Active', 'Total Reports', 'Total Votes'],
          ...exportData.users.map(user => [
            user.id,
            user.name,
            user.email,
            user.role,
            user.createdAt,
            user.isActive,
            user.totalReports,
            user.totalVotes,
          ])
        ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  
        const volunteersCsv = [
          ['ID', 'Name', 'Email', 'Role', 'Created At', 'Active', 'Tasks Completed', 'Rating'],
          ...exportData.volunteers.map(volunteer => [
            volunteer.id,
            volunteer.name,
            volunteer.email,
            volunteer.role,
            volunteer.createdAt,
            volunteer.isActive,
            volunteer.tasksCompleted,
            volunteer.rating || 0,
          ])
        ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  
        const fullCsv = `# Analytics Export - ${new Date().toISOString()}\n\n## Issues\n${issuesCsv}\n\n## Citizens\n${usersCsv}\n\n## Volunteers\n${volunteersCsv}`;
  
        return new NextResponse(fullCsv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          },
        });
      }
  
      // Default to JSON
      const jsonString = JSON.stringify(exportData, null, 2);
      return new NextResponse(jsonString, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      });
  
    } catch (error) {
      console.error('GET /api/analytics/export error:', error);
      return NextResponse.json(
        { message: 'Failed to export analytics data' },
        { status: 500 }
      );
    }
  }