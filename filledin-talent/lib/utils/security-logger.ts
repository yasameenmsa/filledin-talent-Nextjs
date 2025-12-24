/**
 * Security event logging utility
 * Logs authentication and security-related events for monitoring and auditing
 */

export enum SecurityEventType {
    LOGIN_SUCCESS = 'login_success',
    LOGIN_FAILURE = 'login_failure',
    REGISTER_SUCCESS = 'register_success',
    REGISTER_FAILURE = 'register_failure',
    ACCOUNT_LOCKED = 'account_locked',
    ACCOUNT_UNLOCKED = 'account_unlocked',
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
    LOGOUT = 'logout',
}

export interface SecurityEvent {
    type: SecurityEventType;
    email?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    timestamp: string;
    details?: Record<string, any>;
}

/**
 * Log a security event
 * In production, this should send logs to a monitoring service (e.g., Datadog, Sentry)
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
        ...event,
        timestamp: new Date().toISOString(),
    };

    // Console log for development
    console.log('[SECURITY EVENT]', JSON.stringify(fullEvent, null, 2));

    // TODO: In production, send to monitoring service
    // Example: sendToDatadog(fullEvent);
    // Example: Sentry.captureMessage('Security Event', { extra: fullEvent });
}

/**
 * Get client info from request
 */
export function getClientInfo(request: Request): { ip: string; userAgent: string } {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent') || 'unknown';

    let ip = 'unknown';
    if (forwarded) {
        ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
        ip = realIp;
    }

    return { ip, userAgent };
}
