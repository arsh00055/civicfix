import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId or file" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "File must be an image" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image must be less than 5MB" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageId = new ObjectId();

    // Store image in uploads collection
    await db.collection("uploads").insertOne({
      _id: imageId,
      userId: new ObjectId(userId),
      data: buffer,
      type: "issue-image",
      contentType: file.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const imageUrl = `/api/upload/newIssue?imageId=${imageId}`;

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl,
        imageId: imageId.toString(),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
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

    // Find the image in the uploads collection
    const image = await db.collection('uploads').findOne({
      _id: new ObjectId(imageId),
      type: 'issue-image'
    });

    if (!image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Extract the binary data
    let buffer: Buffer;
    
    if (image.data?.buffer) {
      buffer = Buffer.from(image.data.buffer);
    } else if (image.data) {
      buffer = Buffer.from(image.data);
    } else {
      return new NextResponse('Invalid image data', { status: 500 });
    }

    const contentType = image.contentType || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId || !ObjectId.isValid(imageId)) {
      return NextResponse.json(
        { success: false, message: "Invalid imageId" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    await db.collection("uploads").deleteOne({
      _id: new ObjectId(imageId),
      type: "issue-image",
    });

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}