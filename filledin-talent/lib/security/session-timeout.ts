import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { auth } from '@/auth';

interface SessionTimeoutConfig {
  maxAge: number; // Maximum session age in seconds
  idleTimeout: number; // Idle timeout in seconds
  warningTime: number; // Warning time before timeout in seconds
}

// Default configuration
const DEFAULT_CONFIG: SessionTimeoutConfig = {
  maxAge: 8 * 60 * 60, // 8 hours
  idleTimeout: 2 * 60 * 60, // 2 hours
  warningTime: 5 * 60, // 5 minutes warning
};

/**
 * Session timeout manager
 */
export class SessionTimeout {
  private config: SessionTimeoutConfig;

  constructor(config: Partial<SessionTimeoutConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if session is expired
   */
  async checkSessionExpiry(request: NextRequest): Promise<{
    isExpired: boolean;
    isIdle: boolean;
    timeRemaining: number;
    shouldWarn: boolean;
  }> {
    try {
      const session = await auth();
      
      if (!session) {
        return {
          isExpired: true,
          isIdle: false,
          timeRemaining: 0,
          shouldWarn: false,
        };
      }

      const now = Math.floor(Date.now() / 1000);
      // For NextAuth v5, these properties might be in the JWT token
      // We'll use current time as fallback for now
      const sessionStart = now;
      const lastActivity = now;

      // Check maximum session age
      const sessionAge = now - sessionStart;
      const isMaxAgeExpired = sessionAge > this.config.maxAge;

      // Check idle timeout
      const idleTime = now - lastActivity;
      const isIdleExpired = idleTime > this.config.idleTimeout;

      // Calculate time remaining
      const maxAgeRemaining = this.config.maxAge - sessionAge;
      const idleRemaining = this.config.idleTimeout - idleTime;
      const timeRemaining = Math.min(maxAgeRemaining, idleRemaining);

      // Check if should warn
      const shouldWarn = timeRemaining <= this.config.warningTime && timeRemaining > 0;

      return {
        isExpired: isMaxAgeExpired || isIdleExpired,
        isIdle: isIdleExpired,
        timeRemaining: Math.max(0, timeRemaining),
        shouldWarn,
      };
    } catch (error) {
      console.error('Session timeout check error:', error);
      return {
        isExpired: true,
        isIdle: false,
        timeRemaining: 0,
        shouldWarn: false,
      };
    }
  }

  /**
   * Update last activity timestamp
   */
  async updateActivity(request: NextRequest): Promise<void> {
    try {
      const session = await auth();
      if (session?.user) {
        // Update last activity in session
        // Note: This would typically be handled by NextAuth callbacks
        // or stored in a database/cache
        const now = Math.floor(Date.now() / 1000);
        // Implementation depends on your session storage strategy
      }
    } catch (error) {
      console.error('Activity update error:', error);
    }
  }

  /**
   * Create session timeout middleware
   */
  createMiddleware() {
    return async (request: NextRequest) => {
      const { isExpired, timeRemaining, shouldWarn } = await this.checkSessionExpiry(request);

      if (isExpired) {
        // Redirect to login with session expired message
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('reason', 'session_expired');
        return NextResponse.redirect(loginUrl);
      }

      // Add session info to response headers for client-side handling
      const response = NextResponse.next();
      response.headers.set('X-Session-Remaining', timeRemaining.toString());
      response.headers.set('X-Session-Warning', shouldWarn.toString());

      return response;
    };
  }
}

/**
 * Client-side session timeout handler
 */
export class ClientSessionTimeout {
  private config: SessionTimeoutConfig;
  private warningTimer?: NodeJS.Timeout;
  private logoutTimer?: NodeJS.Timeout;
  private onWarning?: () => void;
  private onExpiry?: () => void;

  constructor(
    config: Partial<SessionTimeoutConfig> = {},
    callbacks: {
      onWarning?: () => void;
      onExpiry?: () => void;
    } = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.onWarning = callbacks.onWarning;
    this.onExpiry = callbacks.onExpiry;
  }

  /**
   * Start session timeout monitoring
   */
  start(): void {
    this.checkSession();
    
    // Check session status every minute
    setInterval(() => {
      this.checkSession();
    }, 60 * 1000);

    // Reset timers on user activity
    this.setupActivityListeners();
  }

  /**
   * Check session status from server
   */
  private async checkSession(): Promise<void> {
    try {
      const response = await fetch('/api/auth/session-status');
      const data = await response.json();

      if (data.isExpired) {
        this.handleExpiry();
        return;
      }

      const timeRemaining = data.timeRemaining || 0;
      
      // Clear existing timers
      this.clearTimers();

      if (timeRemaining <= this.config.warningTime) {
        this.handleWarning();
      }

      // Set logout timer
      this.logoutTimer = setTimeout(() => {
        this.handleExpiry();
      }, timeRemaining * 1000);

    } catch (error) {
      console.error('Session check error:', error);
    }
  }

  /**
   * Handle session warning
   */
  private handleWarning(): void {
    if (this.onWarning) {
      this.onWarning();
    }
  }

  /**
   * Handle session expiry
   */
  private handleExpiry(): void {
    this.clearTimers();
    
    if (this.onExpiry) {
      this.onExpiry();
    } else {
      // Default behavior: redirect to login
      window.location.href = '/login?reason=session_expired';
    }
  }

  /**
   * Setup activity listeners to reset session
   */
  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    let lastActivity = Date.now();
    
    const activityHandler = () => {
      const now = Date.now();
      
      // Throttle activity updates (max once per minute)
      if (now - lastActivity > 60 * 1000) {
        lastActivity = now;
        this.updateActivity();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });
  }

  /**
   * Update activity on server
   */
  private async updateActivity(): Promise<void> {
    try {
      await fetch('/api/auth/update-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Activity update error:', error);
    }
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = undefined;
    }
    
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = undefined;
    }
  }

  /**
   * Extend session manually
   */
  async extendSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/extend-session', {
        method: 'POST',
      });
      
      if (response.ok) {
        this.checkSession(); // Restart monitoring
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session extension error:', error);
      return false;
    }
  }

  /**
   * Stop session monitoring
   */
  stop(): void {
    this.clearTimers();
  }
}

// Export default instance
export const sessionTimeout = new SessionTimeout();