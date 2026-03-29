// app/api/admin/analytics/users/route.ts
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
    
    const [citizens, volunteers] = await Promise.all([
      db.collection('citizens').find({ role: 'citizen' }).toArray(),
      db.collection('citizens').find({ role: 'volunteer' }).toArray(),
    ]);
    
    const totalUsers = citizens.length + volunteers.length;
    const activeUsers = citizens.filter(u => u.isActive).length + volunteers.filter(u => u.isActive).length;
    const verifiedUsers = citizens.filter(u => u.isVerified).length + volunteers.filter(u => u.isVerified).length;
    
    const usersByRole = [
      { role: 'citizen', count: citizens.length },
      { role: 'volunteer', count: volunteers.length },
      { role: 'admin', count: 1 }, // Assuming 1 admin for now
    ];
    
    const recentUsers = await db.collection('citizens')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    return NextResponse.json({
      totalUsers,
      activeUsers,
      verifiedUsers,
      usersByRole,
      recentUsers: recentUsers.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        isActive: u.isActive,
      })),
    });
  } catch (error) {
    console.error('GET /api/admin/analytics/users error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user analytics' },
      { status: 500 }
    );
  }
}