import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload & { userData?: any };
}

export interface AuthMiddlewareOptions {
  requiredRole?: string | string[];
  allowedRoles?: string | string[];
  requireEmailVerification?: boolean;
}

/**
 * JWT Authentication middleware for API routes
 */
export async function authMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{ success: boolean; user?: TokenPayload & { userData?: any }; error?: string }> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Missing or invalid authorization header'
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    let tokenPayload: TokenPayload;
    try {
      tokenPayload = verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }

    // Connect to database and fetch user data
    await dbConnect();
    const userData = await User.findOne({ firebaseUid: tokenPayload.userId }).lean();
    
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
    if (options.requireEmailVerification && !userData.emailVerified) {
      return {
        success: false,
        error: 'Email verification required'
      };
    }

    return {
      success: true,
      user: {
        ...tokenPayload,
        userData
      }
    };

  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Higher-order function to create protected API route handlers
 */
export function withAuth(
  handler: (request: AuthenticatedRequest, user: TokenPayload & { userData?: any }) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest) => {
    const authResult = await authMiddleware(request, options);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Add user to request object
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = authResult.user;

    return handler(authenticatedRequest, authResult.user!);
  };
}

/**
 * Middleware for employer-only routes
 */
export function withEmployerAuth(
  handler: (request: AuthenticatedRequest, user: TokenPayload & { userData?: any }) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: 'employer' });
}

/**
 * Middleware for job seeker-only routes
 */
export function withJobSeekerAuth(
  handler: (request: AuthenticatedRequest, user: TokenPayload & { userData?: any }) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: 'jobseeker' });
}

/**
 * Middleware for admin-only routes
 */
export function withAdminAuth(
  handler: (request: AuthenticatedRequest, user: TokenPayload & { userData?: any }) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: 'admin' });
}

/**
 * Middleware for routes that allow multiple roles
 */
export function withRoleAuth(
  roles: string[],
  handler: (request: AuthenticatedRequest, user: TokenPayload & { userData?: any }) => Promise<NextResponse>
) {
  return withAuth(handler, { allowedRoles: roles });
}

/**
 * Extract user ID from authenticated request
 */
export function getUserId(request: AuthenticatedRequest): string | null {
  return request.user?.userId || null;
}

/**
 * Extract user role from authenticated request
 */
export function getUserRole(request: AuthenticatedRequest): string | null {
  return request.user?.userData?.role || null;
}

/**
 * Check if user has specific role
 */
export function hasRole(request: AuthenticatedRequest, role: string): boolean {
  return getUserRole(request) === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(request: AuthenticatedRequest, roles: string[]): boolean {
  const userRole = getUserRole(request);
  return userRole ? roles.includes(userRole) : false;
}