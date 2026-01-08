import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Message from '@/models/Message';
import { withAdminAuth, AuthenticatedRequest, AuthenticatedUser } from '@/lib/auth/nextauth-middleware';

async function patchHandler(
    req: AuthenticatedRequest,
    _user: AuthenticatedUser,
    context?: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const params = await context?.params;
        const id = params?.id;

        if (!id) {
            return NextResponse.json(
                { error: 'Message ID is required' },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        const message = await Message.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!message) {
            return NextResponse.json(
                { error: 'Message not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: message });
    } catch (error) {
        console.error('Update Message API Error:', error);
        return NextResponse.json(
            { error: 'Failed to update message' },
            { status: 500 }
        );
    }
}

async function deleteHandler(
    req: AuthenticatedRequest,
    _user: AuthenticatedUser,
    context?: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const params = await context?.params;
        const id = params?.id;

        if (!id) {
            return NextResponse.json(
                { error: 'Message ID is required' },
                { status: 400 }
            );
        }

        const message = await Message.findByIdAndDelete(id);

        if (!message) {
            return NextResponse.json(
                { error: 'Message not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete Message API Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete message' },
            { status: 500 }
        );
    }
}

export const PATCH = withAdminAuth(patchHandler as any);
export const DELETE = withAdminAuth(deleteHandler as any);
