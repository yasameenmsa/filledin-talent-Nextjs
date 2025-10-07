'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileForm from '@/components/forms/ProfileForm';
import { 
  User, 
  Building, 
  Settings, 
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Briefcase,
  Calendar,
  TrendingUp
} from 'lucide-react';

export default function EmployerProfilePage() {
  const { userData, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'company'>('profile');

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Personal Information',
      icon: User,
    },
    {
      id: 'company' as const,
      label: 'Company Details',
      icon: Building,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {userData.profile?.profileImage ? (
                    <img
                      src={userData.profile.profileImage}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userData.profile?.firstName && userData.profile?.lastName
                      ? `${userData.profile.firstName} ${userData.profile.lastName}`
                      : 'Complete Your Profile'
                    }
                  </h1>
                  <p className="text-gray-600">
                    {userData.profile?.position || 'Employer'}
                    {userData.profile?.company && ` at ${userData.profile.company}`}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <Users className="w-3 h-3 mr-1" />
                      Employer Account
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Quick Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userData.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {userData.email}
                </div>
              )}
              {userData.profile?.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {userData.profile.phone}
                </div>
              )}
              {userData.profile?.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {userData.profile.location}
                </div>
              )}
              {userData.profile?.website && (
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="w-4 h-4 mr-2" />
                  <a
                    href={userData.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Company Website
                  </a>
                </div>
              )}
            </div>

            {/* Profile Completion */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Profile Completion</span>
                <span className="font-medium text-gray-900">
                  {calculateEmployerProfileCompletion(userData)}%
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateEmployerProfileCompletion(userData)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center py-2 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <div>
              <ProfileForm
                onSuccess={() => {
                  // Profile updated successfully
                }}
              />
            </div>
          )}

          {activeTab === 'company' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Company Information
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your company details and employer profile
                </p>
              </div>

              <div className="p-6">
                {/* Company Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <p className="text-gray-900 font-medium">
                        {userData.profile?.company || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Position
                      </label>
                      <p className="text-gray-900">
                        {userData.profile?.position || 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <p className="text-gray-900">
                        {userData.profile?.industry || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Location
                      </label>
                      <p className="text-gray-900">
                        {userData.profile?.location || 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Website
                      </label>
                      {userData.profile?.website ? (
                        <a
                          href={userData.profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {userData.profile.website}
                        </a>
                      ) : (
                        <p className="text-gray-900">Not specified</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <p className="text-gray-900">{userData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Company Description */}
                {userData.profile?.bio && (
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{userData.profile.bio}</p>
                    </div>
                  </div>
                )}

                {/* Employer Tips */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Tips for Attracting Top Talent
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Complete your company profile with detailed information</li>
                    <li>• Add a compelling company description and culture overview</li>
                    <li>• Include your company website and social media links</li>
                    <li>• Post detailed job descriptions with clear requirements</li>
                    <li>• Respond promptly to job applications</li>
                    <li>• Highlight your company benefits and growth opportunities</li>
                  </ul>
                </div>

                {/* Edit Profile Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats for Employers */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate employer profile completion percentage
function calculateEmployerProfileCompletion(userData: any): number {
  const fields = [
    userData.profile?.firstName,
    userData.profile?.lastName,
    userData.email,
    userData.profile?.phone,
    userData.profile?.company,
    userData.profile?.position,
    userData.profile?.location,
    userData.profile?.bio,
    userData.profile?.website,
  ];

  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100);
}