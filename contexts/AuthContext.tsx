'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type UserRole = 'ADMIN' | 'ZONAL_HEAD' | 'CAMPUS_AMBASSADOR';
type Zone = 'EAST' | 'WEST' | 'NORTH' | 'SOUTH' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  zone: Zone;
}

interface AuthContextType {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isAdmin: boolean;
  isZonalHead: boolean;
  isCampusAmbassador: boolean;
  currentZone: Zone;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id as string,
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role as UserRole,
        zone: session.user.zone as Zone,
      });
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status]);

  const isAdmin = user?.role === 'ADMIN';
  const isZonalHead = user?.role === 'ZONAL_HEAD';
  const isCampusAmbassador = user?.role === 'CAMPUS_AMBASSADOR';
  const currentZone = user?.zone || null;

  const value = {
    user,
    status,
    isAdmin,
    isZonalHead,
    isCampusAmbassador,
    currentZone,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher Order Component for protected routes
export function withAuth(Component: React.ComponentType<any>, allowedRoles: UserRole[] = []) {
  return function ProtectedRoute(props: any) {
    const { user, status } = useAuth();

    if (status === 'loading') {
      return <div>Loading...</div>; // Or a loading spinner
    }

    if (status === 'unauthenticated' || !user) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      }
      return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect to unauthorized page
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }
      return null;
    }

    return <Component {...props} user={user} />;
  };
}
