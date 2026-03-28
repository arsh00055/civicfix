// app/api/upload/resolved-issue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const issueId = formData.get('issueId') as string;

    console.log('Upload request received:', { userId, issueId, fileName: file?.name });

    if (!file || !userId || !issueId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: file, userId, or issueId' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Image must be less than 5MB' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageId = new ObjectId();

    await db.collection('uploads').insertOne({
      _id: imageId,
      userId: new ObjectId(userId),
      issueId: issueId,
      data: buffer,
      type: 'resolution-proof',
      contentType: file.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const imageUrl = `/api/upload/resolvedIssue?imageId=${imageId}`;

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      url: imageUrl,
      imageId: imageId.toString(),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId || !ObjectId.isValid(imageId)) {
      return new NextResponse('Invalid image ID', { status: 400 });
    }

    const { db } = await connectToDatabase();

    const image = await db.collection('uploads').findOne({
      _id: new ObjectId(imageId),
      type: 'resolution-proof'
    });

    if (!image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    let buffer: Uint8Array;
    
    if (image.data?.buffer) {
      buffer = new Uint8Array(image.data.buffer);
    } else if (image.data) {
      buffer = new Uint8Array(image.data);
    } else {
      return new NextResponse('Invalid image data', { status: 500 });
    }

    const contentType = image.contentType || 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}