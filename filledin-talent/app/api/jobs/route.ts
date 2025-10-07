import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withEmployerAuth } from '@/lib/auth/middleware';
import dbConnect from '@/lib/db/mongodb';
import Job from '@/models/Job';

// GET /api/jobs - Get all jobs with search, filtering, and pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const jobType = searchParams.get('jobType');
    const experienceLevel = searchParams.get('experienceLevel');
    const salaryMin = searchParams.get('salaryMin');
    const salaryMax = searchParams.get('salaryMax');
    const skills = searchParams.get('skills');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const isActive = searchParams.get('isActive');

    // Build filter query
    const filter: any = { isDeleted: { $ne: true } };

    // Only show active jobs for public access
    if (isActive !== 'false') {
      filter.isActive = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } },
        { 'location.remote': true }
      ];
    }

    if (jobType && ['full-time', 'part-time', 'contract', 'freelance', 'internship'].includes(jobType)) {
      filter.jobType = jobType;
    }

    if (experienceLevel && ['entry', 'mid', 'senior', 'lead', 'executive'].includes(experienceLevel)) {
      filter.experienceLevel = experienceLevel;
    }

    if (salaryMin || salaryMax) {
      filter['salary.min'] = {};
      if (salaryMin) filter['salary.min'].$gte = parseInt(salaryMin);
      if (salaryMax) filter['salary.max'] = { $lte: parseInt(salaryMax) };
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filter.requiredSkills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries
    const [jobs, totalCount] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'profile.firstName profile.lastName profile.company email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        search,
        location,
        jobType,
        experienceLevel,
        salaryMin,
        salaryMax,
        skills
      }
    });

  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create new job (employer only)
export const POST = withEmployerAuth(async (request, user) => {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      title,
      description,
      requirements,
      responsibilities,
      company,
      location,
      jobType,
      experienceLevel,
      salary,
      benefits,
      requiredSkills,
      preferredSkills,
      applicationDeadline,
      isRemote
    } = body;

    // Validate required fields
    if (!title || !description || !jobType || !experienceLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, jobType, experienceLevel' },
        { status: 400 }
      );
    }

    // Validate job type
    if (!['full-time', 'part-time', 'contract', 'freelance', 'internship'].includes(jobType)) {
      return NextResponse.json(
        { error: 'Invalid job type' },
        { status: 400 }
      );
    }

    // Validate experience level
    if (!['entry', 'mid', 'senior', 'lead', 'executive'].includes(experienceLevel)) {
      return NextResponse.json(
        { error: 'Invalid experience level' },
        { status: 400 }
      );
    }

    // Validate application deadline
    if (applicationDeadline && new Date(applicationDeadline) <= new Date()) {
      return NextResponse.json(
        { error: 'Application deadline must be in the future' },
        { status: 400 }
      );
    }

    // Create new job
    const newJob = new Job({
      title,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      company: {
        name: company?.name || user.profile?.company || '',
        logo: company?.logo || '',
        website: company?.website || '',
        description: company?.description || ''
      },
      location: {
        city: location?.city || '',
        state: location?.state || '',
        country: location?.country || '',
        remote: isRemote || false
      },
      jobType,
      experienceLevel,
      salary: {
        min: salary?.min || 0,
        max: salary?.max || 0,
        currency: salary?.currency || 'USD',
        period: salary?.period || 'yearly'
      },
      benefits: benefits || [],
      requiredSkills: requiredSkills || [],
      preferredSkills: preferredSkills || [],
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      postedBy: user.userId,
      isActive: true
    });

    await newJob.save();

    // Populate the posted by field for response
    await newJob.populate('postedBy', 'profile.firstName profile.lastName profile.company email');

    return NextResponse.json(newJob, { status: 201 });

  } catch (error) {
    console.error('POST /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
});