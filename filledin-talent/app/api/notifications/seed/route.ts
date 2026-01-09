
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Notification from '@/models/Notification';

export async function POST(_req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const notification = await Notification.create({
            recipient: session.user.id,
            type: 'system',
            title: 'Welcome to Notifications!',
            message: 'This is a test notification to verify the new system is working correctly. Click to mark as read.',
            read: false
        });

        return NextResponse.json({ success: true, notification });

    } catch (error) {
        console.error('Error seeding notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
