import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

// Create a new Campus Ambassador
// POST /api/zonal/campus-ambassadors
export async function POST(request: Request) {
  try {
    // Verify Zonal Head role
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ZONAL_HEAD' || !user.zone) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, email, phone, college, target } = await request.json();

    // Check if zone has reached max CAs (50)
    const caCount = await prisma.user.count({
      where: { 
        role: 'CAMPUS_AMBASSADOR',
        zone: user.zone as any,
        createdById: user.userId
      }
    });

    if (caCount >= 50) {
      return NextResponse.json(
        { error: 'Maximum number of Campus Ambassadors (50) reached for this zone' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Generate a random password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);

    // Create the Campus Ambassador
    const campusAmbassador = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        college,
        password: hashedPassword,
        role: 'CAMPUS_AMBASSADOR',
        zone: user.zone as any,
        target: target || 0,
        createdById: user.userId
      }
    });

    // Send email with credentials
    await sendEmail({
      to: email,
      subject: 'Your Campus Ambassador Credentials',
      html: `
        <h2>Welcome to InnovFest Campus Ambassador Program</h2>
        <p>You have been registered as a Campus Ambassador for ${user.zone} zone.</p>
        <p>Your login credentials:</p>
        <p>Email: ${email}</p>
        <p>Password: ${tempPassword}</p>
        <p>Please change your password after first login.</p>
        ${target ? `<p>Your registration target: ${target} students</p>` : ''}
      `
    });

    return NextResponse.json({ 
      message: 'Campus Ambassador created successfully',
      campusAmbassador: {
        id: campusAmbassador.id,
        name: campusAmbassador.name,
        email: campusAmbassador.email,
        college: campusAmbassador.college,
        target: campusAmbassador.target
      }
    });

  } catch (error) {
    console.error('Error creating Campus Ambassador:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all Campus Ambassadors for the zone
// GET /api/zonal/campus-ambassadors
export async function GET(request: Request) {
  try {
    // Verify Zonal Head role
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ZONAL_HEAD' || !user.zone) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campusAmbassadors = await prisma.user.findMany({
      where: { 
        role: 'CAMPUS_AMBASSADOR',
        zone: user.zone as any,
        createdById: user.userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        college: true,
        target: true,
        currentCount: true,
        isActive: true,
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ campusAmbassadors });
  } catch (error) {
    console.error('Error fetching Campus Ambassadors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
