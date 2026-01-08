'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { logger } from '@/lib/utils/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('App Error Boundary', { error });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 font-sans">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-8">
          We apologize for the inconvenience. An unexpected error occurred.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'border-blue-600 text-blue-600 hover:bg-blue-50' })}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}