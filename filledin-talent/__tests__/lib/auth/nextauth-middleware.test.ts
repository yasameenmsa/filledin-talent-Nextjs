/**
 * Tests for NextAuth Middleware (lib/auth/nextauth-middleware.ts)
 */
import { NextRequest, NextResponse } from 'next/server';

// Mock NextAuth
jest.mock('@/auth', () => ({
    auth: jest.fn(),
}));

// Mock MongoDB and User model
jest.mock('@/lib/db/mongodb', () => jest.fn());

jest.mock('@/models/User', () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
    }
}));

import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

const mockAuth = auth as jest.Mock;
const mockDbConnect = dbConnect as jest.Mock;
const mockFindById = User.findById as jest.Mock;

import {
    nextAuthMiddleware,
    withNextAuth,
    withJobSeekerAuth,
    withAdminAuth,
    getUserId,
} from '@/lib/auth/nextauth-middleware';

describe('NextAuth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('nextAuthMiddleware core function', () => {
        it('should return error if no session exists', async () => {
            mockAuth.mockResolvedValueOnce(null);

            const req = { url: 'http://localhost:3000/api/test', headers: new Headers() } as unknown as NextRequest;
            const result = await nextAuthMiddleware(req);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Authentication required');
        });

        it('should return error if user not in database', async () => {
            mockAuth.mockResolvedValueOnce({ user: { id: '123' } });

            // Mock db returns correctly but findById returns null (deleted user)
            mockDbConnect.mockResolvedValueOnce(true);
            mockFindById.mockReturnValueOnce({ lean: () => Promise.resolve(null) });

            const req = { url: 'http://localhost:3000/api/test', headers: new Headers() } as unknown as NextRequest;
            const result = await nextAuthMiddleware(req);

            expect(result.success).toBe(false);
            expect(result.error).toBe('User not found');
        });

        it('should return error if account is deleted', async () => {
            mockAuth.mockResolvedValueOnce({ user: { id: '123' } });

            mockDbConnect.mockResolvedValueOnce(true);
            mockFindById.mockReturnValueOnce({
                lean: () => Promise.resolve({
                    _id: '123',
                    email: 'test@example.com',
                    isDeleted: true
                })
            });

            const req = { url: 'http://localhost:3000/api/test', headers: new Headers() } as unknown as NextRequest;
            const result = await nextAuthMiddleware(req);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Account has been deactivated');
        });

        it('should return success and user data if valid', async () => {
            mockAuth.mockResolvedValueOnce({ user: { id: '123' } });

            const userData = {
                _id: '123',
                email: 'test@example.com',
                role: 'job_seeker',
            };

            mockDbConnect.mockResolvedValueOnce(true);
            mockFindById.mockReturnValueOnce({
                lean: () => Promise.resolve(userData)
            });

            const req = { url: 'http://localhost:3000/api/test', headers: new Headers() } as unknown as NextRequest;
            const result = await nextAuthMiddleware(req);

            expect(result.success).toBe(true);
            expect(result.user?.id).toBe('123');
            expect(result.user?.email).toBe('test@example.com');
            expect(result.user?.role).toBe('job_seeker');
        });

        it('should enforce requiredRole', async () => {
            mockAuth.mockResolvedValueOnce({ user: { id: '123' } });

            mockDbConnect.mockResolvedValueOnce(true);
            mockFindById.mockReturnValueOnce({
                lean: () => Promise.resolve({ _id: '123', email: 'test@example.com', role: 'job_seeker' })
            });

            const req = { url: 'http://localhost:3000/api/test', headers: new Headers() } as unknown as NextRequest;

            // User is job_seeker, required is admin -> should fail
            const result = await nextAuthMiddleware(req, { requiredRole: 'admin' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Insufficient permissions');
        });

        it('should enforce allowedRoles', async () => {
            mockAuth.mockResolvedValueOnce({ user: { id: '123' } });

            mockDbConnect.mockResolvedValueOnce(true);
            mockFindById.mockReturnValueOnce({
                lean: () => Promise.resolve({ _id: '123', email: 'test@example.com', role: 'admin' })
            });

            const req = { url: 'http://localhost:3000/api/test', headers: new Headers() } as unknown as NextRequest;

            // User is admin, allowed is job_seeker, business -> should fail
            const result = await nextAuthMiddleware(req, { allowedRoles: ['job_seeker', 'business'] });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Access denied for this role');
        });

        it('should enforce email verification', async () => {
            mockAuth.mockResolvedValueOnce({ user: { id: '123' } });

            mockDbConnect.mockResolvedValueOnce(true);
            mockFindById.mockReturnValueOnce({
                lean: () => Promise.resolve({ _id: '123', email: 'test@example.com', isEmailVerified: false })
            });

            const req = { url: 'http://localhost:3000/api/test', headers: new Headers() } as unknown as NextRequest;
            const result = await nextAuthMiddleware(req, { requireEmailVerification: true });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Email verification required');
        });
    });

    describe('Higher-order Middleware Functions', () => {
        let mockHandler: jest.Mock;

        beforeEach(() => {
            mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ ok: true }));

            // Setup successful auth state for wrapper functions
            mockAuth.mockResolvedValue({ user: { id: '123' } });
            mockDbConnect.mockResolvedValue(true);
        });

        it('withNextAuth wraps handler and injects user object', async () => {
            mockFindById.mockReturnValue({
                lean: () => Promise.resolve({ _id: '123', email: 'test@example.com' })
            });

            const protectedHandler = withNextAuth(mockHandler);
            const req = { url: 'http://localhost:3000/api/test', headers: new Headers() } as unknown as NextRequest;

            await protectedHandler(req);

            // Handler was called
            expect(mockHandler).toHaveBeenCalled();

            // Request object mutated with user
            const handlerReq = mockHandler.mock.calls[0][0];
            const handlerUser = mockHandler.mock.calls[0][1];

            expect(handlerReq.user).toBeDefined();
            expect(handlerUser.id).toBe('123');
        });

        it('withAdminAuth enforces admin role', async () => {
            mockFindById.mockReturnValueOnce({
                lean: () => Promise.resolve({ _id: '123', role: 'job_seeker' })
            });

            const protectedHandler = withAdminAuth(mockHandler);
            const req = { url: 'http://localhost:3000/api/test', headers: new Headers() } as unknown as NextRequest;

            const res = await protectedHandler(req);

            expect(mockHandler).not.toHaveBeenCalled();
            expect(res.status).toBe(401);
        });

        it('withJobSeekerAuth enforces job_seeker role', async () => {
            mockFindById.mockReturnValueOnce({
                lean: () => Promise.resolve({ _id: '123', role: 'admin' })
            });

            const protectedHandler = withJobSeekerAuth(mockHandler);
            const req = { url: 'http://localhost:3000/api/test', headers: new Headers() } as unknown as NextRequest;

            const res = await protectedHandler(req);

            expect(mockHandler).not.toHaveBeenCalled();
            expect(res.status).toBe(401);
        });
    });

    describe('Utility Functions', () => {
        it('getUserId extracts id from authenticated request', () => {
            const mockReq = {
                user: { id: 'abc-123' }
            } as unknown as NextRequest;

            expect(getUserId(mockReq)).toBe('abc-123');
        });

        it('getUserId returns null for unauthenticated request', () => {
            const mockReq = {} as unknown as NextRequest;

            expect(getUserId(mockReq)).toBeNull();
        });
    });
});
