'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('App Error Boundary', { error });
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}