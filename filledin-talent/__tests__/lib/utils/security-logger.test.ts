/**
 * Tests for Security Logger module (lib/utils/security-logger.ts)
 */
import {
    logSecurityEvent,
    SecurityEventType,
    getClientInfo,
} from '@/lib/utils/security-logger';

describe('Security Logger', () => {
    describe('logSecurityEvent', () => {
        let consoleLogSpy: jest.SpyInstance;

        beforeEach(() => {
            // Mock console.log to avoid noise in test output
            // and to assert on what gets logged
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            // Mock date to ensure consistent timestamps
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
        });

        afterEach(() => {
            consoleLogSpy.mockRestore();
            jest.useRealTimers();
        });

        it('should log event with ISO timestamp', () => {
            logSecurityEvent({
                type: SecurityEventType.LOGIN_SUCCESS,
                email: 'test@example.com',
            });

            expect(consoleLogSpy).toHaveBeenCalledWith(
                '[SECURITY EVENT]',
                expect.stringContaining('"timestamp": "2024-01-01T12:00:00.000Z"')
            );

            const loggedString = consoleLogSpy.mock.calls[0][1];
            const loggedObj = JSON.parse(loggedString);

            expect(loggedObj.type).toBe('login_success');
            expect(loggedObj.email).toBe('test@example.com');
        });

        it('should log all provided metadata', () => {
            logSecurityEvent({
                type: SecurityEventType.LOGIN_FAILURE,
                email: 'test@example.com',
                userId: '123',
                ip: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
                details: { reason: 'invalid_password', attempts: 3 }
            });

            const loggedString = consoleLogSpy.mock.calls[0][1];
            const loggedObj = JSON.parse(loggedString);

            expect(loggedObj.details.reason).toBe('invalid_password');
            expect(loggedObj.details.attempts).toBe(3);
            expect(loggedObj.ip).toBe('192.168.1.1');
        });
    });

    describe('getClientInfo', () => {
        it('should extract both IP and user agent', () => {
            const request = {
                headers: {
                    get: (key: string) => {
                        if (key === 'x-forwarded-for') return '10.0.0.1, 10.0.0.2';
                        if (key === 'user-agent') return 'Jest Test Runner';
                        return null;
                    }
                }
            } as unknown as Request;

            const info = getClientInfo(request);

            expect(info.ip).toBe('10.0.0.1');
            expect(info.userAgent).toBe('Jest Test Runner');
        });

        it('should handle x-real-ip', () => {
            const request = {
                headers: {
                    get: (key: string) => key === 'x-real-ip' ? '10.0.0.3' : null
                }
            } as unknown as Request;

            const info = getClientInfo(request);
            expect(info.ip).toBe('10.0.0.3');
        });

        it('should provide default values when headers are missing', () => {
            const request = {
                headers: {
                    get: () => null
                }
            } as unknown as Request;

            const info = getClientInfo(request);
            expect(info.ip).toBe('unknown');
            expect(info.userAgent).toBe('unknown');
        });
    });
});
