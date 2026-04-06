import { connectToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();

    // Required fields check
    const requiredFields = ['email', 'password'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    const email = data.email.toLowerCase();
    const role = data.role;

       // ================= CITIZEN LOGIN =================
       if (role === 'citizen') {
        const citizen = await db.collection('citizens').findOne({ email });
  
        if (!citizen) {
          return NextResponse.json({
            success: false,
            message: "No account found with this email. Please sign up first.",
            code: "ACCOUNT_NOT_FOUND"
          });
        }
  
        if (citizen.isActive === false) {
          return NextResponse.json({
            success: false,
            message: "Your account has been deactivated. Please contact administrator."
          });
        }
  
        const isPasswordValid = await bcrypt.compare(data.password, citizen.password);
  
        if (!isPasswordValid) {
          return NextResponse.json({
            success: false,
            message: "Incorrect password. Please try again.",
            code: "INCORRECT_PASSWORD"
          });
        }
  
        const token = jwt.sign(
          {
            userId: citizen._id,
            role: 'citizen',
            email: citizen.email,
            name: citizen.name
          },
          process.env.JWT_SECRET as string,
          { expiresIn: "7d" }
        );
        
        await db.collection('citizens').updateOne(
          { _id: citizen._id },
          {
            $set: {
              lastLoginAt: new Date(),
              updatedAt: new Date()
            }
          }
        );
  
        return NextResponse.json({
          success: true,
          message: "Login successful!",
          data: {
            user: {
              id: citizen._id,
              name: citizen.name,
              email: citizen.email,
              role: 'citizen',
              avatar: citizen.avatar || null,
              isEmailVerified: citizen.isEmailVerified || false,
            },
            token: token
          }
        });
      }


       // ================= VOLUNTEER LOGIN =================


       else if (role == 'volunteer') {
        const volunteer = await db.collection('volunteers').findOne({ email });
      
        if (!volunteer) {
          return NextResponse.json({
            success: false,
            message: "No account found with this email. Please apply to become a volunteer first.",
            code: "ACCOUNT_NOT_FOUND"
          });
        }

        if (volunteer.approvalStatus === 'pending') {
          return NextResponse.json({
            success: false,
            message: "Your account is pending admin approval. You will receive an email once approved.",
            code: "ACCOUNT_PENDING_APPROVAL"
          }, { status: 403 });
        }

        if (volunteer.approvalStatus === 'rejected') {
          return NextResponse.json({
            success: false,
            message: volunteer.rejectionReason 
              ? `Your application was rejected: ${volunteer.rejectionReason}. Please contact support.`
              : "Your volunteer application has been rejected. Please contact support for more information.",
            code: "ACCOUNT_REJECTED"
          }, { status: 403 });
        }
        if (volunteer.isActive === false) {
          return NextResponse.json({
            success: false,
            message: "Your account has been deactivated. Please contact administrator."
          });
        }

        const isPasswordValid = await bcrypt.compare(data.password, volunteer.password);

        if (!isPasswordValid) {
          return NextResponse.json({
            success: false,
            message: "Incorrect password. Please try again.",
            code: "INCORRECT_PASSWORD"
          });
        }

  const token = jwt.sign(
    {
      userId: volunteer._id,
      role: 'volunteer',
      email: volunteer.email,
      name: volunteer.name,
      approvalStatus: volunteer.approvalStatus
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d"}
  );

  await db.collection("volunteers").updateOne(
    { _id: volunteer._id },
    {
      $set: {
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }
    }
  );


  return NextResponse.json({
    success: true,
    message: "Login successful!",
    data: {
      user: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: 'volunteer',
        avatar: volunteer.avatar || null,
        skills: volunteer.skills || [],
        approvalStatus: volunteer.approvalStatus,
        isEmailVerified: volunteer.isEmailVerified || false,
      },
      token: token
    }
  });
}


      // ================= ADMIN LOGIN =================
else if (role === 'admin') {
  const securityKey = data.securityKey;

  if (!securityKey) {
    return NextResponse.json({
      success: false,
      message: "Admin security key is required"
    });
  }
  
  const admin = await db.collection('admins').findOne({ email });
  if (!admin) {
    return NextResponse.json({
      success: false,
      message: "No admin account found with this email.",
      code: "ACCOUNT_NOT_FOUND"
    });
  }

  if (admin.isActive === false) {
    return NextResponse.json({
      success: false,
      message: "Admin account has been deactivated. Please contact super admin."
    });
  }

  const isPasswordValid = await bcrypt.compare(data.password, admin.password);

  if (!isPasswordValid) {
    return NextResponse.json({
      success: false,
      message: "Incorrect password. Please try again.",
      code: "INCORRECT_PASSWORD"
    });
  }

  const token = jwt.sign(
    {
      userId: admin._id,
      role: 'admin',
      email: admin.email,
      name: admin.name,
      isSuperAdmin: admin.isSuperAdmin || false // Agar future ch 2 admins hone ta
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
  
  await db.collection('admins').updateOne(
    { _id: admin._id },
    {
      $set: {
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }
    }
  );

  return NextResponse.json({
    success: true,
    message: "Admin login successful!",
    data: {
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        avatar: admin.avatar || null,
        permissions: admin.permissions || ['all'], // Admin kol sare permissions
        department: admin.department || 'Administration',
        isEmailVerified: admin.isEmailVerified || false,
      },
      token: token
    }
  });
}





       // ================= INVALID ROLE =================
    else {
      return NextResponse.json({
        success: false,
        message: "Invalid role specified"
      });
    }

  } catch (error) {
    console.error("❌ Login error:", error);

    return NextResponse.json({
      success: false,
      message: "Server error. Please try again."
    });
  }
}
