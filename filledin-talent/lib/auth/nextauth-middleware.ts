import { NextRequest, NextResponse } from 'next/server';
// import { Session } from 'next-auth';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export interface UserData {
  _id: string;
  email: string;
  role: 'job_seeker' | 'admin';
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatar?: string;
    skills?: string[];
    experience?: Array<{
      company: string;
      position: string;
      startDate: Date;
      endDate?: Date;
      description?: string;
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      field: string;
      startDate: Date;
      endDate?: Date;
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      issueDate: Date;
      expiryDate?: Date;
      credentialId?: string;
    }>;
    portfolio?: Array<{
      title: string;
      description: string;
      url: string;
      imageUrl?: string;
    }>;
    socialLinks?: {
      linkedin?: string;
      github?: string;
      website?: string;
      twitter?: string;
    };
  };
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    jobAlerts?: boolean;
    marketingEmails?: boolean;
    language?: string;
    timezone?: string;
    theme?: string;
  };
  isActive?: boolean;
  isDeleted?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthenticatedUser {
  id: string;
  userId: string;
  email: string;
  role: 'job_seeker' | 'admin';
  userData?: UserData;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

export interface AuthMiddlewareOptions {
  requiredRole?: string | string[];
  allowedRoles?: string | string[];
  requireEmailVerification?: boolean;
}

/**
 * NextAuth Authentication middleware for API routes
 */
export async function nextAuthMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  try {
    // Get session from NextAuth
    const session = await auth();

    if (!session || !session.user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Connect to database and fetch user data
    await dbConnect();
    const userData = await User.findById(session.user.id).lean() as UserData | null;

    if (!userData) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Check if user account is active
    if (userData.isDeleted) {
      return {
        success: false,
        error: 'Account has been deactivated'
      };
    }

    // Role-based access control
    if (options.requiredRole) {
      const requiredRoles = Array.isArray(options.requiredRole)
        ? options.requiredRole
        : [options.requiredRole];

      if (!requiredRoles.includes(userData.role)) {
        return {
          success: false,
          error: 'Insufficient permissions'
        };
      }
    }

    if (options.allowedRoles) {
      const allowedRoles = Array.isArray(options.allowedRoles)
        ? options.allowedRoles
        : [options.allowedRoles];

      if (!allowedRoles.includes(userData.role)) {
        return {
          success: false,
          error: 'Access denied for this role'
        };
      }
    }

    // Email verification check (if required)
    if (options.requireEmailVerification && !userData.isEmailVerified) {
      return {
        success: false,
        error: 'Email verification required'
      };
    }

    return {
      success: true,
      user: {
        id: userData._id.toString(),
        userId: userData._id.toString(), // For backward compatibility
        email: userData.email,
        role: userData.role,
        userData
      }
    };

  } catch (error) {
    console.error('NextAuth middleware error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Higher-order function to create protected API route handlers with NextAuth
 */
export function withNextAuth(
  handler: (request: AuthenticatedRequest, user: AuthenticatedUser, context?: Record<string, unknown>) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest, context?: Record<string, unknown>) => {
    const authResult = await nextAuthMiddleware(request, options);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Add user to request object
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = authResult.user;

    return handler(authenticatedRequest, authResult.user!, context);
  };
}

/**
 * Middleware for job seeker-only routes
 */
export function withJobSeekerAuth(
  handler: (request: AuthenticatedRequest, user: AuthenticatedUser, context?: Record<string, unknown>) => Promise<NextResponse>
) {
  return withRoleAuth(['job_seeker'], handler);
}

/**
 * Middleware for admin-only routes
 */
export function withAdminAuth(
  handler: (request: AuthenticatedRequest, user: AuthenticatedUser, context?: Record<string, unknown>) => Promise<NextResponse>
) {
  return withNextAuth(handler, { requiredRole: 'admin' });
}

/**
 * Middleware for routes that allow multiple roles
 */
export function withRoleAuth(
  roles: string[],
  handler: (request: AuthenticatedRequest, user: AuthenticatedUser, context?: Record<string, unknown>) => Promise<NextResponse>
) {
  return withNextAuth(handler, { allowedRoles: roles });
}

/**
 * Extract user ID from authenticated request
 */
export function getUserId(request: AuthenticatedRequest): string | null {
  return request.user?.id || null;
}