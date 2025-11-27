'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Menu, X, ChevronDown, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileLocaleSwitcher } from './MobileLocaleSwitcher';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const { user, userData, logout } = useAuth();
  const { currentLanguage, isRTL } = useLanguage();

  const getText = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'nav.businesses': {
        en: 'Businesses',
        ar: 'الشركات',
        fr: 'Entreprises'
      },
      'nav.trends': {
        en: 'Trends',
        ar: 'الاتجاهات',
        fr: 'Tendances'
      },
      'nav.expertise': {
        en: 'Expertise',
        ar: 'الخبرة',
        fr: 'Expertise'
      },
      'nav.engagement': {
        en: 'Engagement',
        ar: 'المشاركة',
        fr: 'Engagement'
      },
      'nav.jobSeekers': {
        en: 'Job seekers',
        ar: 'الباحثون عن عمل',
        fr: 'Chercheurs d\'emploi'
      },
      'nav.jobSearch': {
        en: 'Job Search',
        ar: 'البحث عن وظيفة',
        fr: 'Recherche d\'emploi'
      },
      'nav.interviewTips': {
        en: 'Interview tips',
        ar: 'نصائح المقابلة',
        fr: 'Conseils d\'entretien'
      },
      'nav.dropCV': {
        en: 'Drop CV',
        ar: 'إسقاط السيرة الذاتية',
        fr: 'Déposer CV'
      },
      'nav.aboutFINT': {
        en: 'About FINT',
        ar: 'عن فينت',
        fr: 'À propos de FINT'
      },
      'ui.dashboard': {
        en: 'Dashboard',
        ar: 'لوحة التحكم',
        fr: 'Tableau de bord'
      },
      'ui.profile': {
        en: 'Profile',
        ar: 'الملف الشخصي',
        fr: 'Profil'
      },
      'ui.logout': {
        en: 'Logout',
        ar: 'تسجيل الخروج',
        fr: 'Déconnexion'
      },
      'ui.login': {
        en: 'Login',
        ar: ' تسجيل الدخول',
        fr: 'Connexion'
      },
      'ui.register': {
        en: 'Register',
        ar: 'التسجيل',
        fr: 'S\'inscrire'
      }
    };

    return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
  };

  // Logo selection based on language
  const logoSrc = '/new-logo.png';

  const navigation = [
    {
      name: getText('nav.businesses'),
      href: `/${currentLanguage}/businesses`,
      dropdown: [
        { name: getText('nav.trends'), href: `/${currentLanguage}/businesses/trends` },
        { name: getText('nav.expertise'), href: `/${currentLanguage}/businesses/expertise` },
        { name: getText('nav.engagement'), href: `/${currentLanguage}/businesses/engagement` },
      ],
    },
    {
      name: getText('nav.jobSeekers'),
      href: `/${currentLanguage}/job-seekers`,
      dropdown: [
        { name: getText('nav.jobSearch'), href: `/${currentLanguage}/jobs` },
        { name: getText('nav.interviewTips'), href: `/${currentLanguage}/interview-tips` },
        { name: getText('nav.dropCV'), href: `/${currentLanguage}/drop-cv` },
      ],
    },
    {
      name: getText('nav.aboutFINT'),
      href: `/${currentLanguage}/about`
    },
  ];


  return (
    <header
      className={`fixed top-0 w-full z-50 bg-white shadow-sm ${isRTL ? 'rtl' : 'ltr'}`}
    >
      <nav className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={logoSrc}
              alt="FINT Logo"
              width={300}
              height={150}
              className="h-15 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === item.name ? null : item.name)}
                      className={`flex items-center text-blue-900 hover:text-blue-600 transition-colors ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'
                        }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-4 h-4 ${isRTL ? 'chevron-right' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-2 max-h-[80vh] overflow-y-auto ${isRTL ? 'right-0 left-auto' : 'left-0 right-auto'
                            }`}
                          style={{ maxWidth: 'calc(100vw - 2rem)' }}
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 transition-colors ${isRTL ? 'text-right' : 'text-left'
                                }`}
                              onClick={() => setDropdownOpen(null)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="text-blue-900 hover:text-blue-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Language Switcher */}
            <LocaleSwitcher />

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === 'user' ? null : 'user')}
                  className={`flex items-center text-blue-900 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'
                    }`}
                >
                  <User className="w-5 h-5" />
                  <span>{userData?.profile?.firstName}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute mt-2 w-48 bg-white rounded-lg shadow-xl py-2 max-h-[80vh] overflow-y-auto ${isRTL ? 'left-0 right-auto' : 'right-0 left-auto'
                        }`}
                      style={{ maxWidth: 'calc(100vw - 2rem)' }}
                    >
                      {userData?.role && (
                        <>
                          <Link
                            href={`/${currentLanguage}/${userData.role}`}
                            className={`block px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 ${isRTL ? 'text-right' : 'text-left'
                              }`}
                          >
                            {getText('ui.dashboard')}
                          </Link>
                          <Link
                            href={`/${currentLanguage}/${userData.role}/profile`}
                            className={`block px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 ${isRTL ? 'text-right' : 'text-left'
                              }`}
                          >
                            {getText('ui.profile')}
                          </Link>
                        </>
                      )}
                      <button
                        onClick={logout}
                        className={`block w-full px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 ${isRTL ? 'text-right' : 'text-left'
                          }`}
                      >
                        {getText('ui.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                <Link
                  href={`/${currentLanguage}/login`}
                  className="text-blue-900 hover:text-blue-600 transition-colors"
                >
                  {getText('ui.login')}
                </Link>
                <Link
                  href={`/${currentLanguage}/register`}
                  className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {getText('ui.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-blue-900"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`md:hidden bg-white shadow-lg rounded-b-lg py-2 mobile-menu ${isRTL ? 'rtl' : 'ltr'}`}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <>
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === item.name ? null : item.name)}
                          className={`flex items-center justify-between w-full px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md ${isRTL ? 'text-right' : 'text-left'
                            }`}
                        >
                          <span>{item.name}</span>
                          <ChevronDown className={`w-4 h-4 ${isRTL ? 'chevron-right' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {dropdownOpen === item.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className={`py-1 space-y-1 ${isRTL ? 'pr-5 pl-2' : 'pl-5 pr-2'}`}
                            >
                              {item.dropdown.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={`block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md ${isRTL ? 'text-right' : 'text-left'
                                    }`}
                                  onClick={() => {
                                    setIsOpen(false);
                                    setDropdownOpen(null);
                                  }}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className={`block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md ${isRTL ? 'text-right' : 'text-left'
                          }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Mobile Language Switcher */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2">
                    <MobileLocaleSwitcher />
                  </div>
                </div>

                {user ? (
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-end">
                    {userData?.role && (
                      <>
                        <Link
                          href={`/${currentLanguage}/${userData.role}`}
                          className={`block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md ${isRTL ? 'text-right' : 'text-left'
                            }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {getText('ui.dashboard')}
                        </Link>
                        <Link
                          href={`/${currentLanguage}/${userData.role}/profile`}
                          className={`block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md ${isRTL ? 'text-right' : 'text-left'
                            }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {getText('ui.profile')}
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className={`block w-full px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md ${isRTL ? 'text-right' : 'text-left'
                        }`}
                    >
                      {getText('ui.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-end">
                    <Link
                      href={`/${currentLanguage}/login`}
                      className={`block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md ${isRTL ? 'text-right' : 'text-left'
                        }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {getText('ui.login')}
                    </Link>
                    <Link
                      href={`/${currentLanguage}/register`}
                      className={`block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md ${isRTL ? 'text-right' : 'text-left'
                        }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {getText('ui.register')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}