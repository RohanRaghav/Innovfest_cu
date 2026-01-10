import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

type CampusAmbassadorSnapshot = {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  college?: string | null;
  target: number | null;
  currentCount: number;
  isActive: boolean;
  createdAt: Date;
};

type RecentStudent = {
  id: string;
  name: string;
  email: string;
  college: string;
  phone: string;
  createdAt: Date;
  registeredById: string;
};

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'ZONAL_HEAD' || !user.zone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [campusAmbassadors, students, badges] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'CAMPUS_AMBASSADOR',
          zone: user.zone,
          createdById: user.userId,
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
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }) as Promise<CampusAmbassadorSnapshot[]>,
      prisma.student.findMany({
        where: {
          registeredBy: {
            zone: user.zone,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          college: true,
          phone: true,
          createdAt: true,
          registeredById: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }) as Promise<RecentStudent[]>,
      prisma.userBadge.count({
        where: {
          user: {
            role: 'CAMPUS_AMBASSADOR',
            zone: user.zone,
            createdById: user.userId,
          },
        },
      }),
    ]);

    const totals = {
      campusAmbassadors: campusAmbassadors.length,
      caLimit: 50,
      students: students.length,
      targetsAssigned: campusAmbassadors.reduce<number>(
        (sum: number, ca: CampusAmbassadorSnapshot) => sum + (ca.target ?? 0),
        0,
      ),
      registrations: campusAmbassadors.reduce<number>(
        (sum: number, ca: CampusAmbassadorSnapshot) => sum + (ca.currentCount ?? 0),
        0,
      ),
      badgesUnlocked: badges,
    };

    return NextResponse.json({
      zone: user.zone,
      totals,
      campusAmbassadors,
      recentStudents: students,
    });
  } catch (error) {
    console.error('Zonal overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
