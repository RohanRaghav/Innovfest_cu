import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole, Zone } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

export function generateToken(userId: string, role: string, zone?: string): string {
  return sign(
    { 
      userId, 
      role,
      ...(zone && { zone }) 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): any {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  const [type, token] = authHeader.split(' ');
  return type === 'Bearer' ? token : null;
}

export async function getUserFromRequest(req: NextRequest): Promise<{ userId: string; role: UserRole; zone?: Zone } | null> {
  const token = await getToken({ req });
  if (!token || !token.sub || !token.role) {
    return null;
  }

  return {
    userId: token.sub,
    role: token.role as UserRole,
    zone: token.zone as Zone | undefined,
  };
}
