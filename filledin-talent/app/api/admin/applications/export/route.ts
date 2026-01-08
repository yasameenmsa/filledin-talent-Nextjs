import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';
        const format = searchParams.get('format') || 'csv';

        // Build query (same as main applications route)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        // If search term provided, search in job titles and applicant names
        let jobIds: string[] = [];
        let applicantIds: string[] = [];

        if (search) {
            // Find jobs matching the search term
            const matchingJobs = await Job.find({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            jobIds = matchingJobs.map(job => job._id.toString());

            // Find users matching the search term
            const matchingUsers = await User.find({
                $or: [
                    { 'profile.firstName': { $regex: search, $options: 'i' } },
                    { 'profile.lastName': { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            applicantIds = matchingUsers.map(user => user._id.toString());

            if (jobIds.length > 0 || applicantIds.length > 0) {
                query.$or = [];
                if (jobIds.length > 0) {
                    query.$or.push({ job: { $in: jobIds } });
                }
                if (applicantIds.length > 0) {
                    query.$or.push({ applicant: { $in: applicantIds } });
                }
            } else {
                // No matches found, return empty result if format is json, or empty csv
                if (format === 'json') {
                    return NextResponse.json({ applications: [], total: 0 });
                }
                const headers = ['ID', 'Job Title', 'Company', 'Applicant Name', 'Applicant Email', 'Status', 'Applied Date'];
                return new NextResponse(headers.join(','), {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename="applications-export.csv"'
                    }
                });
            }
        }

        // Get all applications (no pagination for export)
        const applications = await Application.find(query)
            .sort({ createdAt: -1 })
            .populate({
                path: 'job',
                select: 'title company location workingType'
            })
            .populate({
                path: 'applicant',
                select: 'email profile.firstName profile.lastName profile.phone'
            })
            .lean();

        // Format data for export
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const applicationsForExport = applications.map((app: any) => {
            const applicantName = app.applicant.profile?.firstName
                ? `${app.applicant.profile.firstName} ${app.applicant.profile.lastName || ''}`.trim()
                : 'N/A';

            return {
                id: app._id.toString(),
                jobTitle: app.job?.title || 'N/A',
                company: app.job?.company?.name || 'N/A', // Handle nested company object
                location: app.job?.location ? `${app.job.location.city}, ${app.job.location.country}` : 'N/A',
                applicantName: applicantName,
                applicantEmail: app.applicant?.email || 'N/A',
                applicantPhone: app.applicant?.profile?.phone || '',
                status: app.status,
                cvUrl: app.cvUrl,
                coverLetter: app.coverLetter || '',
                createdAt: app.createdAt.toISOString()
            };
        });

        if (format === 'csv') {
            // Create CSV content
            const headers = [
                'ID',
                'Job Title',
                'Company',
                'Location',
                'Applicant Name',
                'Applicant Email',
                'Applicant Phone',
                'Status',
                'CV URL',
                'Cover Letter',
                'Applied Date'
            ];

            const csvRows = [
                headers.join(','),
                ...applicationsForExport.map(app => [
                    app.id,
                    `"${(app.jobTitle || '').replace(/"/g, '""')}"`,
                    `"${(app.company || '').replace(/"/g, '""')}"`,
                    `"${(app.location || '').replace(/"/g, '""')}"`,
                    `"${(app.applicantName || '').replace(/"/g, '""')}"`,
                    app.applicantEmail,
                    app.applicantPhone,
                    app.status,
                    app.cvUrl,
                    `"${(app.coverLetter || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                    app.createdAt
                ].join(','))
            ];

            const csvContent = csvRows.join('\n');

            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="applications-export.csv"'
                }
            });
        } else {
            // JSON format
            return NextResponse.json({
                applications: applicationsForExport,
                total: applicationsForExport.length,
                exportedAt: new Date().toISOString(),
            });
        }

    } catch (error) {
        console.error('Error exporting applications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
