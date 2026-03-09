/**
 * Tests for Session Timeout module (lib/security/session-timeout.ts)
 */

jest.mock('next/server', () => ({
    NextResponse: {
        redirect: jest.fn(),
        next: jest.fn(),
    },
}));

jest.mock('@/auth', () => ({
    auth: jest.fn(),
}));

import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/auth';
import { SessionTimeout, ClientSessionTimeout } from '@/lib/security/session-timeout';

const mockNextResponseRedirect = NextResponse.redirect as jest.Mock;
const mockNextResponseNext = NextResponse.next as jest.Mock;
const mockAuth = auth as jest.Mock;
const mockHeadersSet = jest.fn();

describe('Session Timeout Module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNextResponseNext.mockReturnValue({
            headers: { set: mockHeadersSet },
        });
    });

    describe('Server SessionTimeout', () => {
        let timeout: SessionTimeout;

        beforeEach(() => {
            // Use short timeouts for testing
            timeout = new SessionTimeout({
                maxAge: 300, // 5 min
                idleTimeout: 60, // 1 min
                warningTime: 30, // 30 sec
            });
        });

        it('should return expired when no session exists', async () => {
            mockAuth.mockResolvedValueOnce(null);

            const result = await timeout.checkSessionExpiry();

            expect(result.isExpired).toBe(true);
            expect(result.timeRemaining).toBe(0);
            expect(result.shouldWarn).toBe(false);
        });

        it('should handle session correctly when active', async () => {
            // Create mock session. The actual implementation currently uses `Date.now()`
            // internally because NextAuth v5 session JWT isn't fully integrated.
            // We spy on Date.now to control time
            mockAuth.mockResolvedValueOnce({ user: { id: '123' }, expires: 'future' });

            // Override Date.now() to return a consistent time
            const nowMs = 1000000000;
            const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(nowMs);

            const result = await timeout.checkSessionExpiry();

            // Since implementation currently uses Date.now() for both current time
            // and sessionStart/lastActivity, time remaining will be max configured value.
            expect(result.isExpired).toBe(false);
            expect(result.timeRemaining).toBe(60); // Math.min(maxAge: 300, idle: 60)
            expect(result.shouldWarn).toBe(false);

            dateSpy.mockRestore();
        });

        describe('Middleware', () => {
            it('should redirect when session is expired', async () => {
                // Mock checkSessionExpiry to return expired
                jest.spyOn(timeout, 'checkSessionExpiry').mockResolvedValueOnce({
                    isExpired: true,
                    isIdle: true,
                    timeRemaining: 0,
                    shouldWarn: false,
                });

                const middleware = timeout.createMiddleware();
                const mockRequest = { url: 'http://localhost:3000/protected' } as unknown as NextRequest;

                await middleware(mockRequest);

                expect(mockNextResponseRedirect).toHaveBeenCalled();
                const redirectUrl = mockNextResponseRedirect.mock.calls[0][0];
                expect(redirectUrl.pathname).toBe('/login');
                expect(redirectUrl.searchParams.get('reason')).toBe('session_expired');
            });

            it('should add headers when session is active', async () => {
                // Mock checkSessionExpiry to return active
                jest.spyOn(timeout, 'checkSessionExpiry').mockResolvedValueOnce({
                    isExpired: false,
                    isIdle: false,
                    timeRemaining: 120,
                    shouldWarn: true,
                });

                const middleware = timeout.createMiddleware();
                const mockRequest = { url: 'http://localhost:3000/protected' } as unknown as NextRequest;

                await middleware(mockRequest);

                expect(mockNextResponseNext).toHaveBeenCalled();
                expect(mockHeadersSet).toHaveBeenCalledWith('X-Session-Remaining', '120');
                expect(mockHeadersSet).toHaveBeenCalledWith('X-Session-Warning', 'true');
            });
        });
    });

    describe('ClientSessionTimeout', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should initialize with callbacks', () => {
            const onWarning = jest.fn();
            const onExpiry = jest.fn();

            const clientTimeout = new ClientSessionTimeout({}, { onWarning, onExpiry });

            // We reach into private methods for testing purpose or force an expiry
            clientTimeout['handleWarning']();
            expect(onWarning).toHaveBeenCalled();

            clientTimeout['handleExpiry']();
            expect(onExpiry).toHaveBeenCalled();
        });

        it('should clear timers on stop', () => {
            const clientTimeout = new ClientSessionTimeout();

            // Manually set timers for test
            clientTimeout['warningTimer'] = setTimeout(() => { }, 1000);
            clientTimeout['logoutTimer'] = setTimeout(() => { }, 2000);

            clientTimeout.stop();

            expect(clientTimeout['warningTimer']).toBeUndefined();
            expect(clientTimeout['logoutTimer']).toBeUndefined();
        });

        it('setupActivityListeners should attach event listeners', () => {
            const clientTimeout = new ClientSessionTimeout();
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

            clientTimeout['setupActivityListeners']();

            expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
            expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), true);
            expect(addEventListenerSpy).toHaveBeenCalledWith('keypress', expect.any(Function), true);
        });
    });
});
