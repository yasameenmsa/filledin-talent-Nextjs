import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button-variants';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 font-sans">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-9xl font-black text-blue-100 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Oops! The page you are looking for seems to have vanished into the digital void.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/en" className={buttonVariants({ size: 'lg', className: 'bg-blue-600 hover:bg-blue-700 text-white' })}>
            Return Home
          </Link>
          <Link href="/en/jobs" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'border-blue-600 text-blue-600 hover:bg-blue-50' })}>
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}