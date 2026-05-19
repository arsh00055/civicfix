import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

function getCollection(role: string) {
  if (role === 'citizen') return 'citizens'
  if (role === 'volunteer') return 'volunteers'
  if (role === 'admin') return 'admins'
  return null
}

// ============ POST /api/upload/avatar ============
export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = (formData.get('userId') as string) || currentUser.id

    console.log('📸 Avatar upload request:', { userId: currentUser.id, fileName: file?.name, fileType: file?.type, fileSize: file?.size })

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, WebP, GIF allowed.'
      }, { status: 400 })
    }

    // Validate file size — 5MB max
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        message: 'File size must be less than 5MB'
      }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    if (!ObjectId.isValid(currentUser.id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid user ID format'
      }, { status: 400 });
    }
    
    const objectId = new ObjectId(currentUser.id)
    
    // Avatar URL
  const avatarUrl = `/api/upload/avatar?userId=${currentUser.id}&t=${Date.now()}`

    // ============ STEP 1: Update or Insert in uploads collection ============
    const existing = await db.collection('uploads').findOne({
      userId: objectId,
      type: 'avatar',
    })

    if (existing) {
      // Update existing
      await db.collection('uploads').updateOne(
        { _id: existing._id },
        {
          $set: {
            data: buffer,
            contentType: file.type,
            updatedAt: new Date(),
          },
        }
      )
      console.log('✅ Updated existing avatar in uploads')
    } else {
      // Insert new
      await db.collection('uploads').insertOne({
        userId: objectId,
        type: 'avatar',
        data: buffer,
        contentType: file.type,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('✅ Inserted new avatar in uploads')
    }

    // ============ STEP 2: Update user collection with avatar URL ============
    const collection = getCollection(currentUser.role)
    if (collection) {
      const updateResult = await db.collection(collection).updateOne(
        { _id: objectId },
        { 
          $set: { 
            avatar: avatarUrl, 
            updatedAt: new Date() 
          } 
        }
      )
      console.log('✅ Updated user collection:', collection, updateResult.modifiedCount)
    }

    // ============ STEP 3: Also update in other collections if user exists? ============
    // Ensure consistency across all collections
    const otherCollections = ['citizens', 'volunteers', 'admins'].filter(c => c !== collection)
    for (const col of otherCollections) {
      const userExists = await db.collection(col).findOne({ _id: objectId })
      if (userExists) {
        await db.collection(col).updateOne(
          { _id: objectId },
          { $set: { avatar: avatarUrl, updatedAt: new Date() } }
        )
        console.log(`✅ Also updated ${col} collection`)
      }
    }

    console.log('✅ Avatar upload completed for user:', currentUser.id)

    return NextResponse.json({
      success: true,
      message: 'Profile picture updated successfully!',
      data: { avatar: avatarUrl },
    })

  } catch (error: any) {
    console.error('❌ Avatar upload error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}

// ============ GET /api/upload/avatar?userId=xxx ============
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || !ObjectId.isValid(userId)) {
      return new NextResponse('Invalid userId', { status: 400 })
    }

    const { db } = await connectToDatabase()

    const file = await db.collection('uploads').findOne({
      userId: new ObjectId(userId),
      type: 'avatar',
    })

    if (!file) {
      return new NextResponse('Avatar not found', { status: 404 })
    }

    // Handle buffer properly
    let buffer: Buffer

    if (Buffer.isBuffer(file.data)) {
      buffer = file.data
    } else if (file.data?.buffer) {
      buffer = Buffer.from(file.data.buffer)
    } else if (file.data?._bsontype === 'Binary') {
      buffer = file.data.read(0, file.data.length())
    } else {
      buffer = Buffer.from(file.data)
    }

    if (!buffer || buffer.length === 0) {
      return new NextResponse('Empty image data', { status: 500 })
    }

    const headers = new Headers()
    headers.set('Content-Type', file.contentType || 'image/jpeg')
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')
    headers.set('Content-Length', buffer.length.toString())

    return new NextResponse(new Uint8Array(buffer), { status: 200, headers })

  } catch (error: any) {
    console.error('❌ Avatar GET error:', error)
    return new NextResponse('Server error', { status: 500 })
  }
}