import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import CV from '@/models/CV';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const cvs = await CV.find({})
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');

        return NextResponse.json({
            success: true,
            data: cvs
        });

    } catch (error) {
        console.error('Error fetching CVs:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
