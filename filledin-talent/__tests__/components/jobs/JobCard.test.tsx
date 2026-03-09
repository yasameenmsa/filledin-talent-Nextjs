import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import JobCard from '@/components/jobs/JobCard'
import type { Job } from '@/lib/types/models'

// Mock the JobImage component
jest.mock('@/components/jobs/JobImage', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className: string }) => (
    <div data-testid="job-image" className={className} aria-label={alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} />
    </div>
  ),
}))

// Mock the getJobTranslation utility
jest.mock('@/lib/utils/getJobTranslation', () => ({
  getJobTranslation: (job: Job) => ({
    title: job.title,
    description: job.description,
  }),
}))

describe('JobCard Component', () => {
  const mockJob: Job = {
    _id: 'job-123',
    title: 'Software Engineer',
    description: 'A great opportunity for a software engineer.',
    company: {
      name: 'Tech Company',
      logo: 'https://example.com/logo.png',
      website: 'https://example.com',
    },
    category: 'technical',
    sector: 'oil-gas',
    location: {
      city: 'Houston',
      country: 'USA',
      region: 'Texas',
    },
    workingType: 'full-time',
    salary: {
      min: 80000,
      max: 120000,
      currency: 'USD',
      display: true,
      negotiable: false,
    },
    requirements: {
      experience: '5 years',
      education: 'Bachelor\'s degree',
      skills: ['JavaScript', 'React', 'Node.js'],
    },
    responsibilities: ['Develop software', 'Write tests'],
    status: 'active',
    postedBy: 'user-123',
    viewCount: 100,
    applicationCount: 5,
    featured: true,
    urgent: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }

  it('renders job title correctly', () => {
    render(<JobCard job={mockJob} lang="en" />)
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
  })

  it('renders company name', () => {
    render(<JobCard job={mockJob} lang="en" />)
    expect(screen.getByText('Tech Company')).toBeInTheDocument()
  })

  it('renders featured badge when job is featured', () => {
    render(<JobCard job={mockJob} lang="en" />)
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('does not render featured badge when job is not featured', () => {
    const nonFeaturedJob = { ...mockJob, featured: false }
    render(<JobCard job={nonFeaturedJob} lang="en" />)
    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })

  it('renders salary information when display is true', () => {
    render(<JobCard job={mockJob} lang="en" />)
    expect(screen.getByText(/USD/i)).toBeInTheDocument()
    expect(screen.getByText(/80,000/i)).toBeInTheDocument()
    expect(screen.getByText(/120,000/i)).toBeInTheDocument()
  })

  it('renders location information', () => {
    render(<JobCard job={mockJob} lang="en" />)
    expect(screen.getByText('Houston')).toBeInTheDocument()
    expect(screen.getByText('USA')).toBeInTheDocument()
  })

  it('renders working type', () => {
    render(<JobCard job={mockJob} lang="en" />)
    expect(screen.getByText('full-time')).toBeInTheDocument()
  })

  it('renders Apply Now button when not applied', () => {
    render(<JobCard job={mockJob} lang="en" isApplied={false} />)
    expect(screen.getByText('Apply Now')).toBeInTheDocument()
  })

  it('renders Applied button when job is applied', () => {
    render(<JobCard job={mockJob} lang="en" isApplied={true} />)
    expect(screen.getByText('Applied')).toBeInTheDocument()
  })

  it('renders View Details button', () => {
    render(<JobCard job={mockJob} lang="en" />)
    expect(screen.getByText('View Details')).toBeInTheDocument()
  })

  it('renders job description', () => {
    render(<JobCard job={mockJob} lang="en" />)
    expect(screen.getByText(/great opportunity/i)).toBeInTheDocument()
  })

  it('has correct link for job details', () => {
    render(<JobCard job={mockJob} lang="en" />)
    const titleLink = screen.getByText('Software Engineer').closest('a')
    expect(titleLink).toHaveAttribute('href', '/en/jobs/job-123')
  })

  it('has correct link for apply', () => {
    render(<JobCard job={mockJob} lang="en" isApplied={false} />)
    const applyButton = screen.getByText('Apply Now').closest('a')
    expect(applyButton).toHaveAttribute('href', '/en/jobs/job-123/apply')
  })
})
