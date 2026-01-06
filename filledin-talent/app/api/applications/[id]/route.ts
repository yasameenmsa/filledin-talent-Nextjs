import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

// PATCH: Update application status (admin only)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const { status, note } = await req.json();

        // Validate status
        const validStatuses = ['pending', 'interviews', 'accepted', 'rejected', 'offer-accepted', 'offer-rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const application = await Application.findById(id);
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Update status and add to history
        application.status = status;
        application.statusHistory.push({
            status,
            date: new Date(),
            note,
            updatedBy: session.user.id,
        });

        await application.save();

        return NextResponse.json({ application }, { status: 200 });
    } catch (error) {
        console.error('Error updating application:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// GET: Get specific application details (admin or applicant)
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const application = await Application.findById(id)
            .populate('job')
            .populate('applicant', 'name email');

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Check authorization: admin or the applicant themselves
        if (session.user.role !== 'admin' && application.applicant._id.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ application }, { status: 200 });
    } catch (error) {
        console.error('Error fetching application:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
