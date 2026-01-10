import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

type Zone = 'EAST' | 'WEST' | 'NORTH' | 'SOUTH';
type Role = 'ADMIN' | 'ZONAL_HEAD' | 'CAMPUS_AMBASSADOR';

const ZONES: Zone[] = ['EAST', 'WEST', 'NORTH', 'SOUTH'];
const MAX_CA_PER_ZONE = 50;
const MAX_CA_TOTAL = 200;

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [zonalHeadCount, campusAmbassadorCount, studentCount, badgeUnlocks, recentZonalHeads] =
      await Promise.all([
        prisma.user.count({ where: { role: 'ZONAL_HEAD' } }),
        prisma.user.count({ where: { role: 'CAMPUS_AMBASSADOR' } }),
        prisma.student.count(),
        prisma.userBadge.count(),
        prisma.user.findMany({
          where: { role: 'ZONAL_HEAD' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, name: true, email: true, zone: true, createdAt: true },
        }),
      ]);

    const zoneStats = await Promise.all(
      ZONES.map(async (zone) => {
        const head = await prisma.user.findFirst({
          where: { role: 'ZONAL_HEAD', zone },
          select: { id: true, name: true, email: true, phone: true, createdAt: true },
        });

        const [caCount, students, targetAggregate, currentAggregate] = await Promise.all([
          prisma.user.count({ where: { role: 'CAMPUS_AMBASSADOR', zone } }),
          prisma.student.count({ where: { registeredBy: { zone } } }),
          prisma.user.aggregate({
            where: { role: 'CAMPUS_AMBASSADOR', zone },
            _sum: { target: true },
          }),
          prisma.user.aggregate({
            where: { role: 'CAMPUS_AMBASSADOR', zone },
            _sum: { currentCount: true },
          }),
        ]);

        return {
          zone,
          head,
          caCount,
          caLimit: MAX_CA_PER_ZONE,
          studentCount: students,
          caTargetTotal: targetAggregate._sum.target ?? 0,
          caCurrentTotal: currentAggregate._sum.currentCount ?? 0,
        };
      }),
    );

    return NextResponse.json({
      totals: {
        zonalHeads: zonalHeadCount,
        campusAmbassadors: campusAmbassadorCount,
        students: studentCount,
        remainingSlots: Math.max(0, MAX_CA_TOTAL - campusAmbassadorCount),
        badgeUnlocks,
      },
      zoneStats,
      recentZonalHeads,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
