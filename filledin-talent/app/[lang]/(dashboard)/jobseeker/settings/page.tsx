'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Construction } from 'lucide-react';

export default function JobSeekerSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: _lang } = React.use(params);
    const { currentLanguage } = useLanguage();

    const getText = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            'settings.title': {
                en: 'Settings',
                ar: 'الإعدادات',
                fr: 'Paramètres'
            },
            'settings.comingSoon': {
                en: 'Coming Soon',
                ar: 'قريبا',
                fr: 'Bientôt disponible'
            },
            'settings.description': {
                en: 'We are working hard to build this feature. Please check back later.',
                ar: 'نحن نعمل بجد لبناء هذه الميزة. يرجى التحقق مرة أخرى لاحقا.',
                fr: 'Nous travaillons dur pour créer cette fonctionnalité. Veuillez revenir plus tard.'
            }
        };
        return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{getText('settings.title')}</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-50 p-4 rounded-full">
                        <Construction className="h-12 w-12 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{getText('settings.comingSoon')}</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    {getText('settings.description')}
                </p>
            </div>
        </div>
    );
}
