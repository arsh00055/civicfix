import { connectToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();

    // ✅ Check if volunteer registration is allowed
    const settings = await db.collection('systemSettings').findOne({ key: 'global' })
    if (settings?.allowVolunteerRegistration === false) {
      return NextResponse.json({
        success: false,
        message: "Volunteer registration is currently closed. Please contact support for more information."
      }, { status: 403 });
    }

    // ================= VALIDATION =================

    const requiredFields = ['email', 'password', 'firstName', 'lastName', 'skills', 'availability', 'experienceLevel'];
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

    if (!Array.isArray(data.skills) || data.skills.length === 0) {
      return NextResponse.json({
        success: false,
        message: "At least one skill is required"
      }, { status: 400 });
    }

    if (!Array.isArray(data.availability) || data.availability.length === 0) {
      return NextResponse.json({
        success: false,
        message: "At least one availability slot is required"
      }, { status: 400 });
    }

    const validExperienceLevels = ['beginner', 'intermediate', 'expert'];
    if (!validExperienceLevels.includes(data.experienceLevel)) {
      return NextResponse.json({
        success: false,
        message: "Invalid experience level. Must be beginner, intermediate, or expert"
      }, { status: 400 });
    }

    if (data.phone && !/^[0-9+\-\s()]{10,15}$/.test(data.phone)) {
      return NextResponse.json({
        success: false,
        message: "Please enter a valid phone number"
      }, { status: 400 });
    }

    // ================= CHECK DUPLICATE EMAIL =================

    const email = data.email.toLowerCase();

    const existingCitizen = await db.collection('citizens').findOne({ email });
    if (existingCitizen) {
      return NextResponse.json({
        success: false,
        message: "Email already registered as citizen. Please login with citizen account."
      }, { status: 409 });
    }

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
      firstName: data.firstName,
      lastName: data.lastName,
      name: fullName,
      email: email,
      password: hashedPassword,
      phone: data.phone || null,
      skills: data.skills,
      availability: data.availability,
      experienceLevel: data.experienceLevel,
      bio: data.bio || null,
      role: 'volunteer',
      isActive: false,
      isEmailVerified: false,
      approvalStatus: 'pending',
      achievements: [],
      status: 'inactive',
      rating: 0,
      totalTasks: 0,
      completedTasks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        registrationIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    };

    const result = await db.collection('volunteers').insertOne(volunteerData);

    if (!result.acknowledged) {
      throw new Error('Failed to insert volunteer data');
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! Your application has been submitted for admin approval.",
      data: {
        userId: result.insertedId,
        email: email,
        name: fullName,
        role: 'volunteer',
        approvalStatus: 'pending',
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