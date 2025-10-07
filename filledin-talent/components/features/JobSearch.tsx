'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Clock, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';

interface Job {
  _id: string;
  title: string;
  company: { name: string };
  location: { city: string; country: string };
  workingType: string;
  category: string;
  description: string;
  salary: { min: number; max: number; currency: string };
  createdAt: string;
}

interface JobFilters {
  keywords: string;
  location: string;
  category: string;
  workingType: string;
  sector: string;
  salaryMin?: number;
  salaryMax?: number;
}

export default function JobSearch() {
  const [filters, setFilters] = useState<JobFilters>({
    keywords: '',
    location: '',
    category: '',
    workingType: '',
    sector: '',
  });
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const debouncedKeywords = useDebounce(filters.keywords, 500);
  const { locale } = useTranslation();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          ...(filters.keywords && { keywords: filters.keywords }),
          ...(filters.location && { location: filters.location }),
          ...(filters.category && { category: filters.category }),
          ...(filters.workingType && { workingType: filters.workingType }),
          ...(filters.sector && { sector: filters.sector }),
        });

        const response = await fetch(`/api/jobs?${queryParams}`);
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [debouncedKeywords, filters.location, filters.category, filters.workingType, filters.sector, filters.keywords, filters.sector]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Keywords, Job Title"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.keywords}
              onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="">All Locations</option>
              {/* Add more location options */}
            </select>
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="hse">HSE</option>
              <option value="corporate">Corporate</option>
              <option value="executive">Executive</option>
              <option value="operations">Operations</option>
            </select>
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300"
            onClick={() => fetchJobs()}
          >
            <Search className="w-5 h-5 mr-2" /> Search
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-4 text-center">
          <button
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-center mx-auto"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>
        </div>

        {/* Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t border-gray-200 pt-6">
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={filters.workingType}
                onChange={(e) => setFilters({ ...filters, workingType: e.target.value })}
              >
                <option value="">Working Type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
              >
                <option value="">Sector</option>
                <option value="oil-gas">Oil & Gas</option>
                <option value="renewable">Renewable</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Salary Range (Optional) */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Salary"
                className="w-1/2 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.salaryMin || ''}
                onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value ? parseInt(e.target.value) : undefined })}
              />
              <input
                type="number"
                placeholder="Max Salary"
                className="w-1/2 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.salaryMax || ''}
                onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length > 0 ? (
          jobs.map((job: Job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-1">{job.company.name} - {job.location.city}, {job.location.country}</p>
              <p className="text-gray-500 text-sm mb-4">{job.workingType} - {job.category}</p>
              <p className="text-gray-700 text-base line-clamp-3">{job.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-blue-600 font-semibold">
                  {formatCurrency(job.salary.min, locale, job.salary.currency)} - {formatCurrency(job.salary.max, locale, job.salary.currency)}
                </span>
                <a href={`/jobs/${job._id}`} className="text-blue-600 hover:underline">View Details</a>
              </div>
              <p className="text-gray-500 text-sm mt-2">Posted: {formatDate(new Date(job.createdAt), locale)}</p>
            </div>
          ))
        ) : (
          <p>No jobs found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}