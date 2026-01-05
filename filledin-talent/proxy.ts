import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function proxy(request: NextRequest) {
    // Only check /admin routes for now
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.match(/^\/[a-z]{2}\/admin/)) {
        const session = await auth();

        // Redirect if not authenticated or not an admin
        if (!session || session.user.role !== 'admin') {
            // Check if we are in a localized path
            const locale = request.nextUrl.pathname.split('/')[1] || 'en';
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
};
