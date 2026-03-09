/**
 * Tests for CSRF protection module (lib/security/csrf.ts)
 */

// Mock next/headers
jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

import { cookies } from 'next/headers';

import { NextResponse, NextRequest } from 'next/server';
import {
    validateCsrfToken,
    withCsrfProtection,
    useCsrfToken,
} from '@/lib/security/csrf';

// Helper to create a mock NextRequest
function createMockRequest(method: string, options: { body?: unknown; csrfHeader?: string } = {}) {
    const headers = new global.Headers();
    if (options.csrfHeader) {
        headers.set('x-csrf-token', options.csrfHeader);
    }
    headers.set('content-type', 'application/json');

    const request = {
        method,
        url: 'http://localhost:3000/api/test',
        headers,
        clone() { return this; }
    } as unknown as NextRequest;

    if (options.body && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        request.json = () => Promise.resolve(options.body);
        request.text = () => Promise.resolve(JSON.stringify(options.body));
    } else {
        request.json = () => Promise.resolve({});
        request.text = () => Promise.resolve('');
    }

    return request;
}

const mockCookieGet = jest.fn();
const mockCookieSet = jest.fn();

describe('CSRF Protection Module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (cookies as jest.Mock).mockResolvedValue({
            get: mockCookieGet,
            set: mockCookieSet,
        });
    });

    describe('validateCsrfToken', () => {
        it('should skip validation for GET requests', async () => {
            const request = createMockRequest('GET');
            const result = await validateCsrfToken(request);
            expect(result).toBe(true);
        });

        it('should skip validation for HEAD requests', async () => {
            const request = createMockRequest('HEAD');
            const result = await validateCsrfToken(request);
            expect(result).toBe(true);
        });

        it('should skip validation for OPTIONS requests', async () => {
            const request = createMockRequest('OPTIONS');
            const result = await validateCsrfToken(request);
            expect(result).toBe(true);
        });

        it('should return false when no cookie token exists', async () => {
            mockCookieGet.mockReturnValue(undefined);
            const request = createMockRequest('POST');

            const result = await validateCsrfToken(request);
            expect(result).toBe(false);
        });

        it('should return false when header token does not match cookie', async () => {
            mockCookieGet.mockReturnValue({ value: 'cookie-token-abc' });
            const request = createMockRequest('POST', { csrfHeader: 'wrong-token' });

            const result = await validateCsrfToken(request);
            expect(result).toBe(false);
        });

        it('should return true when header token matches cookie token', async () => {
            const token = 'matching-csrf-token-123';
            mockCookieGet.mockReturnValue({ value: token });
            const request = createMockRequest('POST', { csrfHeader: token });

            const result = await validateCsrfToken(request);
            expect(result).toBe(true);
        });

        it('should accept token from request body', async () => {
            const token = 'body-csrf-token-456';
            mockCookieGet.mockReturnValue({ value: token });
            const request = createMockRequest('POST', {
                body: { csrfToken: token },
            });

            const result = await validateCsrfToken(request);
            expect(result).toBe(true);
        });

        it('should accept _csrf field from body', async () => {
            const token = 'body-csrf-token-789';
            mockCookieGet.mockReturnValue({ value: token });
            const request = createMockRequest('POST', {
                body: { _csrf: token },
            });

            const result = await validateCsrfToken(request);
            expect(result).toBe(true);
        });
    });

    describe('withCsrfProtection', () => {
        it('should pass through GET requests without validation', async () => {
            const mockHandler = jest.fn().mockResolvedValue(
                NextResponse.json({ ok: true })
            );
            const protected_ = withCsrfProtection(mockHandler);
            const request = createMockRequest('GET');

            await protected_(request);
            expect(mockHandler).toHaveBeenCalled();
        });

        it('should return 403 for invalid CSRF on POST', async () => {
            mockCookieGet.mockReturnValue(undefined);
            const mockHandler = jest.fn();
            const protected_ = withCsrfProtection(mockHandler);
            const request = createMockRequest('POST');

            const response = await protected_(request);

            expect(mockHandler).not.toHaveBeenCalled();
            expect(response.status).toBe(403);
            const body = await response.json();
            expect(body.error).toBe('CSRF token validation failed');
        });

        it('should call handler for valid CSRF on POST', async () => {
            const token = 'valid-token';
            mockCookieGet.mockReturnValue({ value: token });
            const mockHandler = jest.fn().mockResolvedValue(
                NextResponse.json({ ok: true })
            );
            const protected_ = withCsrfProtection(mockHandler);
            const request = createMockRequest('POST', { csrfHeader: token });

            await protected_(request);
            expect(mockHandler).toHaveBeenCalled();
        });
    });

    describe('useCsrfToken', () => {
        it('should return an object with getCsrfToken function', () => {
            const hook = useCsrfToken();
            expect(hook).toHaveProperty('getCsrfToken');
            expect(typeof hook.getCsrfToken).toBe('function');
        });
    });
});
