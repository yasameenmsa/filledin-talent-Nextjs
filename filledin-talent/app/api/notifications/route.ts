
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import Notification from '@/models/Notification';

export async function GET(_req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch notifications for the user
        // Limit to 20 most recent
        const notifications = await Notification.find({ recipient: session.user.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const unreadCount = await Notification.countDocuments({
            recipient: session.user.id,
            read: false
        });

        return NextResponse.json({
            notifications,
            unreadCount
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Mark all as read
        await Notification.updateMany(
            { recipient: session.user.id, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
