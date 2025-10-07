'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useParams } from 'next/navigation';

interface UserData {
  _id: string;
  email: string;
  role: 'jobseeker' | 'employer' | 'admin';
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    position?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    experience?: {
      company: string;
      position: string;
      duration: string;
      description: string;
    }[];
    education?: {
      institution: string;
      degree: string;
      field: string;
      year: string;
    }[];
    cvUrl?: string;
    profileImage?: string;
  };
  preferences?: {
    jobCategories: string[];
    locations: string[];
    workingTypes: string[];
    salaryExpectation?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: UserData | null;
  userData: UserData | null; // Alias for user for backward compatibility
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string, profile: { firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang as string || 'en';

  useEffect(() => {
    // Check for stored JWT token on app load
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Verify token with backend
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user: userData, token } = await response.json();
        localStorage.setItem('authToken', token);
        setUser(userData);
        router.push(`/${lang}/dashboard`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, role: string, profile: { firstName: string; lastName: string }) => {
    try {
      // Map frontend role values to backend role values
      const mappedRole = role === 'business' ? 'employer' : role === 'jobSeeker' ? 'jobseeker' : role;
      
      // Register user in MongoDB
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: mappedRole,
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName,
          },
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Auto-login after successful registration
        await login(email, password);
        
        router.push(`/${lang}/onboarding`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('authToken');
      setUser(null);
      router.push(`/${lang}/login`);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserData>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUser(updatedData);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData: user, // Alias for backward compatibility
      loading,
      login,
      register,
      logout,
      updateProfile,
    }}>
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