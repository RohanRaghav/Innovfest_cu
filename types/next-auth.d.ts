import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      zone?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
    zone?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    zone?: string;
  }
}
