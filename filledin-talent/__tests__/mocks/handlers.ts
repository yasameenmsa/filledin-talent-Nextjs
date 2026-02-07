import { http, HttpResponse } from 'msw'
import type { Job, Application, User } from '@/lib/types/models'

// Mock jobs data
const mockJobs: Job[] = [
  {
    _id: 'job-1',
    title: 'Software Engineer',
    description: 'Develop and maintain web applications.',
    company: {
      name: 'Tech Corp',
      logo: '/logos/tech-corp.png',
      website: 'https://techcorp.com',
    },
    category: 'technical',
    sector: 'oil-gas',
    location: { city: 'Houston', country: 'USA', region: 'Texas' },
    workingType: 'full-time',
    salary: {
      min: 80000,
      max: 120000,
      currency: 'USD',
      display: true,
      negotiable: false,
    },
    requirements: {
      experience: '3+ years',
      education: 'Bachelor\'s degree',
      skills: ['JavaScript', 'React', 'Node.js'],
    },
    responsibilities: ['Develop features', 'Write code', 'Review PRs'],
    status: 'active',
    postedBy: 'user-1',
    viewCount: 150,
    applicationCount: 10,
    featured: true,
    urgent: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    _id: 'job-2',
    title: 'HSE Manager',
    description: 'Lead health and safety initiatives.',
    company: {
      name: 'Energy Solutions',
      logo: '/logos/energy-solutions.png',
      website: 'https://energysolutions.com',
    },
    category: 'hse',
    sector: 'renewable',
    location: { city: 'London', country: 'UK', region: 'England' },
    workingType: 'full-time',
    salary: {
      min: 70000,
      max: 90000,
      currency: 'GBP',
      display: true,
      negotiable: true,
    },
    requirements: {
      experience: '5+ years',
      education: 'Bachelor\'s degree in Safety Engineering',
      skills: ['Safety Management', 'Risk Assessment', 'OSHA'],
    },
    responsibilities: ['Manage safety programs', 'Conduct audits'],
    status: 'active',
    postedBy: 'user-2',
    viewCount: 200,
    applicationCount: 5,
    featured: false,
    urgent: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
]

// Mock user data
const mockUser: User = {
  _id: 'user-1',
  email: 'test@example.com',
  role: 'job_seeker',
  isEmailVerified: true,
  loginAttempts: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  name: 'Test User',
  phone: '+1234567890',
  location: 'New York, USA',
  bio: 'Experienced professional',
  skills: ['JavaScript', 'TypeScript'],
}

// MSW handlers for API routes
export const handlers = [
  // Jobs API
  http.get('/api/jobs', () => {
    return HttpResponse.json({
      jobs: mockJobs,
      pagination: {
        total: mockJobs.length,
        page: 1,
        limit: 10,
        pages: 1,
      },
    })
  }),

  http.get('/api/jobs/:id', ({ params }) => {
    const job = mockJobs.find(j => j._id === params.id)
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    return HttpResponse.json({ job })
  }),

  http.post('/api/jobs', async ({ request }) => {
    const newJob = await request.json() as Partial<Job>
    const job: Job = {
      _id: `job-${Date.now()}`,
      title: newJob.title || 'New Job',
      description: newJob.description || '',
      company: newJob.company || { name: 'Company' },
      category: newJob.category || 'technical',
      sector: newJob.sector || 'oil-gas',
      location: newJob.location || { city: 'City', country: 'Country', region: 'Region' },
      workingType: newJob.workingType || 'full-time',
      salary: newJob.salary || { min: 0, max: 0, currency: 'USD', display: false, negotiable: false },
      requirements: newJob.requirements || { experience: '', education: '', skills: [] },
      responsibilities: newJob.responsibilities || [],
      status: 'active',
      postedBy: 'user-1',
      viewCount: 0,
      applicationCount: 0,
      featured: false,
      urgent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return HttpResponse.json({ job }, { status: 201 })
  }),

  // Applications API
  http.get('/api/applications', () => {
    return HttpResponse.json({
      applications: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      stats: {
        totalApplications: 0,
        pendingApplications: 0,
        shortlistedApplications: 0,
        rejectedApplications: 0,
      },
    })
  }),

  http.post('/api/applications', async ({ request }) => {
    const body = await request.json()
    // Type guard for application body
    const applicationBody = body as {
      jobId?: string;
      coverLetter?: string;
      cvUrl?: string;
    }
    const application: Application = {
      _id: `app-${Date.now()}`,
      job: applicationBody.jobId || '',
      applicant: 'user-1',
      coverLetter: applicationBody.coverLetter,
      cvUrl: applicationBody.cvUrl || '',
      status: 'pending',
      statusHistory: [{ status: 'pending', date: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return HttpResponse.json(application, { status: 201 })
  }),

  // User profile API
  http.get('/api/user/profile', () => {
    return HttpResponse.json({
      id: mockUser._id,
      email: mockUser.email,
      role: mockUser.role,
      isEmailVerified: mockUser.isEmailVerified,
      profile: {
        firstName: 'Test',
        lastName: 'User',
        phone: mockUser.phone,
        location: mockUser.location,
        bio: mockUser.bio,
        skills: mockUser.skills,
      },
    })
  }),

  http.put('/api/user/profile', async ({ request }) => {
    const updates = await request.json()
    // Type guard for profile updates
    const updateBody = updates as {
      email?: string;
      profile?: Record<string, unknown>;
    }
    return HttpResponse.json({
      id: mockUser._id,
      email: updateBody.email || mockUser.email,
      role: mockUser.role,
      isEmailVerified: mockUser.isEmailVerified,
      profile: {
        ...updateBody.profile,
      },
    })
  }),

  // Saved jobs API
  http.get('/api/saved-jobs', () => {
    return HttpResponse.json({ savedJobs: [] })
  }),

  http.post('/api/saved-jobs', async ({ request }) => {
    const body = await request.json()
    const { jobId } = body as { jobId?: string }
    return HttpResponse.json({
      _id: `saved-${Date.now()}`,
      userId: 'user-1',
      jobId: jobId || '',
      createdAt: new Date(),
    })
  }),

  http.delete('/api/saved-jobs', () => {
    return HttpResponse.json({ message: 'Job unsaved successfully' })
  }),
]

export default handlers
