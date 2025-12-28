'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Settings,
  User,
  BookmarkPlus,
  Search,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'job_seeker' | 'admin';
  lang: string;
}

export default function DashboardSidebar({ isOpen, onClose, userRole, lang }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { currentLanguage, isRTL } = useLanguage();

  const getText = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'dashboard.nav.dashboard': {
        en: 'Dashboard',
        ar: 'لوحة التحكم',
        fr: 'Tableau de bord'
      },
      'dashboard.jobseeker.jobSearch': {
        en: 'Job Search',
        ar: 'البحث عن وظيفة',
        fr: 'Recherche d\'emploi'
      },
      'dashboard.jobseeker.myApplications': {
        en: 'My Applications',
        ar: 'طلباتي',
        fr: 'Mes candidatures'
      },
      'dashboard.nav.savedJobs': {
        en: 'Saved Jobs',
        ar: 'الوظائف المحفوظة',
        fr: 'Emplois sauvegardés'
      },
      'dashboard.nav.profile': {
        en: 'Profile',
        ar: 'الملف الشخصي',
        fr: 'Profil'
      },
      'dashboard.nav.settings': {
        en: 'Settings',
        ar: 'الإعدادات',
        fr: 'Paramètres'
      },
      'dashboard.nav.users': {
        en: 'Users',
        ar: 'المستخدمون',
        fr: 'Utilisateurs'
      },
      'dashboard.nav.jobs': {
        en: 'Jobs',
        ar: 'الوظائف',
        fr: 'Emplois'
      },
      'dashboard.nav.applications': {
        en: 'Applications',
        ar: 'الطلبات',
        fr: 'Candidatures'
      },
      'dashboard.nav.analytics': {
        en: 'Analytics',
        ar: 'التحليلات',
        fr: 'Analyses'
      }
    };

    return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
  };

  const jobseekerNavigation = [
    { name: getText('dashboard.nav.dashboard'), href: `/${lang}/jobseeker`, icon: Home },
    { name: getText('dashboard.jobseeker.jobSearch'), href: `/${lang}/jobs`, icon: Search },
    { name: getText('dashboard.jobseeker.myApplications'), href: `/${lang}/jobseeker/applications`, icon: FileText },
    { name: getText('dashboard.nav.savedJobs'), href: `/${lang}/jobseeker/saved-jobs`, icon: BookmarkPlus },
    { name: getText('dashboard.nav.profile'), href: `/${lang}/jobseeker/profile`, icon: User },
    { name: getText('dashboard.nav.settings'), href: `/${lang}/jobseeker/settings`, icon: Settings },
  ];

  const adminNavigation = [
    { name: getText('dashboard.nav.dashboard'), href: `/${lang}/admin`, icon: Home },
    { name: getText('dashboard.nav.users'), href: `/${lang}/admin/users`, icon: Users },
    { name: getText('dashboard.nav.jobs'), href: `/${lang}/admin/jobs`, icon: Briefcase },
    { name: getText('dashboard.nav.applications'), href: `/${lang}/admin/applications`, icon: FileText },
    { name: getText('dashboard.nav.analytics'), href: `/${lang}/admin/analytics`, icon: BarChart3 },
    { name: getText('dashboard.nav.settings'), href: `/${lang}/admin/settings`, icon: Settings },
  ];

  const getNavigation = () => {
    switch (userRole) {
      case 'job_seeker':
        return jobseekerNavigation;
      case 'admin':
        return adminNavigation;
      default:
        return jobseekerNavigation;
    }
  };

  const navigation = getNavigation();

  return (
    <>
      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col",
        isRTL ? "lg:right-0" : "lg:left-0"
      )}>
        <div className={cn(
          "flex min-h-0 flex-1 flex-col bg-white border-gray-200",
          isRTL ? "border-l" : "border-r"
        )}>
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href={`/${lang}`} className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FT</span>
                </div>
                <span className={cn(
                  "text-xl font-bold text-gray-900",
                  isRTL ? "mr-2" : "ml-2"
                )}>FilledIn Talent</span>
              </Link>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isRootPath = item.href === `/${lang}/jobseeker` || item.href === `/${lang}/admin`;

                const isActive = isRootPath
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isRTL && 'flex-row-reverse justify-end',
                      isActive
                        ? cn(
                          'bg-blue-50 text-blue-700 border-blue-700',
                          isRTL ? 'border-l-2' : 'border-r-2'
                        )
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isRTL ? 'ml-3' : 'mr-3',
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-y-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden',
        isRTL ? 'right-0' : 'left-0',
        isOpen
          ? 'translate-x-0'
          : isRTL ? 'translate-x-full' : '-translate-x-full'
      )}>
        <div className={cn(
          "flex min-h-0 flex-1 flex-col border-gray-200",
          isRTL ? "border-l" : "border-r"
        )}>
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-4">
            <Link href={`/${lang}`} className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FT</span>
              </div>
              <span className={cn(
                "text-xl font-bold text-gray-900",
                isRTL ? "mr-2" : "ml-2"
              )}>FilledIn Talent</span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-4 flex-1 space-y-1 px-2 pb-4">
            {navigation.map((item) => {
              const isRootPath = item.href === `/${lang}/jobseeker` || item.href === `/${lang}/admin`;

              const isActive = isRootPath
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isRTL && 'flex-row-reverse justify-end',
                    isActive
                      ? cn(
                        'bg-blue-50 text-blue-700 border-blue-700',
                        isRTL ? 'border-l-2' : 'border-r-2'
                      )
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isRTL ? 'ml-3' : 'mr-3',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}