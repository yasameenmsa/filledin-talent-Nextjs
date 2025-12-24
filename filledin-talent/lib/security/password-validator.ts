import { getServerTranslation } from '@/lib/i18n/serverTranslation';

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minSpecialChars: number;
  preventCommonPasswords: boolean;
  preventUserInfo: boolean;
  preventRepeatingChars: boolean;
  maxRepeatingChars: number;
  preventSequentialChars: boolean;
  preventKeyboardPatterns: boolean;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minSpecialChars: 1,
  preventCommonPasswords: true,
  preventUserInfo: true,
  preventRepeatingChars: true,
  maxRepeatingChars: 2,
  preventSequentialChars: true,
  preventKeyboardPatterns: true,
};

// Common passwords list (top 100 most common passwords)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
  'master', 'hello', 'freedom', 'whatever', 'qazwsx', 'trustno1',
  'jordan', 'harley', 'robert', 'matthew', 'jordan23', 'daniel',
  'andrew', 'martin', 'charlie', 'superman', 'batman', 'thomas',
  'hockey', 'ranger', 'george', 'computer', 'michelle', 'jessica',
  'pepper', '1111', 'zxcvbn', '555555', '11111111', '131313',
  'freedom', 'princess', 'qwertyuiop', '123321', 'mustang',
  // Add more as needed
]);

// Keyboard patterns
const KEYBOARD_PATTERNS = [
  'qwerty', 'asdf', 'zxcv', '1234', 'qwertyuiop', 'asdfghjkl',
  'zxcvbnm', '1234567890', 'abcdef', '098765', 'poiuyt', 'lkjhgf',
];

// Sequential patterns
const SEQUENTIAL_PATTERNS = [
  'abcd', '1234', 'efgh', '5678', 'ijkl', '9012', 'mnop', '3456',
  'qrst', '7890', 'uvwx', 'yz01', 'dcba', '4321', 'hgfe', '8765',
];

export class PasswordValidator {
  private policy: PasswordPolicy;
  private locale: string;

  constructor(policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY, locale: string = 'en') {
    this.policy = policy;
    this.locale = locale;
  }

