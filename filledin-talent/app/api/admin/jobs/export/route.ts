import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Job from '@/models/Job';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const sector = searchParams.get('sector') || 'all';
    const postedBy = searchParams.get('postedBy') || 'all';
    const format = searchParams.get('format') || 'csv';

    // Build query (same as main jobs route)
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (category !== 'all') {
      query.category = category;
    }

    if (sector !== 'all') {
      query.sector = sector;
    }

    if (postedBy !== 'all') {
      query.postedBy = postedBy;
    }

    // Get all jobs (no pagination for export)
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email')
      .lean();

    // Format data for export
    const jobsForExport = jobs.map(job => ({
      id: (job._id as any).toString(),
      title: job.title,
      description: job.description || '',
      companyName: job.company.name,
      companyWebsite: job.company.website || '',
      category: job.category,
      sector: job.sector,
      city: job.location.city,
      country: job.location.country,
      region: job.location.region,
      workingType: job.workingType,
      contractDuration: job.contractDuration || '',
      salaryMin: job.salary?.min?.toString() || '',
      salaryMax: job.salary?.max?.toString() || '',
      salaryCurrency: job.salary?.currency || 'USD',
      salaryDisplay: job.salary?.display ? 'Yes' : 'No',
      salaryNegotiable: job.salary?.negotiable ? 'Yes' : 'No',
      status: job.status,
      featured: job.featured ? 'Yes' : 'No',
      urgent: job.urgent ? 'Yes' : 'No',
      viewCount: (job.viewCount || 0).toString(),
      applicationCount: (job.applicationCount || 0).toString(),
      postedByName: job.postedBy?.name || 'Unknown',
      postedByEmail: job.postedBy?.email || '',
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    }));

    if (format === 'csv') {
      // Create CSV content
      const headers = [
        'ID',
        'Title',
        'Description',
        'Company Name',
        'Company Website',
        'Category',
        'Sector',
        'City',
        'Country',
        'Region',
        'Working Type',
        'Contract Duration',
        'Salary Min',
        'Salary Max',
        'Salary Currency',
        'Salary Display',
        'Salary Negotiable',
        'Status',
        'Featured',
        'Urgent',
        'View Count',
        'Application Count',
        'Posted By Name',
        'Posted By Email',
        'Created At',
        'Updated At'
      ];

      const csvRows = [
        headers.join(','),
        ...jobsForExport.map(job => [
          job.id,
          `"${job.title.replace(/"/g, '""')}"`,
          `"${job.description.replace(/"/g, '""')}"`,
          `"${job.companyName.replace(/"/g, '""')}"`,
          job.companyWebsite,
          job.category,
          job.sector,
          job.city,
          job.country,
          job.region,
          job.workingType,
          `"${job.contractDuration}"`,
          job.salaryMin,
          job.salaryMax,
          job.salaryCurrency,
          job.salaryDisplay,
          job.salaryNegotiable,
          job.status,
          job.featured,
          job.urgent,
          job.viewCount,
          job.applicationCount,
          `"${job.postedByName.replace(/"/g, '""')}"`,
          job.postedByEmail,
          job.createdAt,
          job.updatedAt
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="jobs-export.csv"'
        }
      });
    } else {
      // JSON format
      return NextResponse.json({
        jobs: jobsForExport,
        total: jobsForExport.length,
        exportedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error exporting jobs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}