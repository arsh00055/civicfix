import { connectToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// 👇 IMPORTANT: Request nahi, direct data receive karega
export async function POST(data: any) {
  try {
    const { db } = await connectToDatabase();

    console.log('📝 Volunteer registration request:', {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      skills: data.skills,
      experienceLevel: data.experienceLevel
    });

    // ================= VALIDATION =================
    
    // Required fields check
    const requiredFields = ['email', 'password', 'firstName', 'lastName', 'skills', 'availability', 'experienceLevel'];
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

    // Skills validation
    if (!Array.isArray(data.skills) || data.skills.length === 0) {
      return NextResponse.json({
        success: false,
        message: "At least one skill is required"
      }, { status: 400 });
    }

    // Availability validation
    if (!Array.isArray(data.availability) || data.availability.length === 0) {
      return NextResponse.json({
        success: false,
        message: "At least one availability slot is required"
      }, { status: 400 });
    }

    // Experience level validation
    const validExperienceLevels = ['beginner', 'intermediate', 'expert'];
    if (!validExperienceLevels.includes(data.experienceLevel)) {
      return NextResponse.json({
        success: false,
        message: "Invalid experience level. Must be beginner, intermediate, or expert"
      }, { status: 400 });
    }

    // Phone validation (optional but if provided, validate format)
    if (data.phone && !/^[0-9+\-\s()]{10,15}$/.test(data.phone)) {
      return NextResponse.json({
        success: false,
        message: "Please enter a valid phone number"
      }, { status: 400 });
    }

    // ================= CHECK DUPLICATE EMAIL =================
    
    const email = data.email.toLowerCase();
    
    // Check in citizens collection
    const existingCitizen = await db.collection('citizens').findOne({ email });
    if (existingCitizen) {
      return NextResponse.json({
        success: false,
        message: "Email already registered as citizen. Please login with citizen account."
      }, { status: 409 });
    }
    
    // Check in volunteers collection
    const existingVolunteer = await db.collection('volunteers').findOne({ email });
    if (existingVolunteer) {
      return NextResponse.json({
        success: false,
        message: "Email already registered. Please login or use a different email."
      }, { status: 409 });
    }

    // ================= HASH PASSWORD =================
    
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // ================= CREATE VOLUNTEER OBJECT =================
    
    const fullName = `${data.firstName} ${data.lastName}`;
    
    const volunteerData = {
      name: fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: email,
      password: hashedPassword,
      phone: data.phone || null,
      skills: data.skills,
      availability: data.availability,
      experienceLevel: data.experienceLevel,
      bio: data.bio || null,
      role: 'volunteer',
      isActive: true,
      isEmailVerified: false,
      approvalStatus: 'pending',  // 'pending' | 'approved' | 'rejected' // Active only after approval
      status: 'available',
      rating: 0,
      totalTasks: 0,
      completedTasks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        registrationIp: 'unknown',  // 👈 No headers
        userAgent: 'unknown'
      }
    };

    // ================= INSERT INTO DATABASE =================
    
    const result = await db.collection('volunteers').insertOne(volunteerData);

    if (!result.acknowledged) {
      throw new Error('Failed to insert volunteer data');
    }

    console.log('✅ Volunteer registered successfully:', { 
      email, 
      id: result.insertedId,
      skills: data.skills,
      experienceLevel: data.experienceLevel
    });

    // ================= RETURN SUCCESS RESPONSE =================
    
    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      data: {
        userId: result.insertedId,
        email: email,
        name: fullName,
        role: 'volunteer',
        skills: data.skills,
        experienceLevel: data.experienceLevel,
        isEmailVerified: false
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Volunteer registration error:", error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Server error. Please try again later."
    }, { status: 500 });
  }
}