  /**
   * Validate password against policy
   */
  validate(password: string, userInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }): PasswordValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    const { t } = getServerTranslation(this.locale);

    // Length validation
    if (password.length < this.policy.minLength) {
      errors.push(t('auth.errors.passwordTooShort', { min: this.policy.minLength }));
    } else {
      score += Math.min(25, (password.length / this.policy.minLength) * 25);
    }

    if (password.length > this.policy.maxLength) {
      errors.push(t('auth.errors.passwordTooLong', { max: this.policy.maxLength }));
    }

    // Character type validation
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const specialCharCount = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;

    if (this.policy.requireUppercase && !hasUppercase) {
      errors.push(t('auth.errors.passwordNeedsUppercase'));
    } else if (hasUppercase) {
      score += 15;
    }

    if (this.policy.requireLowercase && !hasLowercase) {
      errors.push(t('auth.errors.passwordNeedsLowercase'));
    } else if (hasLowercase) {
      score += 15;
    }

    if (this.policy.requireNumbers && !hasNumbers) {
      errors.push(t('auth.errors.passwordNeedsNumbers'));
    } else if (hasNumbers) {
      score += 15;
    }

    if (this.policy.requireSpecialChars && !hasSpecialChars) {
      errors.push(t('auth.errors.passwordNeedsSpecialChars'));
    } else if (hasSpecialChars) {
      score += 15;
    }

    if (this.policy.requireSpecialChars && specialCharCount < this.policy.minSpecialChars) {
      errors.push(t('auth.errors.passwordNeedsMoreSpecialChars', { min: this.policy.minSpecialChars }));
    }

    // Common password check
    if (this.policy.preventCommonPasswords && this.isCommonPassword(password)) {
      errors.push(t('auth.errors.passwordTooCommon'));
      score -= 20;
    }

    // User info check
    if (this.policy.preventUserInfo && userInfo && this.containsUserInfo(password, userInfo)) {
      errors.push(t('auth.errors.passwordContainsUserInfo'));
      score -= 15;
    }

    // Repeating characters check
    if (this.policy.preventRepeatingChars && this.hasRepeatingChars(password)) {
      errors.push(t('auth.errors.passwordTooManyRepeatingChars'));
      score -= 10;
    }

    // Sequential characters check
    if (this.policy.preventSequentialChars && this.hasSequentialChars(password)) {
      errors.push(t('auth.errors.passwordHasSequentialChars'));
      score -= 10;
    }

    // Keyboard patterns check
    if (this.policy.preventKeyboardPatterns && this.hasKeyboardPatterns(password)) {
      errors.push(t('auth.errors.passwordHasKeyboardPatterns'));
      score -= 10;
    }

    // Bonus points for variety
    const charTypes = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
    score += charTypes * 5;

    // Bonus for length beyond minimum
    if (password.length > this.policy.minLength) {
      score += Math.min(15, (password.length - this.policy.minLength) * 2);
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Generate suggestions
    if (errors.length > 0) {
      suggestions.push(...this.generateSuggestions(password, userInfo));
    }

    const strength = this.getPasswordStrength(score);

    return {
      isValid: errors.length === 0,
      score,
      errors,
      suggestions,
      strength,
    };
  }

  /**
   * Check if password is in common passwords list
   */
  private isCommonPassword(password: string): boolean {
    return COMMON_PASSWORDS.has(password.toLowerCase());
  }

  /**
   * Check if password contains user information
   */
  private containsUserInfo(password: string, userInfo: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }): boolean {
    const lowerPassword = password.toLowerCase();
    
    if (userInfo.email) {
      const emailParts = userInfo.email.toLowerCase().split('@')[0];
      if (lowerPassword.includes(emailParts) && emailParts.length > 2) {
        return true;
      }
    }

    if (userInfo.firstName && userInfo.firstName.length > 2) {
      if (lowerPassword.includes(userInfo.firstName.toLowerCase())) {
        return true;
      }
    }

    if (userInfo.lastName && userInfo.lastName.length > 2) {
      if (lowerPassword.includes(userInfo.lastName.toLowerCase())) {
        return true;
      }
    }

    if (userInfo.username && userInfo.username.length > 2) {
      if (lowerPassword.includes(userInfo.username.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for repeating characters
   */
  private hasRepeatingChars(password: string): boolean {
    let count = 1;
    for (let i = 1; i < password.length; i++) {
      if (password[i] === password[i - 1]) {
        count++;
        if (count > this.policy.maxRepeatingChars) {
          return true;
        }
      } else {
        count = 1;
      }
    }
    return false;
  }

  /**
   * Check for sequential characters
   */
  private hasSequentialChars(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    
    for (const pattern of SEQUENTIAL_PATTERNS) {
      if (lowerPassword.includes(pattern)) {
        return true;
      }
    }

    // Check for ascending/descending sequences
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      if ((char2 === char1 + 1 && char3 === char2 + 1) ||
          (char2 === char1 - 1 && char3 === char2 - 1)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for keyboard patterns
   */
  private hasKeyboardPatterns(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    
    for (const pattern of KEYBOARD_PATTERNS) {
      if (lowerPassword.includes(pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate password suggestions
   */
  private generateSuggestions(password: string, userInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }): string[] {
    const suggestions: string[] = [];
    const { t } = getServerTranslation(this.locale);

    if (password.length < this.policy.minLength) {
      suggestions.push(t('auth.suggestions.makePasswordLonger', { min: this.policy.minLength }));
    }

    if (!/[A-Z]/.test(password)) {
      suggestions.push(t('auth.suggestions.addUppercaseLetters'));
    }

    if (!/[a-z]/.test(password)) {
      suggestions.push(t('auth.suggestions.addLowercaseLetters'));
    }

    if (!/\d/.test(password)) {
      suggestions.push(t('auth.suggestions.addNumbers'));
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      suggestions.push(t('auth.suggestions.addSpecialCharacters'));
    }

    if (this.isCommonPassword(password)) {
      suggestions.push(t('auth.suggestions.avoidCommonPasswords'));
    }

    if (userInfo && this.containsUserInfo(password, userInfo)) {
      suggestions.push(t('auth.suggestions.avoidPersonalInfo'));
    }

    suggestions.push(t('auth.suggestions.usePassphrase'));
    suggestions.push(t('auth.suggestions.usePasswordManager'));

    return suggestions;
  }

  /**
   * Get password strength based on score
   */
  private getPasswordStrength(score: number): PasswordValidationResult['strength'] {
    if (score >= 90) return 'very-strong';
    if (score >= 75) return 'strong';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'weak';
    return 'very-weak';
  }

  /**
   * Generate a secure password suggestion
   */
  generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    let charSet = '';

    // Ensure at least one character from each required type
    if (this.policy.requireUppercase) {
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      charSet += uppercase;
    }

    if (this.policy.requireLowercase) {
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      charSet += lowercase;
    }

    if (this.policy.requireNumbers) {
      password += numbers[Math.floor(Math.random() * numbers.length)];
      charSet += numbers;
    }

    if (this.policy.requireSpecialChars) {
      password += specialChars[Math.floor(Math.random() * specialChars.length)];
      charSet += specialChars;
    }

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charSet[Math.floor(Math.random() * charSet.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Export default instance
export const passwordValidator = new PasswordValidator();