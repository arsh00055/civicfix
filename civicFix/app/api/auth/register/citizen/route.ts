import { connectToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// 👇 Data receive karega (body only)
export async function POST(data: any) {
  try {
    const { db } = await connectToDatabase();
    
    console.log('🔵 STEP 2: Received data:', data);
    
    // ================= VALIDATION =================
    
    // Required fields check
    const requiredFields = ['email', 'password', 'firstName', 'lastName', 'address', 'city', 'zipCode'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({
        success: false,
        message: "Please enter a valid email address"
      }, { status: 400 });
    }

    // Password validation
    if (data.password.length < 8) {
      return NextResponse.json({
        success: false,
        message: "Password must be at least 8 characters"
      }, { status: 400 });
    }

    // Name validation
    if (data.firstName.length < 2 || data.lastName.length < 2) {
      return NextResponse.json({
        success: false,
        message: "First name and last name must be at least 2 characters each"
      }, { status: 400 });
    }

    // ================= CHECK DUPLICATE EMAIL =================
    
    const email = data.email.toLowerCase();
    
    // Check in citizens collection
    const existingCitizen = await db.collection('citizens').findOne({ email });
    if (existingCitizen) {
      return NextResponse.json({
        success: false,
        message: "Email already registered. Please login or use a different email."
      }, { status: 409 });
    }
    
    // Check in volunteers collection
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
      name: fullName,
      firstName: data.firstName,
      lastName: data.lastName,
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
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        registrationIp: 'unknown',  // 👈 FIXED - no headers
        userAgent: 'unknown'        // 👈 FIXED - no headers
      }
    };

    // ================= INSERT INTO DATABASE =================
    
    const result = await db.collection('citizens').insertOne(citizenData);

    if (!result.acknowledged) {
      throw new Error('Failed to insert citizen data');
    }

    console.log('✅ Citizen registered successfully:', { email, id: result.insertedId });

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
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