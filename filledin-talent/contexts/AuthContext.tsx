'use client';

import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  company?: string;
  position?: string;
  website?: string;
  cvUrl?: string;
  profileImage?: string;
  skills?: string[];
  experience?: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
}

interface UserData {
  id: string;
  _id: string;
  email: string;
  name?: string;
  role: 'job_seeker' | 'employer' | 'admin';
  isEmailVerified: boolean;
  cv?: string;
  profile?: UserProfile;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: UserData | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { email: string; password: string; name?: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserData>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  const user: UserData | null = session?.user ? {
    id: session.user.id,
    _id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as 'job_seeker' | 'employer' | 'admin',
    isEmailVerified: session.user.isEmailVerified,
  } : null;

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: 'Invalid email or password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name?: string;
    role?: string;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: userData.role || 'job_seeker',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      const currentLang = params?.lang || 'en';
      router.push(`/${currentLang}`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserData>) => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Profile update failed' };
      }

      // Update local storage for CV if provided
      if (updates.cv && user._id) {
        const cvData = {
          fileName: updates.cv,
          uploadDate: new Date().toISOString(),
        };
        localStorage.setItem(`cv_${user._id}`, JSON.stringify(cvData));
      }

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  };

  const value: AuthContextType = {
    user,
    userData: user, // userData is an alias for user for backward compatibility
    loading: status === 'loading',
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}