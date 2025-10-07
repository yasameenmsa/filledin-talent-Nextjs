import { useTranslation } from '@/lib/i18n/useTranslation';

// Types for validation results
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationOptions {
  locale?: string;
  customMessages?: Record<string, string>;
}

// Character encoding utilities
export class CharacterEncodingUtils {
  /**
   * Normalize Unicode characters for consistent validation
   */
  static normalizeText(text: string): string {
    return text.normalize('NFC');
  }

  /**
   * Check if text contains only valid UTF-8 characters
   */
  static isValidUTF8(text: string): boolean {
    try {
      // Encode and decode to check for valid UTF-8
      const encoded = new TextEncoder().encode(text);
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(encoded);
      return decoded === text;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize text for safe storage and display
   */
  static sanitizeText(text: string): string {
    return this.normalizeText(text)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .trim();
  }

  /**
   * Check if text contains RTL characters (for Arabic support)
   */
  static containsRTL(text: string): boolean {
    const rtlChars = /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/;
    return rtlChars.test(text);
  }
}

// Email validation with international support
export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  static validate(email: string, options: ValidationOptions = {}): ValidationResult {
    const { locale = 'en' } = options;
    const { t } = useTranslation(locale);
    
    if (!email) {
      return {
        isValid: false,
        error: t('auth.errors.emailRequired')
      };
    }

    // Normalize the email
    const normalizedEmail = CharacterEncodingUtils.normalizeText(email.toLowerCase().trim());
    
    // Check UTF-8 validity
    if (!CharacterEncodingUtils.isValidUTF8(normalizedEmail)) {
      return {
        isValid: false,
        error: t('auth.errors.invalidEmail')
      };
    }

    // Basic format validation
    if (!this.EMAIL_REGEX.test(normalizedEmail)) {
      return {
        isValid: false,
        error: t('auth.errors.invalidEmail')
      };
    }

    // Additional checks for international domains
    const parts = normalizedEmail.split('@');
    if (parts.length !== 2) {
      return {
        isValid: false,
        error: t('auth.errors.invalidEmail')
      };
    }

    const [localPart, domain] = parts;
    
    // Check local part length
    if (localPart.length > 64) {
      return {
        isValid: false,
        error: t('auth.errors.invalidEmail')
      };
    }

    // Check domain length
    if (domain.length > 253) {
      return {
        isValid: false,
        error: t('auth.errors.invalidEmail')
      };
    }

    return { isValid: true };
  }
}

// Password validation with security requirements
export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;
  
  static validate(password: string, options: ValidationOptions = {}): ValidationResult {
    const { locale = 'en' } = options;
    const { t } = useTranslation(locale);
    
    if (!password) {
      return {
        isValid: false,
        error: t('auth.errors.passwordRequired')
      };
    }

    // Normalize password
    const normalizedPassword = CharacterEncodingUtils.normalizeText(password);
    
    // Check UTF-8 validity
    if (!CharacterEncodingUtils.isValidUTF8(normalizedPassword)) {
      return {
        isValid: false,
        error: t('auth.errors.weakPassword')
      };
    }

    // Length validation
    if (normalizedPassword.length < this.MIN_LENGTH) {
      return {
        isValid: false,
        error: t('auth.errors.passwordTooShort')
      };
    }

    if (normalizedPassword.length > this.MAX_LENGTH) {
      return {
        isValid: false,
        error: t('auth.errors.weakPassword')
      };
    }

    // Strength validation
    const hasUppercase = /[A-Z]/.test(normalizedPassword);
    const hasLowercase = /[a-z]/.test(normalizedPassword);
    const hasNumbers = /\d/.test(normalizedPassword);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(normalizedPassword);
    
    const strengthScore = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
    
    if (strengthScore < 3) {
      return {
        isValid: false,
        error: t('auth.errors.weakPassword')
      };
    }

    return { isValid: true };
  }

  static validateConfirmation(password: string, confirmPassword: string, options: ValidationOptions = {}): ValidationResult {
    const { locale = 'en' } = options;
    const { t } = useTranslation(locale);
    
    if (!confirmPassword) {
      return {
        isValid: false,
        error: t('auth.errors.passwordRequired')
      };
    }

    const normalizedPassword = CharacterEncodingUtils.normalizeText(password);
    const normalizedConfirmPassword = CharacterEncodingUtils.normalizeText(confirmPassword);
    
    if (normalizedPassword !== normalizedConfirmPassword) {
      return {
        isValid: false,
        error: t('auth.errors.passwordMismatch')
      };
    }

    return { isValid: true };
  }
}

