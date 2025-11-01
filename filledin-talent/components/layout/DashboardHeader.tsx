'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
  _id: string;
  email: string;
  name?: string;
  role: 'job_seeker' | 'employer' | 'admin';
  profile?: {
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
}

interface DashboardHeaderProps {
  onMenuClick: () => void;
  user: User;
  lang: string;
}

export default function DashboardHeader({ onMenuClick, user, lang }: DashboardHeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { currentLanguage } = useLanguage();

  // Inline translations
  const getText = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        jobseekerRole: 'Job Seeker',
        adminTitle: 'Admin Dashboard',
        user: 'User',
        search: 'Search',
        notifications: 'Notifications',
        noData: 'No notifications',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout'
      },
      ar: {
        jobseekerRole: 'باحث عن عمل',
        adminTitle: 'لوحة تحكم المدير',
        user: 'مستخدم',
        search: 'بحث',
        notifications: 'الإشعارات',
        noData: 'لا توجد إشعارات',
        profile: 'الملف الشخصي',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج'
      },
      fr: {
        jobseekerRole: 'Demandeur d\'emploi',
        adminTitle: 'Tableau de bord Admin',
        user: 'Utilisateur',
        search: 'Rechercher',
        notifications: 'Notifications',
        noData: 'Aucune notification',
        profile: 'Profil',
        settings: 'Paramètres',
        logout: 'Déconnexion'
      }
    };
    return translations[currentLanguage]?.[key] || translations.en[key];
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push(`/${lang}/login`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getProfileUrl = () => {
    return `/${lang}/${user.role}/profile`;
  };

  const getSettingsUrl = () => {
    return `/${lang}/${user.role}/settings`;
  };

  const getUserDisplayName = () => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    return user.email;
  };

  const getRoleDisplayName = () => {
    switch (user.role) {
      case 'job_seeker':
        return getText('jobseekerRole');
      case 'admin':
        return getText('adminTitle');
      default:
        return getText('user');
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search bar */}
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={getText('search')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md relative"
              >
                <Bell className="h-6 w-6" />
                {/* Notification badge */}
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* Notifications dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
                      {getText('notifications')}
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-500">
                      {getText('noData')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 p-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                  <div className="text-xs text-gray-500">{getRoleDisplayName()}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Profile dropdown menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Link
                      href={getProfileUrl()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      {getText('profile')}
                    </Link>
                    <Link
                      href={getSettingsUrl()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      {getText('settings')}
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      {getText('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}