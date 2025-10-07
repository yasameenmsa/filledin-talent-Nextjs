'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  lang: string;
}

export default function ForgotPasswordForm({ lang }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { t } = useTranslation(lang);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, data.email);
      setIsSuccess(true);
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      
      // Type guard to check if error has a code property
      const firebaseError = error as { code?: string };
      
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setError(t('auth.errors.userNotFound'));
          break;
        case 'auth/invalid-email':
          setError(t('auth.errors.invalidEmail'));
          break;
        case 'auth/too-many-requests':
          setError(t('auth.errors.tooManyRequests'));
          break;
        default:
          setError(t('auth.errors.passwordResetFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('auth.forgotPassword.emailSent')}
          </h1>
          <p className="text-gray-600">
            {t('auth.forgotPassword.checkEmail', { email: getValues('email') })}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {t('auth.forgotPassword.emailInstructions')}
          </p>
          
          <Button
            onClick={() => setIsSuccess(false)}
            variant="outline"
            className="w-full"
          >
            {t('auth.forgotPassword.resendEmail')}
          </Button>

          <Link
            href={`/${lang}/auth/login`}
            className="inline-flex items-center text-blue-600 hover:text-blue-500 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('auth.forgotPassword.title')}
        </h1>
        <p className="text-gray-600">
          {t('auth.forgotPassword.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.fields.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.placeholders.email')}
            error={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
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
              {t('auth.forgotPassword.sending')}
            </>
          ) : (
            t('auth.forgotPassword.sendResetEmail')
          )}
        </Button>

        <div className="text-center">
          <Link
            href={`/${lang}/auth/login`}
            className="inline-flex items-center text-blue-600 hover:text-blue-500 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </form>
    </div>
  );
}