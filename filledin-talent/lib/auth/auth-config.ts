/**
 * Authentication Configuration
 * Centralized configuration for authentication features and security settings
 */

export const authConfig = {
    // Password requirements
    password: {
        minLength: 12, // User requirement: minimum 12 characters
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
    },

    // Account lockout settings
    lockout: {
        maxAttempts: 5, // Lock account after 5 failed login attempts
        lockDuration: 15 * 60 * 1000, // Lock for 15 minutes (in milliseconds)
    },

    // Rate limiting settings
    rateLimit: {
        login: {
            max: 5, // Maximum 5 login attempts
            windowMs: 15 * 60 * 1000, // Per 15 minutes
        },
        register: {
            max: 3, // Maximum 3 registration attempts
            windowMs: 60 * 60 * 1000, // Per hour
        },
    },

    // Feature flags
    features: {
        allowRememberMe: true, // Enable "Remember Me" functionality
        sessionDuration: 24 * 60 * 60, // 24 hours (in seconds)
        rememberMeDuration: 30 * 24 * 60 * 60, // 30 days (in seconds)
    },
} as const;

export type AuthConfig = typeof authConfig;
