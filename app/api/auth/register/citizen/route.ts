import { connectToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await req.json();

    // ✅ Check if citizen registration is allowed
    const settings = await db.collection('systemSettings').findOne({ key: 'global' })
    if (settings?.allowCitizenRegistration === false) {
      return NextResponse.json({
        success: false,
        message: "Citizen registration is currently closed. Please contact support for more information."
      }, { status: 403 });
    }

    // ================= VALIDATION =================

    const requiredFields = ['email', 'password', 'firstName', 'lastName', 'address', 'city', 'zipCode'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({
        success: false,
        message: "Please enter a valid email address"
      }, { status: 400 });
    }

    if (data.password.length < 8) {
      return NextResponse.json({
        success: false,
        message: "Password must be at least 8 characters"
      }, { status: 400 });
    }

    if (data.firstName.length < 2 || data.lastName.length < 2) {
      return NextResponse.json({
        success: false,
        message: "First name and last name must be at least 2 characters each"
      }, { status: 400 });
    }

    // ================= CHECK DUPLICATE EMAIL =================

    const email = data.email.toLowerCase();

    const existingCitizen = await db.collection('citizens').findOne({ email });
    if (existingCitizen) {
      return NextResponse.json({
        success: false,
        message: "Email already registered. Please login or use a different email."
      }, { status: 409 });
    }

    const existingVolunteer = await db.collection('volunteers').findOne({ email });
    if (existingVolunteer) {
      return NextResponse.json({
        success: false,
        message: "Email already registered as volunteer. Please login with volunteer account."
      }, { status: 409 });
    }

    // ================= HASH PASSWORD =================

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // ================= CREATE CITIZEN OBJECT =================

    const fullName = `${data.firstName} ${data.lastName}`;

    const citizenData = {
      firstName: data.firstName,
      lastName: data.lastName,
      name: fullName,
      email: email,
      password: hashedPassword,
      phone: data.phone || null,
      address: data.address,
      city: data.city,
      zipCode: data.zipCode,
      role: 'citizen',
      isActive: true,
      isEmailVerified: false,
      achievements: [],
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        registrationIp: 'unknown',
        userAgent: 'unknown'
      }
    };

    const result = await db.collection('citizens').insertOne(citizenData);

    if (!result.acknowledged) {
      throw new Error('Failed to insert citizen data');
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful!",
      data: {
        userId: result.insertedId,
        email: email,
        name: fullName,
        role: 'citizen',
        isEmailVerified: false
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Citizen registration error:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Server error. Please try again later."
    }, { status: 500 });
  }
}