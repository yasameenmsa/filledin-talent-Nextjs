/**
 * Tests for Password Validator module (lib/security/password-validator.ts)
 */
import {
    passwordValidator,
    DEFAULT_PASSWORD_POLICY,
} from '@/lib/security/password-validator';

// Mock translation to simplify tests
jest.mock('@/lib/i18n/serverTranslation', () => ({
    getServerTranslation: jest.fn().mockReturnValue({
        t: (key: string) => {
            // Return key as string to verify translation was requested
            return key.split('.').pop();
        },
    }),
}));

describe('Password Validator', () => {
    describe('Length constraints', () => {
        it('should reject passwords shorter than minimum length', async () => {
            // Default min is 12
            const result = await passwordValidator.validate('Short1!');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('passwordTooShort'))).toBe(true);
        });

        it('should reject passwords longer than maximum length', async () => {
            // Default max is 128
            const longPass = 'A1!'.repeat(50); // 150 chars
            const result = await passwordValidator.validate(longPass);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('passwordTooLong'))).toBe(true);
        });

        it('should accept passwords with valid length', async () => {
            const result = await passwordValidator.validate('ValidPassword947!');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('Character requirements', () => {
        it('should reject passwords without uppercase letters', async () => {
            const result = await passwordValidator.validate('lowercase123!');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('passwordNeedsUppercase'))).toBe(true);
        });

        it('should reject passwords without lowercase letters', async () => {
            const result = await passwordValidator.validate('UPPERCASE123!');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('passwordNeedsLowercase'))).toBe(true);
        });

        it('should reject passwords without numbers', async () => {
            const result = await passwordValidator.validate('NoNumbersHere!');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('passwordNeedsNumbers'))).toBe(true);
        });

        it('should reject passwords without special characters', async () => {
            const result = await passwordValidator.validate('NoSpecialChars123');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('passwordNeedsSpecialChars'))).toBe(true);
        });

        it('should require minimum number of special characters', async () => {
            // Custom policy requiring 2 special chars
            const validator = new (Object.getPrototypeOf(passwordValidator).constructor)({
                ...DEFAULT_PASSWORD_POLICY,
                minSpecialChars: 2,
            });

            const result1 = await validator.validate('OneSpecial947!');
            expect(result1.isValid).toBe(false);
            expect(result1.errors.some((e: string) => e.includes('passwordNeedsMoreSpecialChars'))).toBe(true);

            const result2 = await validator.validate('TwoSpecial947!@');
            expect(result2.isValid).toBe(true);
        });
    });

    describe('Security checks', () => {
        it('should reject common passwords', async () => {
            const result = await passwordValidator.validate('password123');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('passwordTooCommon'))).toBe(true);
        });

        it('should reject passwords containing user info', async () => {
            const userInfo = {
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
            };

            const result1 = await passwordValidator.validate('JohnDoe123!', userInfo);
            expect(result1.isValid).toBe(false);
            expect(result1.errors.some(e => e.includes('passwordContainsUserInfo'))).toBe(true);

            const result2 = await passwordValidator.validate('johndoe123!', userInfo);
            expect(result2.isValid).toBe(false);
            expect(result2.errors.some(e => e.includes('passwordContainsUserInfo'))).toBe(true);
        });

        it('should reject passwords with repeating characters', async () => {
            const result = await passwordValidator.validate('aaaaPassword123!');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('passwordTooManyRepeatingChars'))).toBe(true);
        });

        it('should reject passwords with sequential characters', async () => {
            const result = await passwordValidator.validate('abcdefPassword123!');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('passwordHasSequentialChars'))).toBe(true);
        });

        it('should reject keyboard patterns', async () => {
            const result = await passwordValidator.validate('QwertyPassword123!');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('passwordHasKeyboardPatterns'))).toBe(true);
        });
    });

    describe('Strength scoring', () => {
        it('should assign correct strength labels', () => {
            /* eslint-disable @typescript-eslint/no-explicit-any */
            expect((passwordValidator as any).getPasswordStrength(95)).toBe('very-strong');
            expect((passwordValidator as any).getPasswordStrength(80)).toBe('strong');
            expect((passwordValidator as any).getPasswordStrength(65)).toBe('good');
            expect((passwordValidator as any).getPasswordStrength(45)).toBe('fair');
            expect((passwordValidator as any).getPasswordStrength(25)).toBe('weak');
            expect((passwordValidator as any).getPasswordStrength(10)).toBe('very-weak');
            /* eslint-enable @typescript-eslint/no-explicit-any */
        });

        it('should calculate higher score for longer/complex passwords', async () => {
            const weak = await passwordValidator.validate('Valid1!'); // Valid but short
            const strong = await passwordValidator.validate('SuperStrongPassword947!@#');

            // Due to validation minimum being 12 now, the first string acts weak due to length
            // but second one should score higher
            expect(strong.score).toBeGreaterThan(weak.score);
        });

        it('should provide suggestions for improvement', async () => {
            const result = await passwordValidator.validate('Password123');
            expect(result.isValid).toBe(false);
            expect(result.suggestions.length).toBeGreaterThan(0);
        });
    });

    describe('Password Generation', () => {
        it('should generate secure passwords of requested length', () => {
            const pass = passwordValidator.generateSecurePassword(20);
            expect(pass.length).toBe(20);
        });

        it('should generate passwords that pass validation', async () => {
            const pass = passwordValidator.generateSecurePassword(16);
            const result = await passwordValidator.validate(pass);
            expect(result.isValid).toBe(true);
            expect(result.score).toBeGreaterThanOrEqual(80);
        });
    });
});
