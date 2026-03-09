/**
 * Tests for JWT Secret Rotation module (lib/security/jwt-rotation.ts)
 */
import {
    JWTSecretRotation,
    getNextAuthSecret,
    getValidSecrets,
} from '@/lib/security/jwt-rotation';

describe('JWT Secret Rotation', () => {
    let rotation: JWTSecretRotation;

    beforeEach(() => {
        rotation = new JWTSecretRotation({
            currentSecret: 'test-secret-that-is-long-enough-for-validation-purposes-1234567890abcdef',
            rotationInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
            lastRotation: Date.now(),
        });
    });

    describe('constructor', () => {
        it('should use provided secret', () => {
            const r = new JWTSecretRotation({ currentSecret: 'my-secret' });
            expect(r.getCurrentSecret()).toBe('my-secret');
        });

        it('should use NEXTAUTH_SECRET env var as fallback', () => {
            const originalSecret = process.env.NEXTAUTH_SECRET;
            process.env.NEXTAUTH_SECRET = 'env-secret-value';

            const r = new JWTSecretRotation();
            expect(r.getCurrentSecret()).toBe('env-secret-value');

            process.env.NEXTAUTH_SECRET = originalSecret;
        });

        it('should generate a secret if none provided and no env var', () => {
            const originalSecret = process.env.NEXTAUTH_SECRET;
            delete process.env.NEXTAUTH_SECRET;

            const r = new JWTSecretRotation();
            expect(r.getCurrentSecret()).toBeDefined();
            expect(r.getCurrentSecret().length).toBeGreaterThan(0);

            process.env.NEXTAUTH_SECRET = originalSecret;
        });

        it('should set default rotation interval to 7 days', () => {
            const r = new JWTSecretRotation({ currentSecret: 'test' });
            const status = r.getRotationStatus();
            expect(status.rotationInterval).toBe(7 * 24 * 60 * 60 * 1000);
        });
    });

    describe('checkRotationNeeded', () => {
        it('should return false when rotation was recent', () => {
            const result = rotation.checkRotationNeeded();
            expect(result.shouldRotate).toBe(false);
            expect(result.newSecret).toBeUndefined();
            expect(result.timeUntilRotation).toBeGreaterThan(0);
        });

        it('should return true when rotation interval has passed', () => {
            const pastRotation = new JWTSecretRotation({
                currentSecret: 'old-secret',
                rotationInterval: 1000, // 1 second
                lastRotation: Date.now() - 2000, // 2 seconds ago
            });

            const result = pastRotation.checkRotationNeeded();
            expect(result.shouldRotate).toBe(true);
            expect(result.newSecret).toBeDefined();
            expect(result.timeUntilRotation).toBe(0);
        });
    });

    describe('rotateSecret', () => {
        it('should move current secret to previous', () => {
            const originalSecret = rotation.getCurrentSecret();
            const { newSecret, previousSecret } = rotation.rotateSecret();

            expect(previousSecret).toBe(originalSecret);
            expect(newSecret).toBe(rotation.getCurrentSecret());
            expect(rotation.getPreviousSecret()).toBe(originalSecret);
        });

        it('should generate a new unique secret', () => {
            const originalSecret = rotation.getCurrentSecret();
            const { newSecret } = rotation.rotateSecret();

            expect(newSecret).not.toBe(originalSecret);
            expect(newSecret.length).toBeGreaterThan(0);
        });
    });

    describe('getSecretsForVerification', () => {
        it('should return only current secret when no previous', () => {
            const secrets = rotation.getSecretsForVerification();
            expect(secrets).toHaveLength(1);
            expect(secrets[0]).toBe(rotation.getCurrentSecret());
        });

        it('should return both secrets after rotation', () => {
            const originalSecret = rotation.getCurrentSecret();
            rotation.rotateSecret();

            const secrets = rotation.getSecretsForVerification();
            expect(secrets).toHaveLength(2);
            expect(secrets[0]).toBe(rotation.getCurrentSecret());
            expect(secrets[1]).toBe(originalSecret);
        });
    });

    describe('getRotationStatus', () => {
        it('should return correct status object', () => {
            const status = rotation.getRotationStatus();

            expect(status.lastRotation).toBeInstanceOf(Date);
            expect(status.nextRotation).toBeInstanceOf(Date);
            expect(status.rotationInterval).toBe(7 * 24 * 60 * 60 * 1000);
            expect(status.timeUntilRotation).toBeGreaterThan(0);
            expect(status.hasBackupSecret).toBe(false);
        });

        it('should show hasBackupSecret after rotation', () => {
            rotation.rotateSecret();
            const status = rotation.getRotationStatus();
            expect(status.hasBackupSecret).toBe(true);
        });
    });

    describe('forceRotation', () => {
        it('should immediately rotate secrets', () => {
            const originalSecret = rotation.getCurrentSecret();
            const result = rotation.forceRotation('security-incident');

            expect(result.previousSecret).toBe(originalSecret);
            expect(result.newSecret).toBe(rotation.getCurrentSecret());
            expect(result.reason).toBe('security-incident');
        });

        it('should log the rotation reason', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            rotation.forceRotation('test-reason');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('JWT Secret rotation forced'),
                expect.objectContaining({ reason: 'test-reason' })
            );

            consoleSpy.mockRestore();
        });
    });

    describe('validateSecretStrength', () => {
        it('should reject short secrets', () => {
            const result = rotation.validateSecretStrength('short');
            expect(result.isValid).toBe(false);
            expect(result.issues).toContain('Secret is too short (minimum 32 characters)');
        });

        it('should reject secrets with low entropy', () => {
            const result = rotation.validateSecretStrength('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
            expect(result.isValid).toBe(false);
            expect(result.issues.some(i => i.includes('entropy') || i.includes('repeated'))).toBe(true);
        });

        it('should reject secrets with repeated patterns', () => {
            const result = rotation.validateSecretStrength('abcdabcdabcdabcdabcdabcdabcdabcdaaaa');
            expect(result.issues.some(i => i.includes('repeated'))).toBe(true);
        });

        it('should approve strong secrets', () => {
            const strongSecret = 'Abc123!@#defGHI456$%^jklMNO789&*(pqrSTU012';
            const result = rotation.validateSecretStrength(strongSecret);
            expect(result.isValid).toBe(true);
            expect(result.score).toBeGreaterThanOrEqual(75);
        });

        it('should penalize secrets lacking character variety', () => {
            // Only lowercase + numbers (2 types, needs 3)
            const result = rotation.validateSecretStrength('abcdefghijklmnopqrstuvwxyz12345678');
            expect(result.issues.some(i => i.includes('mix of character types'))).toBe(true);
        });
    });

    describe('exportConfig / importConfig', () => {
        it('should round-trip config correctly', () => {
            const exported = rotation.exportConfig();
            const newRotation = new JWTSecretRotation();
            newRotation.importConfig(exported);

            expect(newRotation.getCurrentSecret()).toBe(rotation.getCurrentSecret());
            expect(newRotation.exportConfig().rotationInterval).toBe(exported.rotationInterval);
        });
    });

    describe('Utility functions', () => {
        it('getNextAuthSecret should return current secret', () => {
            const secret = getNextAuthSecret();
            expect(secret).toBeDefined();
            expect(typeof secret).toBe('string');
        });

        it('getValidSecrets should return array of secrets', () => {
            const secrets = getValidSecrets();
            expect(Array.isArray(secrets)).toBe(true);
            expect(secrets.length).toBeGreaterThanOrEqual(1);
        });
    });
});
