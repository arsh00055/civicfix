import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

// GET /api/admin/settings — public read (registration check lyi)
export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection('systemSettings').findOne({ key: 'global' })

    if (!settings) {
      return NextResponse.json({ success: true, data: getDefaultSettings() })
    }

    const { _id, ...rest } = settings
    return NextResponse.json({ success: true, data: rest })

  } catch (error: any) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// PATCH /api/admin/settings — sirf admin kar sakda
export async function PATCH(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { db } = await connectToDatabase()

    await db.collection('systemSettings').updateOne(
      { key: 'global' },
      {
        $set: {
          ...body,
          key: 'global',
          updatedAt: new Date(),
          updatedBy: user.id,
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true, message: 'Settings saved successfully' })

  } catch (error: any) {
    console.error('Settings PATCH error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

function getDefaultSettings() {
  return {
    key: 'global',
    siteName: 'CivicFix',
    supportEmail: 'support@civicfix.com',
    maintenanceMode: false,
    allowCitizenRegistration: true,
    allowVolunteerRegistration: true,
  }
}