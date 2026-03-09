/**
 * Tests for Rate Limiter module (lib/middleware/rate-limiter.ts)
 */

// Mock auth config before import
jest.mock('@/lib/auth/auth-config', () => ({
    authConfig: {
        rateLimit: {
            login: { max: 5, windowMs: 15 * 60 * 1000 },
            register: { max: 3, windowMs: 60 * 60 * 1000 },
        },
    },
}));

import {
    checkLoginRateLimit,
    checkRegisterRateLimit,
    resetLoginRateLimit,
    getClientIdentifier,
} from '@/lib/middleware/rate-limiter';

describe('Rate Limiter Module', () => {
    beforeEach(() => {
        // We can't easily reset the private store of the singleton without reflection,
        // so we'll use unique identifiers for each test.
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('checkLoginRateLimit', () => {
        it('should allow first request', () => {
            const id = 'test1@example.com';
            const result = checkLoginRateLimit(id);

            expect(result.isLimited).toBe(false);
            expect(result.remaining).toBe(4); // authConfig.rateLimit.login.max (5) - 1
        });

        it('should limit request after max attempts exceeded', () => {
            const id = 'test2@example.com';

            // Make 5 requests (max)
            for (let i = 0; i < 5; i++) {
                const result = checkLoginRateLimit(id);
                expect(result.isLimited).toBe(false);
            }

            // 6th request should be limited
            const result = checkLoginRateLimit(id);
            expect(result.isLimited).toBe(true);
            expect(result.remaining).toBe(0);
        });

        it('should reset after windowMs expires', () => {
            const id = 'test3@example.com';

            // Exhaust limits
            for (let i = 0; i < 6; i++) {
                checkLoginRateLimit(id);
            }

            expect(checkLoginRateLimit(id).isLimited).toBe(true);

            // Advance time beyond windowMs (15 min)
            jest.advanceTimersByTime(16 * 60 * 1000);

            // Should be allowed again
            const result = checkLoginRateLimit(id);
            expect(result.isLimited).toBe(false);
            expect(result.remaining).toBe(4);
        });
    });

    describe('checkRegisterRateLimit', () => {
        it('should use different limits for registration', () => {
            const id = 'test-reg-ip';

            // Register limit is 3
            checkRegisterRateLimit(id);
            checkRegisterRateLimit(id);
            const result3 = checkRegisterRateLimit(id);
            expect(result3.isLimited).toBe(false);

            // 4th should be limited
            const result4 = checkRegisterRateLimit(id);
            expect(result4.isLimited).toBe(true);
            expect(result4.remaining).toBe(0);
        });
    });

    describe('resetLoginRateLimit', () => {
        it('should clear limits for a specific identifier', () => {
            const id = 'test4@example.com';

            // Exhaust limits
            for (let i = 0; i < 6; i++) {
                checkLoginRateLimit(id);
            }

            expect(checkLoginRateLimit(id).isLimited).toBe(true);

            // Reset
            resetLoginRateLimit(id);

            // Should be allowed again immediately
            const result = checkLoginRateLimit(id);
            expect(result.isLimited).toBe(false);
            expect(result.remaining).toBe(4);
        });
    });

    describe('getClientIdentifier', () => {
        it('should return x-forwarded-for when present', () => {
            const request = {
                headers: {
                    get: (key: string) => key === 'x-forwarded-for' ? '203.0.113.1, 198.51.100.1' : null
                }
            } as unknown as Request;

            expect(getClientIdentifier(request)).toBe('203.0.113.1');
        });

        it('should return x-real-ip when x-forwarded-for is absent', () => {
            const request = {
                headers: {
                    get: (key: string) => key === 'x-real-ip' ? '203.0.113.2' : null
                }
            } as unknown as Request;

            expect(getClientIdentifier(request)).toBe('203.0.113.2');
        });

        it('should fall back to unknown when no IP headers present', () => {
            const request = {
                headers: {
                    get: () => null
                }
            } as unknown as Request;

            expect(getClientIdentifier(request)).toBe('unknown');
        });
    });
});