// Name validation with international character support
export class NameValidator {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 50;
  private static readonly NAME_REGEX = /^[\p{L}\p{M}\s\-'\.]+$/u; // Unicode letters, marks, spaces, hyphens, apostrophes, dots
  
  static validateFirstName(firstName: string, options: ValidationOptions = {}): ValidationResult {
    const { locale = 'en' } = options;
    const { t } = useTranslation(locale);
    
    if (!firstName) {
      return {
        isValid: false,
        error: t('auth.errors.firstNameRequired')
      };
    }

    return this.validateName(firstName, t('auth.errors.firstNameRequired'));
  }

  static validateLastName(lastName: string, options: ValidationOptions = {}): ValidationResult {
    const { locale = 'en' } = options;
    const { t } = useTranslation(locale);
    
    if (!lastName) {
      return {
        isValid: false,
        error: t('auth.errors.lastNameRequired')
      };
    }

    return this.validateName(lastName, t('auth.errors.lastNameRequired'));
  }

  private static validateName(name: string, errorMessage: string): ValidationResult {
    // Normalize and sanitize
    const normalizedName = CharacterEncodingUtils.sanitizeText(name);
    
    // Check UTF-8 validity
    if (!CharacterEncodingUtils.isValidUTF8(normalizedName)) {
      return {
        isValid: false,
        error: errorMessage
      };
    }

    // Length validation
    if (normalizedName.length < this.MIN_LENGTH || normalizedName.length > this.MAX_LENGTH) {
      return {
        isValid: false,
        error: errorMessage
      };
    }

    // Pattern validation (supports international characters)
    if (!this.NAME_REGEX.test(normalizedName)) {
      return {
        isValid: false,
        error: errorMessage
      };
    }

    return { isValid: true };
  }
}

// Role validation
export class RoleValidator {
  private static readonly VALID_ROLES = ['business', 'jobSeeker'];
  
  static validate(role: string, options: ValidationOptions = {}): ValidationResult {
    const { locale = 'en' } = options;
    const { t } = useTranslation(locale);
    
    if (!role) {
      return {
        isValid: false,
        error: t('auth.errors.roleRequired')
      };
    }

    if (!this.VALID_ROLES.includes(role)) {
      return {
        isValid: false,
        error: t('auth.errors.roleRequired')
      };
    }

    return { isValid: true };
  }
}

// Comprehensive form validation
export class FormValidator {
  static validateRegistrationForm(formData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    role: string;
  }, options: ValidationOptions = {}): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    
    // Validate email
    const emailResult = EmailValidator.validate(formData.email, options);
    if (!emailResult.isValid) {
      errors.email = emailResult.error!;
    }

    // Validate password
    const passwordResult = PasswordValidator.validate(formData.password, options);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error!;
    }

    // Validate password confirmation
    const confirmPasswordResult = PasswordValidator.validateConfirmation(
      formData.password, 
      formData.confirmPassword, 
      options
    );
    if (!confirmPasswordResult.isValid) {
      errors.confirmPassword = confirmPasswordResult.error!;
    }

    // Validate first name
    const firstNameResult = NameValidator.validateFirstName(formData.firstName, options);
    if (!firstNameResult.isValid) {
      errors.firstName = firstNameResult.error!;
    }

    // Validate last name
    const lastNameResult = NameValidator.validateLastName(formData.lastName, options);
    if (!lastNameResult.isValid) {
      errors.lastName = lastNameResult.error!;
    }

    // Validate role
    const roleResult = RoleValidator.validate(formData.role, options);
    if (!roleResult.isValid) {
      errors.role = roleResult.error!;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateLoginForm(formData: {
    email: string;
    password: string;
  }, options: ValidationOptions = {}): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    
    // Validate email
    const emailResult = EmailValidator.validate(formData.email, options);
    if (!emailResult.isValid) {
      errors.email = emailResult.error!;
    }

    // Basic password presence check for login
    if (!formData.password) {
      const { locale = 'en' } = options;
      const { t } = useTranslation(locale);
      errors.password = t('auth.errors.passwordRequired');
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }


}

// Export all validators for easy access
export {
  EmailValidator,
  PasswordValidator,
  NameValidator,
  RoleValidator,
  FormValidator,
  CharacterEncodingUtils
};