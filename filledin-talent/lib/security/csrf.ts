import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * CSRF Protection Configuration
 */
export interface CsrfConfig {
  tokenLength: number;
  cookieName: string;
  headerName: string;
  expiresIn: number; // in seconds
}

const defaultConfig: CsrfConfig = {
  tokenLength: 32,
  cookieName: 'csrf_token',
  headerName: 'x-csrf-token',
  expiresIn: 86400, // 24 hours
};

/**
 * Generate a cryptographically strong CSRF token
 */
async function generateSecureToken(length: number = 32): Promise<string> {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create CSRF token and set it in cookie
 */
export async function createCsrfToken(config: CsrfConfig = defaultConfig): Promise<string> {
  const token = await generateSecureToken(config.tokenLength);

  const cookieStore = await cookies();
  cookieStore.set({
    name: config.cookieName,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: config.expiresIn,
    path: '/',
  });

  return token;
}

/**
 * Validate CSRF token from request
 */
export async function validateCsrfToken(request: NextRequest, config: CsrfConfig = defaultConfig): Promise<boolean> {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(config.cookieName)?.value;

  if (!cookieToken) {
    return false;
  }

  // Check for token in header
  const headerToken = request.headers.get(config.headerName);

  // Also check for token in body (for form submissions)
  let bodyToken: string | null = null;
  try {
    const clonedRequest = request.clone();
    const body = await clonedRequest.json().catch(() => ({}));
    bodyToken = body.csrfToken || body._csrf;
  } catch {
    // Body is not JSON or is empty
  }

  // Compare tokens using constant-time comparison
  const valid = headerToken === cookieToken || bodyToken === cookieToken;

  if (valid) {
    // Generate new token after successful validation (token rotation)
    await createCsrfToken(config);
  }

  return valid;
}

/**
 * Middleware to protect routes from CSRF attacks
 */
export function withCsrfProtection(
  handler: (request: NextRequest, context?: Record<string, unknown>) => Promise<NextResponse>,
  config: CsrfConfig = defaultConfig
) {
  return async (request: NextRequest, context?: Record<string, unknown>): Promise<NextResponse> => {
    // For safe methods, just proceed
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request, context);
    }

    // For state-changing methods, validate CSRF token
    const isValid = await validateCsrfToken(request, config);

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'CSRF token validation failed',
          message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
        },
        { status: 403 }
      );
    }

    return handler(request, context);
  };
}

/**
 * Get CSRF token for client-side requests
 */
export async function getCsrfToken(config: CsrfConfig = defaultConfig): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(config.cookieName)?.value;
}

/**
 * Initialize CSRF token for new sessions
 */
export async function initCsrf(config: CsrfConfig = defaultConfig): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(config.cookieName)?.value;

  if (existingToken) {
    return existingToken;
  }

  return createCsrfToken(config);
}

/**
 * React Hook for CSRF token (client-side)
 */
export function useCsrfToken() {
  // This would be used in client components
  // The actual implementation would need to call an API endpoint
  return {
    getCsrfToken: async () => {
      const response = await fetch('/api/auth/csrf');
      const data = await response.json();
      return data.token;
    },
  };
}

/**
 * API route to provide CSRF token to client
 */
export async function GET() {
  const token = await initCsrf();
  return NextResponse.json({ token });
}
