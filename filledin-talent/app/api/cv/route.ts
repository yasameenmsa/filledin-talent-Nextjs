import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import CV from '@/models/CV';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(_request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Find user first to get ID
        const User = (await import('@/models/User')).default;
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find all CVs for this user
        const cvs = await CV.find({ userId: user._id }).sort({ createdAt: -1 });

        return NextResponse.json({ cvs });
    } catch (error) {
        console.error('Error fetching CVs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'CV ID is required' }, { status: 400 });
        }

        await dbConnect();

        // Verify ownership
        const User = (await import('@/models/User')).default;
        const user = await User.findOne({ email: session.user.email });

        const cv = await CV.findOne({ _id: id, userId: user._id });

        if (!cv) {
            return NextResponse.json({ error: 'CV not found' }, { status: 404 });
        }

        // Delete file from filesystem
        try {
            const filePath = path.join(process.cwd(), 'public', cv.fileUrl);
            await unlink(filePath);
        } catch (error) {
            console.error('Error deleting file:', error);
            // Continue to delete DB record even if file delete fails
        }

        // Delete from DB
        await CV.deleteOne({ _id: id });

        // If this was the active CV in user profile, clear it
        if (user.profile?.cvUrl === cv.fileUrl) {
            user.profile.cvUrl = undefined;
            await user.save();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting CV:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, isArchived } = body;

        if (!id) {
            return NextResponse.json({ error: 'CV ID is required' }, { status: 400 });
        }

        await dbConnect();

        const User = (await import('@/models/User')).default;
        const user = await User.findOne({ email: session.user.email });

        const cv = await CV.findOne({ _id: id, userId: user._id });

        if (!cv) {
            return NextResponse.json({ error: 'CV not found' }, { status: 404 });
        }

        cv.isArchived = isArchived;
        await cv.save();

        // If archiving the active CV, clear it from user profile
        if (isArchived && user.profile?.cvUrl === cv.fileUrl) {
            user.profile.cvUrl = undefined;
            await user.save();
        }

        return NextResponse.json({ success: true, cv });
    } catch (error) {
        console.error('Error updating CV:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
