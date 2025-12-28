import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const data = await req.json();
        const { jobId, cvUrl, coverLetter } = data;

        // Check if job exists and is active
        const job = await Job.findById(jobId);
        if (!job || job.status !== 'active') {
            return NextResponse.json({ error: 'Job not found or closed' }, { status: 404 });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: session.user.id,
        });

        if (existingApplication) {
            return NextResponse.json({ error: 'Already applied to this job' }, { status: 400 });
        }

        const application = await Application.create({
            job: jobId,
            applicant: session.user.id,
            cvUrl,
            coverLetter,
            status: 'pending',
        });

        // Increment application count on Job
        job.applicationCount += 1;
        await job.save();

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        console.error('Error creating application:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Filters
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build base query
        const query: any = { applicant: session.user.id };

        if (status && status !== 'all') {
            query.status = status;
        }

        // Search logic
        if (search) {
            // Find jobs matching the search term first
            const matchingJobs = await Job.find({
                $text: { $search: search }
            }).select('_id');

            const jobIds = matchingJobs.map(job => job._id);

            // Add job IDs to query
            query.job = { $in: jobIds };
        }

        // Execute query
        const [applications, total] = await Promise.all([
            Application.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'job',
                    populate: { path: 'company' }
                })
                .lean(),
            Application.countDocuments(query)
        ]);

        console.log(`[API] Found ${total} applications for user ${session.user.id}`);

        // Calculate stats
        // Mongoose aggregation requires explicit ObjectId casting
        const userIdObj = new mongoose.Types.ObjectId(session.user.id);

        const [statsResult] = await Application.aggregate([
            { $match: { applicant: userIdObj } }, // Only current user's applications
            {
                $group: {
                    _id: null,
                    totalApplications: { $sum: 1 },
                    pendingApplications: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                    },
                    shortlistedApplications: {
                        $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] }
                    },
                    rejectedApplications: {
                        $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
                    }
                }
            }
        ]);

        const stats = statsResult || {
            totalApplications: 0,
            pendingApplications: 0,
            shortlistedApplications: 0,
            rejectedApplications: 0
        };

        return NextResponse.json({
            success: true,
            applications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            stats: {
                totalApplications: stats.totalApplications,
                pendingApplications: stats.pendingApplications,
                shortlistedApplications: stats.shortlistedApplications,
                rejectedApplications: stats.rejectedApplications
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
