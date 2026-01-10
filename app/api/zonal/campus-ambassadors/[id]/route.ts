import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'ZONAL_HEAD' || !user.zone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { target, isActive } = body as {
      target?: number;
      isActive?: boolean;
    };

    const updates: Record<string, unknown> = {};

    if (typeof target !== 'undefined') {
      if (Number.isNaN(target) || target < 0) {
        return NextResponse.json(
          { error: 'Target must be a non-negative number' },
          { status: 400 },
        );
      }
      updates.target = Math.floor(target);
    }

    if (typeof isActive !== 'undefined') {
      updates.isActive = Boolean(isActive);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 },
      );
    }

    const updated = await prisma.user.updateMany({
      where: {
        id: params.id,
        role: 'CAMPUS_AMBASSADOR',
        zone: user.zone,
        createdById: user.userId,
      },
      data: updates,
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Campus Ambassador not found in your zone' },
        { status: 404 },
      );
    }

    const refreshed = await prisma.user.findUnique({
      where: { id: params.id },
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
    });

    return NextResponse.json({ campusAmbassador: refreshed });
  } catch (error) {
    console.error('Error updating Campus Ambassador:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
