'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { logger } from '@/lib/utils/logger';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useParams } from 'next/navigation';

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

    const { lang } = useParams();
    const { t } = useTranslation(lang as string);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16 bg-white">
            <div className="text-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('error.somethingWrong')}</h2>
                <p className="text-gray-600 mb-8 text-lg">
                    {t('error.unexpectedError')}
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => reset()} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                        {t('error.tryAgain')}
                    </Button>
                    <a href="/" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'border-blue-600 text-blue-600 hover:bg-blue-50' })}>
                        {t('error.goHome')}
                    </a>
                </div>
            </div>
        </div>
    );
}
