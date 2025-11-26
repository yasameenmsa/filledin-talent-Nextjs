'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
    const { currentLanguage } = useLanguage();

    const getText = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            'footer.tagline': {
                en: 'The Alternative Solution',
                ar: 'الحل البديل',
                fr: 'La Solution Alternative'
            },
            'footer.followUs': {
                en: 'Follow us',
                ar: 'تابعنا',
                fr: 'Suivez-nous'
            },
            'footer.getInTouch': {
                en: 'Get In Touch',
                ar: 'تواصل معنا',
                fr: 'Contactez-nous'
            }
        };
        return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
    };

    return (
        <footer className="bg-white border-t border-gray-200" dir="ltr">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/new-logo.png"
                                alt="FilledIn Talent Logo"
                                width={400}
                                height={200}
                                className="h-12 w-auto"
                            />
                        </Link>

                    </div>

                    {/* Right Section: Socials & Button */}
                    <div className="flex flex-col items-center md:items-end gap-2">
                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <span className="text-lg text-gray-700">{getText('footer.followUs')}</span>
                            <div className="flex items-center gap-3">
                                <Link href="#" className="text-black font-medium hover:text-[#3d5a80] transition-colors">
                                    INSTA
                                </Link>
                                <Link href="#" className="text-black font-medium hover:text-[#3d5a80] transition-colors">
                                    LinkedIn
                                </Link>
                                <Link href="#" className="text-black font-medium hover:text-[#3d5a80] transition-colors">
                                    Youtube
                                </Link>
                            </div>
                        </div>

                        {/* Get In Touch Button */}
                        <Link
                            href="/contact"
                            className="flex items-center gap-2 text-black font-medium hover:text-[#3d5a80] transition-colors"
                        >
                            <span>{getText('footer.getInTouch')}</span>
                            <Mail className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
