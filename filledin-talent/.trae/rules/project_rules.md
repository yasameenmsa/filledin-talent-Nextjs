# AI System Documentation: Authentication & Language Systems

## Overview
This Next.js application implements a unified authentication system and multi-language support with URL-based routing (`/en`, `/ar`, `/fr`). This document provides comprehensive information for AI assistants to understand and work with these systems.

## Authentication System

### Architecture
- **Framework**: NextAuth.js v5 with JWT strategy
- **Database**: MongoDB with MongoDBAdapter
- **Provider**: Credentials provider for email/password authentication
- **Session Management**: JWT tokens with custom callbacks

### Key Files
- `auth.ts` - Main NextAuth configuration
- `contexts/AuthContext.tsx` - React context for auth state management
- `middleware.ts` - Route protection and authentication middleware
- `models/User.ts` - User model with password hashing

### Authentication Flow
1. **Login**: User submits credentials → NextAuth validates → JWT token created
2. **Session**: JWT token stored in cookies, validated on each request
3. **Protection**: Middleware checks token for protected routes
4. **Logout**: Token invalidated, user redirected to login

### Protected Routes
```typescript
const protectedRoutes = [
  '/dashboard',
  '/profile', 
  '/applications',
  '/jobs/post',
  '/employer'
];
```

### Public Routes
```typescript
const publicRoutes = [
  '/',
  '/login',
  '/register', 
  '/forgot-password',
  '/jobs',
  '/about',
  '/contact'
];
```

### Role-Based Access
- **employer**: Can access `/employer/*` routes
- **job_seeker**: Standard user access
- **admin**: Full system access

### Usage in Components
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, loading, login, logout } = useAuth();
```

## Language System

### Architecture
- **Routing**: Dynamic routes with `[lang]` parameter (`/en/*`, `/ar/*`, `/fr/*`)
- **Supported Languages**: English (en), Arabic (ar), French (fr)
- **RTL Support**: Arabic language with right-to-left text direction
- **Persistence**: Language preference stored in localStorage

### Key Files
- **Inline Translation**: Utilize `useTranslation` hook for component-level translations
- `lib/i18n/config.ts` - Language configuration
- `contexts/LanguageContext.tsx` - Language state management
- `app/[lang]/layout.tsx` - Language-aware layout
- `lib/i18n/translations/` - Translation files organized by language

### Language Configuration
```typescript
export const languages = ['en', 'ar', 'fr'] as const;
export const defaultLanguage: Language = 'en';
export const rtlLanguages: Language[] = ['ar'];
```

### Translation Structure
```
lib/i18n/translations/
├── en/
│   ├── auth.ts
│   ├── common.ts
│   ├── dashboard.ts
│   └── ...
├── ar/
│   ├── auth.ts
│   ├── common.ts
│   ├── dashboard.ts
│   └── ...
└── fr/
    ├── auth.ts
    ├── common.ts
    ├── dashboard.ts
    └── ...
```

### Usage in Components
```typescript
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/i18n/useTranslation';

const { currentLanguage, setLanguage, isRTL } = useLanguage();
const { t } = useTranslation();
```

## Routing & Middleware

### URL Structure
- **With Language**: `/en/dashboard`, `/ar/login`, `/fr/jobs`
- **Language Detection**: Middleware extracts language from URL
- **Fallback**: Defaults to English if language not specified

### Middleware Logic
1. **Skip**: API routes, static files, public assets
2. **Extract**: Language prefix from pathname
3. **Authenticate**: Check JWT token for protected routes
4. **Authorize**: Verify user role for role-specific routes
5. **Redirect**: Unauthenticated users to login, authenticated users away from auth pages

### Route Processing
```typescript
// Extract route without language prefix
const routeWithoutLang = pathname.replace(/^\/[a-z]{2}/, '') || '/';

// Check protection level
const isProtectedRoute = protectedRoutes.some(route => 
  routeWithoutLang.startsWith(route)
);
```

## Implementation Guidelines for AI

### When Adding New Features

#### Authentication-Related Changes
1. **New Protected Routes**: Add to `protectedRoutes` array in middleware
2. **Role-Based Features**: Check user role in components using `useAuth()`
3. **API Endpoints**: Protect with authentication middleware
4. **Forms**: Use AuthContext methods for login/register/logout

#### Language-Related Changes
1. **New Text**: Add translations to all language files
2. **New Pages**: Create under `app/[lang]/` directory structure
3. **Components**: Use `useTranslation()` hook for text
4. **RTL Support**: Consider Arabic layout requirements

### Common Patterns

#### Protected Component
```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedComponent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content</div>;
}
```

#### Multilingual Component
```typescript
'use client';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MultilingualComponent() {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <h1>{t('common.welcome')}</h1>
      <p>{t('common.description')}</p>
    </div>
  );
}
```

### API Route Protection
```typescript
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Protected API logic here
  return NextResponse.json({ data: 'Protected data' });
}
```

## Important Notes for AI

### Authentication
- Always check authentication state before rendering protected content
- Use middleware for route-level protection, not just component-level
- JWT tokens are automatically handled by NextAuth
- Session data includes: `id`, `email`, `name`, `role`

### Language System
- All user-facing text must be translatable
- Consider RTL layout for Arabic language
- Language preference persists across sessions
- URL structure must include language prefix for all routes

### Security Considerations
- Never expose sensitive data in client-side code
- Validate user permissions on both client and server
- Use environment variables for secrets
- Implement proper CORS and CSRF protection

### Performance
- Translations are loaded dynamically per language
- Authentication state is cached in React context
- Middleware runs on edge runtime for better performance

## System Integration

Both systems work together seamlessly:
1. **URL Structure**: `/{language}/{protected-route}` (e.g., `/en/dashboard`)
2. **Middleware**: Handles both language extraction and authentication
3. **Context Providers**: Both systems use React context for state management
4. **Persistence**: Language in localStorage, authentication in JWT cookies

This unified approach ensures consistent user experience across languages while maintaining security through proper authentication and authorization.

use local storage to store the cv files uploaded by the user