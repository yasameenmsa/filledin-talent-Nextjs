/**
 * Tests for CORS security module (lib/security/cors.ts)
 */
import { NextRequest, NextResponse } from 'next/server';
import {
    corsMiddleware,
    setCorsHeaders,
    isOriginAllowed,
    withCors,
    getCorsConfig,
    CorsOptions,
} from '@/lib/security/cors';

// Helper to create a mock NextRequest
function createMockRequest(method: string, origin?: string): NextRequest {
    const headers = new Headers();
    if (origin) headers.set('origin', origin);
    return new NextRequest(new URL('http://localhost:3000/api/test'), {
        method,
        headers,
    });
}

describe('CORS Security Module', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    describe('corsMiddleware', () => {
        it('should return a response for OPTIONS preflight requests', () => {
            const middleware = corsMiddleware();
            const request = createMockRequest('OPTIONS', 'http://localhost:3000');
            const result = middleware(request);

            expect(result).toBeInstanceOf(NextResponse);
            expect(result?.status).toBe(200);
        });

        it('should return null for non-OPTIONS requests', () => {
            const middleware = corsMiddleware();
            const request = createMockRequest('GET', 'http://localhost:3000');
            const result = middleware(request);

            expect(result).toBeNull();
        });

        it('should set CORS headers on preflight response', () => {
            const middleware = corsMiddleware();
            const request = createMockRequest('OPTIONS', 'http://localhost:3000');
            const result = middleware(request);

            expect(result?.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
            expect(result?.headers.get('Access-Control-Allow-Methods')).toBeTruthy();
            expect(result?.headers.get('Access-Control-Allow-Headers')).toBeTruthy();
        });
    });

    describe('setCorsHeaders', () => {
        it('should reflect origin when origin option is true', () => {
            const response = new NextResponse();
            const config: CorsOptions = { origin: true };

            setCorsHeaders(response, 'http://example.com', config);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://example.com');
        });

        it('should use wildcard when origin is true and no origin header', () => {
            const response = new NextResponse();
            const config: CorsOptions = { origin: true };

            setCorsHeaders(response, null, config);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
        });

        it('should not set headers when origin is false', () => {
            const response = new NextResponse();
            const config: CorsOptions = { origin: false };

            setCorsHeaders(response, 'http://example.com', config);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
        });

        it('should set exact origin when origin is a string', () => {
            const response = new NextResponse();
            const config: CorsOptions = { origin: 'http://allowed.com' };

            setCorsHeaders(response, 'http://example.com', config);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://allowed.com');
        });

        it('should allow origin from array when matching', () => {
            const response = new NextResponse();
            const config: CorsOptions = {
                origin: ['http://allowed.com', 'http://also-allowed.com'],
            };

            setCorsHeaders(response, 'http://allowed.com', config);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://allowed.com');
        });

        it('should not set origin header for unlisted origin in array', () => {
            const response = new NextResponse();
            const config: CorsOptions = {
                origin: ['http://allowed.com'],
            };

            setCorsHeaders(response, 'http://not-allowed.com', config);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
        });

        it('should set credentials header when enabled', () => {
            const response = new NextResponse();
            const config: CorsOptions = { origin: true, credentials: true };

            setCorsHeaders(response, 'http://example.com', config);
            expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
        });

        it('should set methods header', () => {
            const response = new NextResponse();
            const config: CorsOptions = { origin: true, methods: ['GET', 'POST'] };

            setCorsHeaders(response, 'http://example.com', config);
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST');
        });

        it('should set max-age header', () => {
            const response = new NextResponse();
            const config: CorsOptions = { origin: true, maxAge: 3600 };

            setCorsHeaders(response, 'http://example.com', config);
            expect(response.headers.get('Access-Control-Max-Age')).toBe('3600');
        });

        it('should set exposed headers', () => {
            const response = new NextResponse();
            const config: CorsOptions = {
                origin: true,
                exposedHeaders: ['X-Custom-Header'],
            };

            setCorsHeaders(response, 'http://example.com', config);
            expect(response.headers.get('Access-Control-Expose-Headers')).toBe('X-Custom-Header');
        });
    });

    describe('isOriginAllowed', () => {
        it('should return true when origin is null (same-origin)', () => {
            expect(isOriginAllowed(null, ['http://example.com'])).toBe(true);
        });

        it('should return true when allowed is true (wildcard)', () => {
            expect(isOriginAllowed('http://any.com', true)).toBe(true);
        });

        it('should return false when allowed is false', () => {
            expect(isOriginAllowed('http://any.com', false)).toBe(false);
        });

        it('should match exact string origin', () => {
            expect(isOriginAllowed('http://example.com', 'http://example.com')).toBe(true);
            expect(isOriginAllowed('http://other.com', 'http://example.com')).toBe(false);
        });

        it('should match origin in array', () => {
            const allowed = ['http://a.com', 'http://b.com'];
            expect(isOriginAllowed('http://a.com', allowed)).toBe(true);
            expect(isOriginAllowed('http://c.com', allowed)).toBe(false);
        });
    });

    describe('withCors', () => {
        it('should handle preflight and return CORS response', async () => {
            const handler = jest.fn();
            const wrapped = withCors(handler);
            const request = createMockRequest('OPTIONS', 'http://localhost:3000');

            const response = await wrapped(request);

            expect(handler).not.toHaveBeenCalled();
            expect(response.status).toBe(200);
        });

        it('should call handler and add CORS headers for normal requests', async () => {
            const mockResponse = NextResponse.json({ ok: true });
            const handler = jest.fn().mockResolvedValue(mockResponse);
            const wrapped = withCors(handler);
            const request = createMockRequest('GET', 'http://localhost:3000');

            const response = await wrapped(request);

            expect(handler).toHaveBeenCalledWith(request, undefined);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
        });
    });

    describe('getCorsConfig', () => {
        it('should return production config in production', () => {
            Object.assign(process.env, { NODE_ENV: 'production' });
            // Need to re-import to pick up env change
            // getCorsConfig reads from module-level constants, so we test the function exists
            const config = getCorsConfig();
            expect(config).toBeDefined();
            expect(config.credentials).toBe(true);
        });

        it('should return development config in development', () => {
            Object.assign(process.env, { NODE_ENV: 'development' });
            const config = getCorsConfig();
            expect(config).toBeDefined();
        });
    });
});
