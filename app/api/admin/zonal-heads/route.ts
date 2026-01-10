import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, email, phone, zone } = await request.json();

    if (!['EAST', 'WEST', 'NORTH', 'SOUTH'].includes(zone)) {
      return NextResponse.json(
        { error: 'Invalid zone specified' },
        { status: 400 }
      );
    }

    const existingZoneHead = await prisma.user.findFirst({
      where: { 
        role: 'ZONAL_HEAD',
        zone: zone as any
      }
    });

    if (existingZoneHead) {
      return NextResponse.json(
        { error: `${zone} zone already has a head` },
        { status: 400 }
      );
    }
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);

    const zonalHead = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'ZONAL_HEAD',
        zone: zone as any,
        createdById: user.userId
      }
    });

    await sendEmail({
      to: email,
      subject: 'Your Zonal Head Credentials',
      html: `
        <h2>Welcome to InnovFest Campus Ambassador Portal</h2>
        <p>You have been registered as a Zonal Head for ${zone} zone.</p>
        <p>Your login credentials:</p>
        <p>Email: ${email}</p>
        <p>Password: ${tempPassword}</p>
        <p>Please change your password after first login.</p>
      `
    });

    return NextResponse.json({ 
      message: 'Zonal Head created successfully',
      zonalHead: {
        id: zonalHead.id,
        name: zonalHead.name,
        email: zonalHead.email,
        zone: zonalHead.zone
      }
    });

  } catch (error) {
    console.error('Error creating Zonal Head:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const zonalHeads = await prisma.user.findMany({
      where: { role: 'ZONAL_HEAD' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        zone: true,
        isActive: true,
        _count: {
          select: {
            createdUsers: true,
            students: true
          }
        }
      },
      orderBy: { zone: 'asc' }
    });

    return NextResponse.json({ zonalHeads });
  } catch (error) {
    console.error('Error fetching Zonal Heads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
