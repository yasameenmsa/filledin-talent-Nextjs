import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface SessionStatus {
  isExpired: boolean;
  isIdle: boolean;
  timeRemaining: number;
  shouldWarn: boolean;
  sessionAge: number;
  idleTime: number;
}

interface UseSessionTimeoutOptions {
  warningTime?: number; // Time in seconds before expiry to show warning
  checkInterval?: number; // How often to check session status (in seconds)
  onWarning?: () => void;
  onExpiry?: () => void;
  onExtend?: () => void;
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const {
    warningTime = 5 * 60, // 5 minutes
    checkInterval = 30, // 30 seconds
    onWarning,
    onExpiry,
    onExtend
  } = options;

  const { data: session, status } = useSession();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const warningShownRef = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check session status with the server
  const checkSessionStatus = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      const response = await fetch('/api/auth/session-status');
      if (response.ok) {
        const status: SessionStatus = await response.json();
        setSessionStatus(status);

        if (status.isExpired) {
          setShowWarning(false);
          onExpiry?.();
          await signOut({ redirect: true });
          return;
        }

        if (status.shouldWarn && !warningShownRef.current) {
          setShowWarning(true);
          warningShownRef.current = true;
          onWarning?.();
        } else if (!status.shouldWarn && warningShownRef.current) {
          setShowWarning(false);
          warningShownRef.current = false;
        }
      }
    } catch (error) {
      console.error('Failed to check session status:', error);
    }
  }, [status, onWarning, onExpiry]);

  // Update activity timestamp
  const updateActivity = useCallback(async () => {
    if (status !== 'authenticated') return;

    setLastActivity(Date.now());
    
    try {
      await fetch('/api/auth/activity', { method: 'POST' });
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }, [status]);

  // Extend session (user action to dismiss warning)
  const extendSession = useCallback(async () => {
    await updateActivity();
    setShowWarning(false);
    warningShownRef.current = false;
    onExtend?.();
  }, [updateActivity, onExtend]);

  // Track user activity
  useEffect(() => {
    if (status !== 'authenticated') return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      // Only update if it's been more than 1 minute since last activity
      if (timeSinceLastActivity > 60 * 1000) {
        if (activityTimeoutRef.current) {
          clearTimeout(activityTimeoutRef.current);
        }
        
        // Debounce activity updates
        activityTimeoutRef.current = setTimeout(() => {
          updateActivity();
        }, 1000);
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [status, lastActivity, updateActivity]);

  // Set up periodic session status checks
  useEffect(() => {
    if (status !== 'authenticated') {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkSessionStatus();

    // Set up interval
    checkIntervalRef.current = setInterval(checkSessionStatus, checkInterval * 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [status, checkSessionStatus, checkInterval]);

  // Format time remaining for display
  const formatTimeRemaining = useCallback((seconds: number): string => {
    if (seconds <= 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `0:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    sessionStatus,
    showWarning,
    timeRemaining: sessionStatus?.timeRemaining || 0,
    timeRemainingFormatted: formatTimeRemaining(sessionStatus?.timeRemaining || 0),
    isIdle: sessionStatus?.isIdle || false,
    extendSession,
    updateActivity,
    checkSessionStatus
  };
}