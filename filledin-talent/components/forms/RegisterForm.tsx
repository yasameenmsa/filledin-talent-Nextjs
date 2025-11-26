'use client';

import { useState, useMemo, useEffect } from 'react';
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

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

interface RegisterFormProps {
  lang: string;
}

export default function RegisterForm({ lang }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register: registerUser } = useAuth();
  const router = useRouter();
  const { currentLanguage } = useLanguage();

  const isRTL = currentLanguage === 'ar';

  // Inline translations
  const getText = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'auth.createAccount': {
        en: 'Create account',
        ar: 'إنشاء حساب',
        fr: 'Créer un compte'
      },
      'auth.joinToday': {
        en: 'Join our platform and start your journey.',
        ar: 'انضم إلى منصتنا وابدأ رحلتك.',
        fr: 'Rejoignez notre plateforme et commencez votre parcours.'
      },
      'auth.fullName': {
        en: 'Full Name',
        ar: 'الاسم الكامل',
        fr: 'Nom complet'
      },
      'auth.enterFullName': {
        en: 'Enter your full name',
        ar: 'أدخل اسمك الكامل',
        fr: 'Entrez votre nom complet'
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
      'auth.confirmPassword': {
        en: 'Confirm Password',
        ar: 'تأكيد كلمة المرور',
        fr: 'Confirmer le mot de passe'
      },
      'auth.confirmYourPassword': {
        en: 'Confirm your password',
        ar: 'أكد كلمة المرور',
        fr: 'Confirmez votre mot de passe'
      },
      'auth.creatingAccount': {
        en: 'Creating account...',
        ar: 'جاري إنشاء الحساب...',
        fr: 'Création du compte...'
      },
      'auth.alreadyHaveAccount': {
        en: 'Already have an account?',
        ar: 'لديك حساب بالفعل؟',
        fr: 'Vous avez déjà un compte ?'
      },
      'auth.signIn': {
        en: 'Sign in',
        ar: 'تسجيل الدخول',
        fr: 'Se connecter'
      },
      'auth.accountCreated': {
        en: 'Account created successfully!',
        ar: 'تم إنشاء الحساب بنجاح!',
        fr: 'Compte créé avec succès !'
      },
      'validation.nameRequired': {
        en: 'Name is required',
        ar: 'الاسم مطلوب',
        fr: 'Le nom est requis'
      },
      'validation.nameMinLength': {
        en: 'Name must be at least 2 characters',
        ar: 'يجب أن يكون الاسم حرفين على الأقل',
        fr: 'Le nom doit contenir au moins 2 caractères'
      },
      'validation.nameMaxLength': {
        en: 'Name must be less than 100 characters',
        ar: 'يجب أن يكون الاسم أقل من 100 حرف',
        fr: 'Le nom doit contenir moins de 100 caractères'
      },
      'validation.emailRequired': {
        en: 'Email is required',
        ar: 'البريد الإلكتروني مطلوب',
        fr: "L'email est requis"
      },
      'validation.emailInvalid': {
        en: 'Please enter a valid email address',
        ar: 'يرجى إدخال عنوان بريد إلكتروني صالح',
        fr: 'Veuillez entrer une adresse email valide'
      },
      'validation.passwordMinLength': {
        en: 'Password must be at least 8 characters',
        ar: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
        fr: 'Le mot de passe doit contenir au moins 8 caractères'
      },
      'validation.passwordMaxLength': {
        en: 'Password must be less than 128 characters',
        ar: 'يجب أن تكون كلمة المرور أقل من 128 حرف',
        fr: 'Le mot de passe doit contenir moins de 128 caractères'
      },
      'validation.confirmPasswordRequired': {
        en: 'Please confirm your password',
        ar: 'يرجى تأكيد كلمة المرور',
        fr: 'Veuillez confirmer votre mot de passe'
      },
      'validation.passwordsMismatch': {
        en: 'Passwords do not match',
        ar: 'كلمات المرور غير متطابقة',
        fr: 'Les mots de passe ne correspondent pas'
      },
      'error.registrationFailed': {
        en: 'Registration failed. Please try again.',
        ar: 'فشل التسجيل. يرجى المحاولة مرة أخرى.',
        fr: "L'inscription a échoué. Veuillez réessayer."
      }
    };

    return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
  };

  // Create validation schema - recreate on language change
  const registerSchema = useMemo(() =>
    z.object({
      name: z
        .string()
        .min(1, getText('validation.nameRequired'))
        .min(2, getText('validation.nameMinLength'))
        .max(100, getText('validation.nameMaxLength')),
      email: z
        .string()
        .min(1, getText('validation.emailRequired'))
        .email(getText('validation.emailInvalid')),
      password: z
        .string()
        .min(8, getText('validation.passwordMinLength'))
        .max(128, getText('validation.passwordMaxLength')),
      confirmPassword: z
        .string()
        .min(1, getText('validation.confirmPasswordRequired')),
    }).refine((data) => data.password === data.confirmPassword, {
      message: getText('validation.passwordsMismatch'),
      path: ['confirmPassword'],
    })
    , [currentLanguage]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Reset form errors when language changes to get fresh error messages
  useEffect(() => {
    clearErrors();
  }, [currentLanguage, clearErrors]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setAuthError('');
    setSuccessMessage('');

    try {
      const result = await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.success) {
        setSuccessMessage(getText('auth.accountCreated'));
        setTimeout(() => {
          router.push(`/${lang}/login`);
        }, 2000);
      } else {
        setAuthError(result.error || getText('error.registrationFailed'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(getText('error.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={` mb-8 text-left`}>
        <h1 className={`text-2xl font-bold text-gray-900 mb-2 `}>
          {getText('auth.createAccount')}
        </h1>
        <p className="text-gray-600">
          {getText('auth.joinToday')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {authError}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">{getText('auth.fullName')}</Label>
          <Input
            id="name"
            type="text"
            placeholder={getText('auth.enterFullName')}
            error={!!errors.name}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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
              className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 text-gray-400 hover:text-gray-600`}
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{getText('auth.confirmPassword')}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={getText('auth.confirmYourPassword')}
              error={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 text-gray-400 hover:text-gray-600`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
              {getText('auth.creatingAccount')}
            </>
          ) : (
            getText('auth.createAccount')
          )}
        </Button>

        <div className="text-center">
          <span className="text-gray-600">{getText('auth.alreadyHaveAccount')} </span>
          <Link
            href={`/${lang}/login`}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            {getText('auth.signIn')}
          </Link>
        </div>
      </form>
    </div>
  );
}