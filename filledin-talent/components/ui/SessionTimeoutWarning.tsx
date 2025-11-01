'use client';

import React from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { signOut } from 'next-auth/react';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  timeRemaining: string;
  onExtend: () => void;
  onSignOut: () => void;
}

export function SessionTimeoutWarning({
  isOpen,
  timeRemaining,
  onExtend,
  onSignOut
}: SessionTimeoutWarningProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription>
            Your session will expire due to inactivity. You will be automatically signed out to protect your account.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-amber-200 bg-amber-50">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Time remaining: {timeRemaining}</strong>
          </AlertDescription>
        </Alert>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onSignOut}
            className="w-full sm:w-auto"
          >
            Sign Out Now
          </Button>
          <Button
            onClick={onExtend}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Extend Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export function SessionTimeoutProvider({ children }: SessionTimeoutProviderProps) {
  const {
    showWarning,
    timeRemainingFormatted,
    extendSession
  } = useSessionTimeout({
    onWarning: () => {
      console.log('Session warning triggered');
    },
    onExpiry: () => {
      console.log('Session expired');
    },
    onExtend: () => {
      console.log('Session extended');
    }
  });

  const handleSignOut = async () => {
    await signOut({ redirect: true });
  };

  return (
    <>
      {children}
      <SessionTimeoutWarning
        isOpen={showWarning}
        timeRemaining={timeRemainingFormatted}
        onExtend={extendSession}
        onSignOut={handleSignOut}
      />
    </>
  );
}