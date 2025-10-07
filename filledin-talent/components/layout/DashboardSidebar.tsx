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

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'employer' | 'jobseeker' | 'admin';
  lang: string;
}

export default function DashboardSidebar({ isOpen, onClose, userRole, lang }: DashboardSidebarProps) {
  const pathname = usePathname();

  const employerNavigation = [
    { name: 'Dashboard', href: `/${lang}/employer`, icon: Home },
    { name: 'My Jobs', href: `/${lang}/employer/jobs`, icon: Briefcase },
    { name: 'Candidates', href: `/${lang}/employer/candidates`, icon: Users },
    { name: 'Analytics', href: `/${lang}/employer/analytics`, icon: BarChart3 },
    { name: 'Profile', href: `/${lang}/employer/profile`, icon: User },
    { name: 'Settings', href: `/${lang}/employer/settings`, icon: Settings },
  ];

  const jobseekerNavigation = [
    { name: 'Dashboard', href: `/${lang}/jobseeker`, icon: Home },
    { name: 'Job Search', href: `/${lang}/jobs`, icon: Search },
    { name: 'My Applications', href: `/${lang}/jobseeker/applications`, icon: FileText },
    { name: 'Saved Jobs', href: `/${lang}/jobseeker/saved-jobs`, icon: BookmarkPlus },
    { name: 'Profile', href: `/${lang}/jobseeker/profile`, icon: User },
    { name: 'Settings', href: `/${lang}/jobseeker/settings`, icon: Settings },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: `/${lang}/admin`, icon: Home },
    { name: 'Users', href: `/${lang}/admin/users`, icon: Users },
    { name: 'Jobs', href: `/${lang}/admin/jobs`, icon: Briefcase },
    { name: 'Applications', href: `/${lang}/admin/applications`, icon: FileText },
    { name: 'Analytics', href: `/${lang}/admin/analytics`, icon: BarChart3 },
    { name: 'Settings', href: `/${lang}/admin/settings`, icon: Settings },
  ];

  const getNavigation = () => {
    switch (userRole) {
      case 'employer':
        return employerNavigation;
      case 'jobseeker':
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href={`/${lang}`} className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FT</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">FilledIn Talent</span>
              </Link>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== `/${lang}/${userRole}` && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
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
        'fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200">
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-4">
            <Link href={`/${lang}`} className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FT</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">FilledIn Talent</span>
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
              const isActive = pathname === item.href || 
                (item.href !== `/${lang}/${userRole}` && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
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