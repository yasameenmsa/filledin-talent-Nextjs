'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Menu, X, ChevronDown, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Language-specific navigation text
const getNavigationText = (currentLanguage: string) => {
  switch (currentLanguage) {
    case 'ar':
      return {
        businesses: 'الشركات',
        jobSeekers: 'الباحثون عن عمل',
        aboutFINT: 'عن فينت',
        trends: 'الاتجاهات',
        expertise: 'الخبرة',
        engagement: 'المشاركة',
        jobSearch: 'البحث عن وظيفة',
        interviewTips: 'نصائح المقابلة',
        dropCV: 'إسقاط السيرة الذاتية'
      };
    case 'fr':
      return {
        businesses: 'Entreprises',
        jobSeekers: 'Chercheurs d\'emploi',
        aboutFINT: 'À propos de FINT',
        trends: 'Tendances',
        expertise: 'Expertise',
        engagement: 'Engagement',
        jobSearch: 'Recherche d\'emploi',
        interviewTips: 'Conseils d\'entretien',
        dropCV: 'Déposer CV'
      };
    default:
      return {
        businesses: 'Businesses',
        jobSeekers: 'Job seekers',
        aboutFINT: 'About FINT',
        trends: 'Trends',
        expertise: 'Expertise',
        engagement: 'Engagement',
        jobSearch: 'Job Search',
        interviewTips: 'Interview tips',
        dropCV: 'Drop CV'
      };
  }
};

// Language-specific UI text
const getUIText = (currentLanguage: string) => {
  switch (currentLanguage) {
    case 'ar':
      return {
        languages: 'اللغات',
        login: 'تسجيل الدخول',
        register: 'التسجيل',
        dashboard: 'لوحة التحكم',
        profile: 'الملف الشخصي',
        logout: 'تسجيل الخروج',
        english: 'English',
        french: 'Français',
        arabic: 'العربية'
      };
    case 'fr':
      return {
        languages: 'Langues',
        login: 'Connexion',
        register: 'Inscription',
        dashboard: 'Tableau de bord',
        profile: 'Profil',
        logout: 'Déconnexion',
        english: 'English',
        french: 'Français',
        arabic: 'العربية'
      };
    default:
      return {
        languages: 'Languages',
        login: 'Login',
        register: 'Register',
        dashboard: 'Dashboard',
        profile: 'Profile',
        logout: 'Logout',
        english: 'English',
        french: 'Français',
        arabic: 'العربية'
      };
  }
};

export default function Header({ currentLanguage }: { currentLanguage: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const { user, userData, logout } = useAuth();

  // Get current language from pathname
  // const currentLanguage = pathname?.split('/')[1] || 'en';



  const navigationText = getNavigationText(currentLanguage);
  const uiText = getUIText(currentLanguage);

  const navigation = [
    {
      name: navigationText.businesses,
      href: '/businesses',
      dropdown: [
        { name: navigationText.trends, href: '/businesses/trends' },
        { name: navigationText.expertise, href: '/businesses/expertise' },
        { name: navigationText.engagement, href: '/businesses/engagement' },
      ],
    },
    {
      name: navigationText.jobSeekers,
      href: '/job-seekers',
      dropdown: [
        { name: navigationText.jobSearch, href: '/jobs' },
        { name: navigationText.interviewTips, href: '/interview-tips' },
        { name: navigationText.dropCV, href: '/drop-cv' },
      ],
    },
    {
      name: navigationText.aboutFINT,
      href: '/about'
    },
  ];


  return (
    <header
      className="fixed top-0 w-full z-50 bg-white shadow-sm"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${currentLanguage}`} className="flex items-center">
            <Image
              src="/new-logo.png"
              alt="FilledIn Talent Logo"
              width={200}
              height={80}
              className="h-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === item.name ? null : item.name)}
                      className="flex items-center space-x-1 text-blue-900 hover:text-blue-600 transition-colors"
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {dropdownOpen === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2"
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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

            {/* Languages */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === 'languages' ? null : 'languages')}
                className="flex items-center space-x-2 text-blue-900"
              >
                <Image
                  src="/globe.svg"
                  alt={uiText.languages}
                  width={20}
                  height={20}
                  className="text-blue-900"
                />
                <span>{uiText.languages}</span>
              </button>

              <AnimatePresence>
                {dropdownOpen === 'languages' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl py-2"
                  >
                    <Link
                      href="/en"
                      className="block px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setDropdownOpen(null)}
                    >
                      {uiText.english}
                    </Link>
                    <Link
                      href="/fr"
                      className="block px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setDropdownOpen(null)}
                    >
                      {uiText.french}
                    </Link>
                    <Link
                      href="/ar"
                      className="block px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => setDropdownOpen(null)}
                    >
                      {uiText.arabic}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === 'user' ? null : 'user')}
                  className="flex items-center space-x-2 text-blue-900"
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
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2"
                    >
                      <Link
                        href={`/${userData?.role}/dashboard`}
                        className="block px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600"
                      >
                        {uiText.dashboard}
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600"
                      >
                        {uiText.profile}
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600"
                      >
                        {uiText.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-blue-900 hover:text-blue-600 transition-colors"
                >
                  {uiText.login}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {uiText.register}
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
              className="md:hidden bg-white shadow-lg rounded-b-lg py-2"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <>
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === item.name ? null : item.name)}
                          className="flex items-center justify-between w-full px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                        >
                          <span>{item.name}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {dropdownOpen === item.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="pl-5 pr-2 py-1 space-y-1"
                            >
                              {item.dropdown.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className="block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
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
                        className="block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Mobile Languages */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === 'languages-mobile' ? null : 'languages-mobile')}
                    className="flex items-center justify-between w-full px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <Image src="/globe.svg" alt={uiText.languages} width={20} height={20} />
                      <span>{uiText.languages}</span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen === 'languages-mobile' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="pl-5 pr-2 py-1 space-y-1"
                      >
                        <Link
                          href="/en"
                          className="block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                          onClick={() => {
                            setIsOpen(false);
                            setDropdownOpen(null);
                          }}
                        >
                          {uiText.english}
                        </Link>
                        <Link
                          href="/fr"
                          className="block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                          onClick={() => {
                            setIsOpen(false);
                            setDropdownOpen(null);
                          }}
                        >
                          {uiText.french}
                        </Link>
                        <Link
                          href="/ar"
                          className="block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                          onClick={() => {
                            setIsOpen(false);
                            setDropdownOpen(null);
                          }}
                        >
                          {uiText.arabic}
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {user ? (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Link
                      href={`/${userData?.role}/dashboard`}
                      className="block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {uiText.dashboard}
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {uiText.profile}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                    >
                      {uiText.logout}
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-blue-900 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {uiText.login}
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {uiText.register}
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