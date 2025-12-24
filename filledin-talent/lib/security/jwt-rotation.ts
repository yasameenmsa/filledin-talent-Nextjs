import crypto from 'crypto';
import { NextRequest } from 'next/server';

export interface JWTSecretConfig {
  currentSecret: string;
  previousSecret?: string;
  rotationInterval: number; // in milliseconds
  lastRotation?: number;
}

export interface JWTRotationResult {
  shouldRotate: boolean;
  newSecret?: string;
  timeUntilRotation: number;
}

/**
 * JWT Secret Rotation Manager
 * Handles automatic rotation of JWT secrets for enhanced security
 */
export class JWTSecretRotation {
  private config: JWTSecretConfig;
  private readonly secretLength = 64; // 512 bits

  constructor(config: Partial<JWTSecretConfig> = {}) {
    this.config = {
      currentSecret: config.currentSecret || process.env.NEXTAUTH_SECRET || this.generateSecret(),
      previousSecret: config.previousSecret,
      rotationInterval: config.rotationInterval || 7 * 24 * 60 * 60 * 1000, // 7 days default
      lastRotation: config.lastRotation || Date.now()
    };
  }

  /**
   * Generate a cryptographically secure secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(this.secretLength).toString('hex');
  }

  /**
   * Check if secret rotation is needed
   */
  checkRotationNeeded(): JWTRotationResult {
    const now = Date.now();
    const timeSinceLastRotation = now - (this.config.lastRotation || 0);
    const shouldRotate = timeSinceLastRotation >= this.config.rotationInterval;

    return {
      shouldRotate,
      newSecret: shouldRotate ? this.generateSecret() : undefined,
      timeUntilRotation: Math.max(0, this.config.rotationInterval - timeSinceLastRotation)
    };
  }

  /**
   * Perform secret rotation
   */
  rotateSecret(): { newSecret: string; previousSecret: string } {
    const newSecret = this.generateSecret();
    const previousSecret = this.config.currentSecret;

    this.config.previousSecret = previousSecret;
    this.config.currentSecret = newSecret;
    this.config.lastRotation = Date.now();

    return { newSecret, previousSecret };
  }

  /**
   * Get current secret for JWT signing
   */
  getCurrentSecret(): string {
    return this.config.currentSecret;
  }

  /**
   * Get previous secret for JWT verification (during rotation period)
   */
  getPreviousSecret(): string | undefined {
    return this.config.previousSecret;
  }

  /**
   * Verify JWT with current or previous secret
   */
  getSecretsForVerification(): string[] {
    const secrets = [this.config.currentSecret];
    if (this.config.previousSecret) {
      secrets.push(this.config.previousSecret);
    }
    return secrets;
  }

  /**
   * Get rotation status information
   */
  getRotationStatus(): {
    lastRotation: Date;
    nextRotation: Date;
    rotationInterval: number;
    timeUntilRotation: number;
    hasBackupSecret: boolean;
  } {
    const now = Date.now();
    const lastRotation = new Date(this.config.lastRotation || now);
    const nextRotation = new Date((this.config.lastRotation || now) + this.config.rotationInterval);
    const timeUntilRotation = Math.max(0, nextRotation.getTime() - now);

    return {
      lastRotation,
      nextRotation,
      rotationInterval: this.config.rotationInterval,
      timeUntilRotation,
      hasBackupSecret: !!this.config.previousSecret
    };
  }

  /**
   * Force immediate rotation (for security incidents)
   */
  forceRotation(reason?: string): { newSecret: string; previousSecret: string; reason?: string } {
    const result = this.rotateSecret();
    
    // Log rotation for audit purposes
    console.log(`JWT Secret rotation forced: ${reason || 'Manual rotation'}`, {
      timestamp: new Date().toISOString(),
      reason,
      previousSecretHash: crypto.createHash('sha256').update(result.previousSecret).digest('hex').substring(0, 8)
    });

    return { ...result, reason };
  }

  /**
   * Validate secret strength
   */
  validateSecretStrength(secret: string): {
    isValid: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 0;

    // Check length
    if (secret.length < 32) {
      issues.push('Secret is too short (minimum 32 characters)');
    } else if (secret.length >= 64) {
      score += 25;
    } else {
      score += 15;
    }

    // Check entropy
    const uniqueChars = new Set(secret).size;
    if (uniqueChars < 16) {
      issues.push('Secret has low entropy');
    } else if (uniqueChars >= 32) {
      score += 25;
    } else {
      score += 15;
    }

    // Check for patterns
    if (/(.)\1{3,}/.test(secret)) {
      issues.push('Secret contains repeated character patterns');
    } else {
      score += 25;
    }

    // Check character variety
    const hasLower = /[a-z]/.test(secret);
    const hasUpper = /[A-Z]/.test(secret);
    const hasNumbers = /[0-9]/.test(secret);
    const hasSpecial = /[^a-zA-Z0-9]/.test(secret);

    const varietyCount = [hasLower, hasUpper, hasNumbers, hasSpecial].filter(Boolean).length;
    if (varietyCount < 3) {
      issues.push('Secret should contain a mix of character types');
    } else {
      score += 25;
    }

    return {
      isValid: issues.length === 0 && score >= 75,
      issues,
      score
    };
  }

  /**
   * Export configuration for persistence
   */
  exportConfig(): JWTSecretConfig {
    return { ...this.config };
  }

  /**
   * Import configuration from persistence
   */
  importConfig(config: JWTSecretConfig): void {
    this.config = { ...config };
  }
}

/**
 * Singleton instance for application-wide use
 */
export const jwtRotation = new JWTSecretRotation();

/**
 * Middleware to check and handle JWT rotation
 */
export function jwtRotationMiddleware() {
  return async (request: NextRequest) => {
    const rotationCheck = jwtRotation.checkRotationNeeded();
    
    if (rotationCheck.shouldRotate) {
      // In a production environment, you would want to:
      // 1. Store the new secret in a secure key management system
      // 2. Notify other instances of the application
      // 3. Update environment variables or configuration
      
      console.log('JWT Secret rotation needed', {
        timeUntilRotation: rotationCheck.timeUntilRotation,
        timestamp: new Date().toISOString()
      });
      
      // For now, we'll just log the need for rotation
      // Actual rotation should be handled by a separate process
    }

    // Add rotation status to response headers for monitoring
    const status = jwtRotation.getRotationStatus();
    const response = new Response();
    response.headers.set('X-JWT-Rotation-Status', JSON.stringify({
      nextRotation: status.nextRotation.toISOString(),
      timeUntilRotation: status.timeUntilRotation
    }));

    return response;
  };
}

/**
 * Utility to get the appropriate secret for NextAuth
 */
export function getNextAuthSecret(): string {
  return jwtRotation.getCurrentSecret();
}

/**
 * Utility to get all valid secrets for token verification
 */
export function getValidSecrets(): string[] {
  return jwtRotation.getSecretsForVerification();
}