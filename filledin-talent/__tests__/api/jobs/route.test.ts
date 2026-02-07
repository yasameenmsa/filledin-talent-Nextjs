import { GET, POST } from '@/app/api/jobs/route'
import { NextRequest } from 'next/server'

// Mock the auth module
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

// Mock database connection
jest.mock('@/lib/db/mongodb', () => ({
  __esModule: true,
  default: jest.fn(),
}))

// Mock Job model
jest.mock('@/models/Job', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  },
}))

import { auth } from '@/auth'
import dbConnect from '@/lib/db/mongodb'
import Job from '@/models/Job'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockDbConnect = dbConnect as jest.Mock
const mockJobFind = Job.find as jest.Mock
const mockJobCount = Job.countDocuments as jest.Mock
const mockJobCreate = Job.create as jest.Mock

describe('/api/jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/jobs', () => {
    it('should return jobs list with pagination', async () => {
      // Setup mocks
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'job_seeker', email: 'test@example.com' },
      })
      mockDbConnect.mockResolvedValue(undefined)
      mockJobFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
        populate: jest.fn().mockReturnThis(),
      })
      mockJobCount.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/jobs?page=1&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('jobs')
      expect(data).toHaveProperty('pagination')
      expect(mockDbConnect).toHaveBeenCalled()
    })

    it('should handle search parameter', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'job_seeker', email: 'test@example.com' },
      })
      mockDbConnect.mockResolvedValue(undefined)
      mockJobFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
        populate: jest.fn().mockReturnThis(),
      })
      mockJobCount.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/jobs?q=developer')
      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should filter by category', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'job_seeker', email: 'test@example.com' },
      })
      mockDbConnect.mockResolvedValue(undefined)
      mockJobFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
        populate: jest.fn().mockReturnThis(),
      })
      mockJobCount.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/jobs?category=technical')
      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should return 500 on database error', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'job_seeker', email: 'test@example.com' },
      })
      mockDbConnect.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/jobs')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('POST /api/jobs', () => {
    it('should create a new job for admin users', async () => {
      const mockJob = {
        _id: 'job-1',
        title: 'Software Engineer',
        description: 'Test job',
        status: 'active',
      }

      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'admin', email: 'admin@example.com' },
      })
      mockDbConnect.mockResolvedValue(undefined)
      mockJobCreate.mockResolvedValue(mockJob)

      const request = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Software Engineer',
          description: 'Test job',
        }),
      })

      // Mock req.json()
      request.json = async () => ({
        title: 'Software Engineer',
        description: 'Test job',
      })

      const response = await POST(request)
      await response.json()

      expect(response.status).toBe(201)
      expect(mockJobCreate).toHaveBeenCalled()
    })

    it('should return 401 for non-admin users', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user-1', role: 'job_seeker', email: 'user@example.com' },
      })

      const request = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
      })
      request.json = async () => ({ title: 'Test' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error', 'Unauthorized')
    })

    it('should return 401 for unauthenticated users', async () => {
      mockAuth.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
      })
      request.json = async () => ({ title: 'Test' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error', 'Unauthorized')
    })
  })
})
