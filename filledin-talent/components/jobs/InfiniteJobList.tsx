'use client'

import { useState, useCallback, memo } from 'react'
import { MapPin, Briefcase, Clock, DollarSign, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInfiniteScroll, useInfiniteScrollList } from '@/hooks/useInfiniteScroll'
import { JobCardSkeleton, LoadingSpinner } from '@/components/ui/loading-skeleton'
import Link from 'next/link'
import JobImage from '@/components/jobs/JobImage'
import type { Job } from '@/lib/types/models'

interface InfiniteJobListProps {
  lang: string
  initialFilters?: Record<string, string>
  appliedJobIds?: Set<string>
}

/**
 * Infinite scroll job list component
 *
 * Automatically loads more jobs as user scrolls to bottom
 * Replaces traditional pagination with better UX
 */
function InfiniteJobList({ lang, initialFilters = {}, appliedJobIds = new Set() }: InfiniteJobListProps) {
  const [filters] = useState(initialFilters)

  // Fetch jobs for a specific page
  const fetchJobs = useCallback(async (page: number): Promise<Job[]> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: '12',
      ...filters,
    })

    const response = await fetch(`/api/jobs?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch jobs')
    }

    const data = await response.json()
    return data.jobs || []
  }, [filters])

  // Use infinite scroll hook
  const { items: jobs, loading, hasMore, loadMore, error } = useInfiniteScrollList(fetchJobs)

  // Intersection observer callback for infinite scroll
  const { ref: loadMoreRef } = useInfiniteScroll(() => {
    if (hasMore && !loading) {
      loadMore()
    }
  })

  const getJobText = useCallback((key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'jobs.apply': { en: 'Apply', ar: 'قدم الآن', fr: 'Postuler' },
      'jobs.viewDetails': { en: 'View Details', ar: 'عرض التفاصيل', fr: 'Voir les détails' },
    }
    return translations[key]?.[lang] || translations[key]?.['en'] || key
  }, [lang])

  // Helper to format job display
  const formatJobDisplay = useCallback((job: Job) => {
    return {
      title: job.title,
      description: job.description?.substring(0, 150) + '...',
      salary: job.salary?.display
        ? job.salary.min && job.salary.max
          ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
          : 'Competitive'
        : null,
      location: `${job.location.city}, ${job.location.country}`,
      date: new Date(job.createdAt).toLocaleDateString(),
    }
  }, [])

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-red-600">Error loading jobs. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {jobs.map((job) => (
        <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Job Image */}
            <div className="w-full md:w-48 h-32 flex-shrink-0 relative">
              <JobImage
                src={job.imageUrl}
                alt={job.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-blue-900 hover:underline">
                    <Link href={`/${lang}/jobs/${job._id}`}>
                      {job.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 font-medium">{job.company?.name || 'Confidential'}</p>
                </div>
                {job.featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {formatJobDisplay(job).location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {job.workingType}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatJobDisplay(job).date}
                </div>
                {formatJobDisplay(job).salary && (
                  <div className="flex items-center text-green-700 font-medium">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {formatJobDisplay(job).salary}
                  </div>
                )}
              </div>

              <p className="mt-4 text-gray-600 line-clamp-2">{formatJobDisplay(job).description}</p>
            </div>

            <div className="flex flex-col gap-2 min-w-[150px] justify-center">
              {appliedJobIds.has(job._id.toString()) ? (
                <Button disabled className="w-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-50">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Applied
                </Button>
              ) : (
                <Link href={`/${lang}/jobs/${job._id}/apply`}>
                  <Button className="w-full bg-blue-900 hover:bg-blue-800">
                    {getJobText('jobs.apply')}
                  </Button>
                </Link>
              )}
              <Link href={`/${lang}/jobs/${job._id}`}>
                <Button variant="outline" className="w-full">
                  {getJobText('jobs.viewDetails')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Loading skeletons when fetching more */}
      {loading && <JobCardSkeleton count={3} />}

      {/* Load more trigger at bottom */}
      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {loading && <LoadingSpinner size="sm" />}
        {!hasMore && jobs.length > 0 && (
          <p className="text-gray-500 text-sm">No more jobs to load</p>
        )}
      </div>
    </div>
  )
}

export default memo(InfiniteJobList)
