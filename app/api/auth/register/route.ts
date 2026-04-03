
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({
        success: false,
        message: "Role is required. Must be 'citizen' or 'volunteer'"
      }, { status: 400 });
    }

    if (role !== 'citizen' && role !== 'volunteer') {
      return NextResponse.json({
        success: false,
        message: "Invalid role. Must be 'citizen' or 'volunteer'"
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // ================= CITIZEN REGISTRATION =================
    if (role === 'citizen') {
      const { email, password, firstName, lastName, phone, address, city, state, zipCode } = body;

      const requiredFields = ['email', 'password', 'firstName', 'lastName'];
      const missingFields = requiredFields.filter(f => !body[f]);
      if (missingFields.length > 0) {
        return NextResponse.json({ success: false, message: `Missing fields: ${missingFields.join(', ')}` }, { status: 400 });
      }

      const emailLower = email.toLowerCase();
      const existing = await db.collection('citizens').findOne({ email: emailLower });
      if (existing) {
        return NextResponse.json({ success: false, message: 'Email already registered.' }, { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.collection('citizens').insertOne({
        name: `${firstName} ${lastName}`,
        firstName, lastName,
        email: emailLower,
        password: hashedPassword,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        role: 'citizen',
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Citizen registered successfully!',
        data: { userId: result.insertedId, email: emailLower, role: 'citizen' }
      }, { status: 201 });
    }

    // ================= VOLUNTEER REGISTRATION =================
    if (role === 'volunteer') {
      const { email, password, firstName, lastName, skills, availability, experienceLevel, phone, bio } = body;

      const requiredFields = ['email', 'password', 'firstName', 'lastName', 'skills', 'availability', 'experienceLevel'];
      const missingFields = requiredFields.filter(f => !body[f]);
      if (missingFields.length > 0) {
        return NextResponse.json({ success: false, message: `Missing fields: ${missingFields.join(', ')}` }, { status: 400 });
      }

      if (password.length < 8) {
        return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
      }

      if (!Array.isArray(skills) || skills.length === 0) {
        return NextResponse.json({ success: false, message: 'At least one skill is required' }, { status: 400 });
      }

      const emailLower = email.toLowerCase();

      // Check duplicate in both collections
      const [existingCitizen, existingVolunteer] = await Promise.all([
        db.collection('citizens').findOne({ email: emailLower }),
        db.collection('volunteers').findOne({ email: emailLower }),
      ]);

      if (existingCitizen) {
        return NextResponse.json({ success: false, message: 'Email already registered as citizen.' }, { status: 409 });
      }
      if (existingVolunteer) {
        return NextResponse.json({ success: false, message: 'Email already registered.' }, { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.collection('volunteers').insertOne({
        name: `${firstName} ${lastName}`,
        firstName, lastName,
        email: emailLower,
        password: hashedPassword,
        phone: phone || null,
        skills,
        availability: availability || [],
        experienceLevel,
        bio: bio || null,
        role: 'volunteer',
        isActive: false,
        isEmailVerified: false,
        approvalStatus: 'pending',
        status: 'inactive',
        rating: 0,
        totalTasks: 0,
        completedTasks: 0,
        achievements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          registrationIp: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Registration successful! Your application has been submitted for admin approval.',
        data: {
          userId: result.insertedId,
          email: emailLower,
          name: `${firstName} ${lastName}`,
          role: 'volunteer',
          approvalStatus: 'pending',
        }
      }, { status: 201 });
    }

  } catch (error) {
    console.error('❌ Registration route error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error. Please try again.'
    }, { status: 500 });
  }
}