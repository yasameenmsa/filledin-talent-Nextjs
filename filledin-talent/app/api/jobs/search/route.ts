import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Job from '@/models/Job';

// GET /api/jobs/search - Advanced job search with aggregation
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location');
    const jobTypes = searchParams.get('jobTypes')?.split(',') || [];
    const experienceLevels = searchParams.get('experienceLevels')?.split(',') || [];
    const salaryMin = searchParams.get('salaryMin');
    const salaryMax = searchParams.get('salaryMax');
    const skills = searchParams.get('skills')?.split(',') || [];
    const remote = searchParams.get('remote');
    const postedWithin = searchParams.get('postedWithin'); // days
    const sortBy = searchParams.get('sortBy') || 'relevance';

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage - basic filters
    const matchStage: any = {
      isDeleted: { $ne: true },
      isActive: true
    };

    // Text search
    if (query) {
      matchStage.$text = { $search: query };
    }

    // Location filter
    if (location) {
      matchStage.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Remote filter
    if (remote === 'true') {
      matchStage['location.remote'] = true;
    } else if (remote === 'false') {
      matchStage['location.remote'] = { $ne: true };
    }

    // Job types filter
    if (jobTypes.length > 0) {
      matchStage.jobType = { $in: jobTypes };
    }

    // Experience levels filter
    if (experienceLevels.length > 0) {
      matchStage.experienceLevel = { $in: experienceLevels };
    }

    // Salary filter
    if (salaryMin || salaryMax) {
      const salaryFilter: any = {};
      if (salaryMin) salaryFilter.$gte = parseInt(salaryMin);
      if (salaryMax) salaryFilter.$lte = parseInt(salaryMax);
      matchStage['salary.min'] = salaryFilter;
    }

    // Skills filter
    if (skills.length > 0) {
      matchStage.requiredSkills = { 
        $in: skills.map(skill => new RegExp(skill.trim(), 'i')) 
      };
    }

    // Posted within filter
    if (postedWithin) {
      const days = parseInt(postedWithin);
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      matchStage.createdAt = { $gte: dateThreshold };
    }

    pipeline.push({ $match: matchStage });

    // Add score for text search
    if (query) {
      pipeline.push({
        $addFields: {
          score: { $meta: 'textScore' }
        }
      });
    }

    // Populate posted by
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'postedBy',
        foreignField: '_id',
        as: 'postedBy',
        pipeline: [
          {
            $project: {
              'profile.firstName': 1,
              'profile.lastName': 1,
              'profile.company': 1,
              email: 1
            }
          }
        ]
      }
    });

    pipeline.push({
      $unwind: '$postedBy'
    });

    // Sort stage
    let sortStage: any = {};
    switch (sortBy) {
      case 'relevance':
        if (query) {
          sortStage = { score: { $meta: 'textScore' }, createdAt: -1 };
        } else {
          sortStage = { createdAt: -1 };
        }
        break;
      case 'newest':
        sortStage = { createdAt: -1 };
        break;
      case 'oldest':
        sortStage = { createdAt: 1 };
        break;
      case 'salary_high':
        sortStage = { 'salary.max': -1, createdAt: -1 };
        break;
      case 'salary_low':
        sortStage = { 'salary.min': 1, createdAt: -1 };
        break;
      case 'applications':
        sortStage = { applicationCount: -1, createdAt: -1 };
        break;
      default:
        sortStage = { createdAt: -1 };
    }

    pipeline.push({ $sort: sortStage });

    // Facet for pagination and total count
    pipeline.push({
      $facet: {
        jobs: [
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    });

    // Execute aggregation
    const [result] = await Job.aggregate(pipeline);
    const jobs = result.jobs || [];
    const totalCount = result.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get search suggestions and filters
    const [suggestions, filters] = await Promise.all([
      // Get popular search terms (simplified)
      Job.aggregate([
        { $match: { isDeleted: { $ne: true }, isActive: true } },
        { $unwind: '$requiredSkills' },
        { $group: { _id: '$requiredSkills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { skill: '$_id', count: 1, _id: 0 } }
      ]),
      
      // Get available filter options
      Job.aggregate([
        { $match: { isDeleted: { $ne: true }, isActive: true } },
        {
          $group: {
            _id: null,
            jobTypes: { $addToSet: '$jobType' },
            experienceLevels: { $addToSet: '$experienceLevel' },
            locations: { $addToSet: '$location.city' },
            companies: { $addToSet: '$company.name' }
          }
        }
      ])
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      suggestions: suggestions.map(s => s.skill),
      filters: filters[0] || {
        jobTypes: [],
        experienceLevels: [],
        locations: [],
        companies: []
      },
      searchParams: {
        query,
        location,
        jobTypes,
        experienceLevels,
        salaryMin,
        salaryMax,
        skills,
        remote,
        postedWithin,
        sortBy
      }
    });

  } catch (error) {
    console.error('GET /api/jobs/search error:', error);
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    );
  }
}