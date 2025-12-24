import { authConfig } from './auth-config';

/**
 * Password strength levels
 */
export enum PasswordStrength {
    WEAK = 'weak',
    MEDIUM = 'medium',
    STRONG = 'strong',
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
    isValid: boolean;
    strength: PasswordStrength;
    errors: string[];
    score: number; // 0-100
}

/**
 * Validates password against security requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < authConfig.password.minLength) {
        errors.push(`Password must be at least ${authConfig.password.minLength} characters long`);
    } else {
        score += 25;
        // Bonus points for extra length
        if (password.length >= 16) score += 10;
        if (password.length >= 20) score += 10;
    }

    // Check for uppercase letters
    if (authConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else {
        score += 15;
    }

    // Check for lowercase letters
    if (authConfig.password.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else {
        score += 15;
    }

    // Check for numbers
    if (authConfig.password.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    } else {
        score += 15;
    }

    // Check for special characters
    if (authConfig.password.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
    } else {
        score += 15;
    }

    // Additional strength checks
    if (password.length >= 12) {
        // Check for variety - different character types used multiple times
        const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
        const lowercaseCount = (password.match(/[a-z]/g) || []).length;
        const numberCount = (password.match(/\d/g) || []).length;
        const specialCount = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;

        if (uppercaseCount >= 2) score += 2;
        if (lowercaseCount >= 2) score += 2;
        if (numberCount >= 2) score += 2;
        if (specialCount >= 2) score += 2;

        // Check for no repeating characters
        if (!/(.)\1{2,}/.test(password)) {
            score += 5;
        }
    }

    // Determine strength based on score
    let strength: PasswordStrength;
    if (score >= 80) {
        strength = PasswordStrength.STRONG;
    } else if (score >= 50) {
        strength = PasswordStrength.MEDIUM;
    } else {
        strength = PasswordStrength.WEAK;
    }

    return {
        isValid: errors.length === 0,
        strength,
        errors,
        score: Math.min(100, score),
    };
}

/**
 * Get password strength color for UI display
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
    switch (strength) {
        case PasswordStrength.STRONG:
            return 'green';
        case PasswordStrength.MEDIUM:
            return 'yellow';
        case PasswordStrength.WEAK:
            return 'red';
        default:
            return 'gray';
    }
}

/**
 * Get password strength label for UI display
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
    switch (strength) {
        case PasswordStrength.STRONG:
            return 'Strong';
        case PasswordStrength.MEDIUM:
            return 'Medium';
        case PasswordStrength.WEAK:
            return 'Weak';
        default:
            return 'Unknown';
    }
}
