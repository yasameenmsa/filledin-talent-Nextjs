// import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
    isEmailVerified: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
      isEmailVerified: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string;
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    isEmailVerified?: boolean;
  }
}
