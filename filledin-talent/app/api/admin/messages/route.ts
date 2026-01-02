import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Message from '@/models/Message';
import { withAdminAuth } from '@/lib/auth/nextauth-middleware';

async function handler(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            Message.find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Message.countDocuments({})
        ]);

        return NextResponse.json({
            success: true,
            data: messages,
            pagination: {
                total,
                page,
                limit,
                hasMore: total > skip + messages.length
            }
        });
    } catch (error) {
        console.error('Admin Messages API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

export const GET = withAdminAuth(handler);
