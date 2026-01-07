'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
    const { currentLanguage } = useLanguage();

    const getText = (lang: string) => {
        const translations = {
            en: {
                notFound: "404",
                pageNotFound: "Page Not Found",
                vanishedMessage: "Oops! The page you are looking for seems to have vanished into the digital void.",
                returnHome: "Return Home",
                browseJobs: "Browse Jobs"
            },
            fr: {
                notFound: "404",
                pageNotFound: "Page Non Trouvée",
                vanishedMessage: "Oups ! La page que vous recherchez semble avoir disparu dans le vide numérique.",
                returnHome: "Retour à l'accueil",
                browseJobs: "Parcourir les emplois"
            },
            ar: {
                notFound: "٤٠٤",
                pageNotFound: "الصفحة غير موجودة",
                vanishedMessage: "عذراً! يبدو أن الصفحة التي تبحث عنها قد اختفت في الفراغ الرقمي.",
                returnHome: "العودة للرئيسية",
                browseJobs: "تصفح الوظائف"
            }
        };
        return translations[lang as keyof typeof translations] || translations.en;
    };

    const text = getText(currentLanguage);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16 bg-white">
            <div className="text-center max-w-lg mx-auto">
                <h1 className="text-9xl font-black text-blue-100 mb-4">{text.notFound}</h1>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{text.pageNotFound}</h2>
                <p className="text-gray-600 mb-8 text-lg">
                    {text.vanishedMessage}
                </p>
                <div className="flex justify-center gap-4">
                    <Link href={`/${currentLanguage}`} className={buttonVariants({ size: 'lg', className: 'bg-blue-600 hover:bg-blue-700 text-white' })}>
                        {text.returnHome}
                    </Link>
                    <Link href={`/${currentLanguage}/jobs`} className={buttonVariants({ variant: 'outline', size: 'lg', className: 'border-blue-600 text-blue-600 hover:bg-blue-50' })}>
                        {text.browseJobs}
                    </Link>
                </div>
            </div>
        </div>
    );
}
