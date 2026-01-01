import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Message from '@/models/Message';
import { withAdminAuth } from '@/lib/auth/nextauth-middleware';

async function handler(req: NextRequest) {
    try {
        await dbConnect();

        const messages = await Message.find({}).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: messages });
    } catch (error) {
        console.error('Admin Messages API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

export const GET = withAdminAuth(handler);
