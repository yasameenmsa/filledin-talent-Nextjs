'use client'

import Link from 'next/link'

/**
 * Global Error Handler
 *
 * This catches errors thrown in Server Components and Route Handlers.
 * It must be a Client Component and replaces the entire root layout when active.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Something went wrong!
          </h1>
          <p className="text-gray-600 mb-6">
            {error.message || 'An unexpected error occurred.'}
          </p>

          {error.digest && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-medium text-gray-500 mb-1">Error ID</p>
              <code className="text-sm text-gray-800">{error.digest}</code>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go Home
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Error ID: {error.digest || 'N/A'}
          </p>
        </div>
      </body>
    </html>
  )
}
