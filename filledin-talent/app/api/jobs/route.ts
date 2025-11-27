import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Job from '@/models/Job';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const data = await req.json();

        const job = await Job.create({
            ...data,
            postedBy: session.user.id,
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);

        // Build query based on params
        const query: any = { status: 'active' };

        const category = searchParams.get('category');
        if (category) query.category = category;

        const type = searchParams.get('type');
        if (type) query.workingType = type;

        const search = searchParams.get('search');
        if (search) {
            query.$text = { $search: search };
        }

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name email');

        return NextResponse.json({
            jobs,
            pagination: {
                total: jobs.length,
                pages: 1,
                page: 1,
                limit: jobs.length,
            },
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
