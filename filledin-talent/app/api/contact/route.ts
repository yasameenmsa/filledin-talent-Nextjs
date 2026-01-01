import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Message from '@/models/Message';

export async function POST(req: NextRequest) {
    try {
        const { email, message } = await req.json();

        if (!email || !message) {
            return NextResponse.json(
                { error: 'Email and message are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const newMessage = await Message.create({
            email,
            message,
        });

        return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
    } catch (error) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
