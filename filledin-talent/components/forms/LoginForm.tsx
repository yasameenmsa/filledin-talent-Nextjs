'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  lang: string;
}

export default function LoginForm({ lang }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();
  const { currentLanguage } = useLanguage();

  // Inline translations
  const getText = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'auth.signIn': {
        en: 'Sign in',
        ar: 'تسجيل الدخول',
        fr: 'Se connecter'
      },
      'auth.welcomeBack': {
        en: 'Welcome back! Please enter your details.',
        ar: 'مرحباً بعودتك! يرجى إدخال بياناتك.',
        fr: 'Bon retour ! Veuillez entrer vos informations.'
      },
      'auth.email': {
        en: 'Email',
        ar: 'البريد الإلكتروني',
        fr: 'Email'
      },
      'auth.enterEmail': {
        en: 'Enter your email',
        ar: 'أدخل بريدك الإلكتروني',
        fr: 'Entrez votre email'
      },
      'auth.password': {
        en: 'Password',
        ar: 'كلمة المرور',
        fr: 'Mot de passe'
      },
      'auth.enterPassword': {
        en: 'Enter your password',
        ar: 'أدخل كلمة المرور',
        fr: 'Entrez votre mot de passe'
      },
      'auth.signingIn': {
        en: 'Signing in...',
        ar: 'جاري تسجيل الدخول...',
        fr: 'Connexion en cours...'
      },
      'auth.noAccount': {
        en: "Don't have an account?",
        ar: 'ليس لديك حساب؟',
        fr: 'Vous n\'avez pas de compte ?'
      },
      'auth.signUp': {
        en: 'Sign up',
        ar: 'سجل الآن',
        fr: 'Créer un compte'
      }
    };

    return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError('');

    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        router.push(`/${lang}/dashboard`);
      } else {
        setAuthError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getText('auth.signIn')}
        </h1>
        <p className="text-gray-600">
          {getText('auth.welcomeBack')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {authError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">{getText('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={getText('auth.enterEmail')}
            error={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{getText('auth.password')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={getText('auth.enterPassword')}
              error={!!errors.password}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {getText('auth.signingIn')}
            </>
          ) : (
            getText('auth.signIn')
          )}
        </Button>

        <div className="text-center">
          <span className="text-gray-600">{getText('auth.noAccount')} </span>
          <Link
            href={`/${lang}/register`}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            {getText('auth.signUp')}
          </Link>
        </div>
      </form>
    </div>
  );
}