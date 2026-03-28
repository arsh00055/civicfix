import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    console.log('📝 Registration request received:', { role, email: body.email });

    // Check if role is provided
    if (!role) {
      return NextResponse.json({
        success: false,
        message: "Role is required. Must be 'citizen' or 'volunteer'"
      }, { status: 400 });
    }

    // Validate role
    if (role !== 'citizen' && role !== 'volunteer') {
      return NextResponse.json({
        success: false,
        message: "Invalid role. Must be 'citizen' or 'volunteer'"
      }, { status: 400 });
    }

    // Forward to specific role handler based on role
    if (role === 'citizen') {
      // Import citizen registration handler
      const { POST: citizenPOST } = await import('./citizen/route');
      return citizenPOST(body);
    } 
    
    if (role === 'volunteer') {
      // Import volunteer registration handler
      const { POST: volunteerPOST } = await import('./volunteer/route');
      return volunteerPOST(body);
    }

    return NextResponse.json({
      success: false,
      message: "Invalid role specified"
    }, { status: 400 });

  } catch (error) {
    console.error("❌ Registration route error:", error);
    return NextResponse.json({
      success: false,
      message: "Server error. Please try again."
    }, { status: 500 });
  }
}