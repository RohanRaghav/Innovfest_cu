import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Register a new student
// POST /api/ca/students
export async function POST(request: Request) {
  try {
    // Verify Campus Ambassador role
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'CAMPUS_AMBASSADOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, email, phone, college } = await request.json();

    // Check if student email already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email }
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this email already registered' },
        { status: 400 }
      );
    }

    // Create the student
    const student = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        college,
        registeredById: user.userId
      }
    });

    // Update CA's current count
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        currentCount: { increment: 1 }
      }
    });

    // Check for badge eligibility
    await checkAndAwardBadges(user.userId);

    return NextResponse.json({ 
      message: 'Student registered successfully',
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        college: student.college,
        registeredAt: student.createdAt
      }
    });

  } catch (error) {
    console.error('Error registering student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all students registered by the CA
// GET /api/ca/students
export async function GET(request: Request) {
  try {
    // Verify Campus Ambassador role
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'CAMPUS_AMBASSADOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: { registeredById: user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          college: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.student.count({
        where: { registeredById: user.userId }
      })
    ]);

    return NextResponse.json({ 
      students,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { students: true }
      },
      badges: {
        select: { badgeId: true }
      }
    }
  });

  if (!user) return;

  const studentCount = user._count.students;
  
  // Find badges that the user hasn't earned yet and the target is <= student count
  const badgesToAward = await prisma.badge.findMany({
    where: {
      targetCount: {
        lte: studentCount
      },
      id: {
        notIn: user.badges.map(b => b.badgeId)
      }
    }
  });

  // Award the badges
  for (const badge of badgesToAward) {
    await prisma.userBadge.create({
      data: {
        userId: user.id,
        badgeId: badge.id
      }
    });
  }
}
