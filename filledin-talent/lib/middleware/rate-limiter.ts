import { authConfig } from '../auth/auth-config';

/**
 * Simple in-memory rate limiter
 * NOTE: For production, replace with Redis or similar distributed cache
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private store: Map<string, RateLimitEntry> = new Map();

    /**
     * Check if request is rate limited
     * @param key - Unique identifier (e.g., IP address, email)
     * @param maxAttempts - Maximum number of attempts allowed
     * @param windowMs - Time window in milliseconds
     * @returns Object with isLimited flag and remaining attempts
     */
    check(key: string, maxAttempts: number, windowMs: number): {
        isLimited: boolean;
        remaining: number;
        resetTime: number;
    } {
        const now = Date.now();
        const entry = this.store.get(key);

        // Clean up expired entries periodically
        if (this.store.size > 1000) {
            this.cleanup();
        }

        if (!entry || now > entry.resetTime) {
            // First request or window has expired
            this.store.set(key, {
                count: 1,
                resetTime: now + windowMs,
            });

            return {
                isLimited: false,
                remaining: maxAttempts - 1,
                resetTime: now + windowMs,
            };
        }

        // Increment count
        entry.count++;

        if (entry.count > maxAttempts) {
            return {
                isLimited: true,
                remaining: 0,
                resetTime: entry.resetTime,
            };
        }

        return {
            isLimited: false,
            remaining: maxAttempts - entry.count,
            resetTime: entry.resetTime,
        };
    }

    /**
     * Reset rate limit for a key
     */
    reset(key: string): void {
        this.store.delete(key);
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.resetTime) {
                this.store.delete(key);
            }
        }
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Check login rate limit
 */
export function checkLoginRateLimit(identifier: string) {
    return rateLimiter.check(
        `login:${identifier}`,
        authConfig.rateLimit.login.max,
        authConfig.rateLimit.login.windowMs
    );
}

/**
 * Check registration rate limit
 */
export function checkRegisterRateLimit(identifier: string) {
    return rateLimiter.check(
        `register:${identifier}`,
        authConfig.rateLimit.register.max,
        authConfig.rateLimit.register.windowMs
    );
}

/**
 * Reset login rate limit (call after successful login)
 */
export function resetLoginRateLimit(identifier: string): void {
    rateLimiter.reset(`login:${identifier}`);
}

/**
 * Get client identifier from request (IP address or email)
 */
export function getClientIdentifier(request: Request): string {
    // Try to get IP from headers (for deployed apps behind proxies)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Fallback to a generic identifier
    return 'unknown';
}
