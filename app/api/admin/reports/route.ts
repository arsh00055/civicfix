import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { ObjectId } from 'mongodb'

// GET /api/admin/reports — saari saved reports fetch karo
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const reports = await db
      .collection('generatedReports')
      .find({})
      .sort({ generatedAt: -1 }) // newest first
      .toArray()

    const formatted = reports.map(r => ({
      id: r._id.toString(),
      title: r.title,
      description: r.description,
      type: r.type,
      format: r.format,
      generatedAt: r.generatedAt,
      period: r.period,
      status: r.status,
      fileSize: r.fileSize || null,
      downloadUrl: r.downloadUrl || null,
      generatedBy: r.generatedBy || null,
    }))

    return NextResponse.json({ success: true, reports: formatted })

  } catch (error: any) {
    console.error('Reports GET error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// POST /api/admin/reports — navi report save karo
export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, type, format, period, status, fileSize, downloadUrl } = body

    if (!title || !type || !format) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: title, type, format' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    const reportData = {
      title,
      description: description || '',
      type,
      format,
      period: period || '',
      status: status || 'completed',
      fileSize: fileSize || null,
      downloadUrl: downloadUrl || null,
      generatedAt: new Date().toISOString(),
      generatedBy: user.id,
      createdAt: new Date(),
    }

    const result = await db.collection('generatedReports').insertOne(reportData)

    return NextResponse.json({
      success: true,
      message: 'Report saved successfully',
      data: {
        id: result.insertedId.toString(),
        ...reportData,
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Reports POST error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/reports?id=xxx — report delete karo
export async function DELETE(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid report ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    await db.collection('generatedReports').deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true, message: 'Report deleted' })

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}