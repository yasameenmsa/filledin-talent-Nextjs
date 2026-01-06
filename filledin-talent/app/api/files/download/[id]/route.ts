import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/db/mongodb';
import File from '@/models/File';
import { auth } from '@/auth';

// MIME type to extension mapping for Content-Type header
const MIME_TYPES: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'text/plain': 'txt',
};

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Download file with authentication
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'File ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find the file in database
        const file = await File.findById(id);

        if (!file) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        // Check if file is public or if user has access
        if (!file.isPublic) {
            const session = await auth();

            if (!session?.user?.id) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            // Check if user owns this file or uploaded it
            const userId = session.user.id;
            const isOwner = file.userId?.toString() === userId;
            const isUploader = file.uploadedBy?.toString() === userId;

            // Allow admins to access any file
            const isAdmin = session.user.role === 'admin';

            if (!isOwner && !isUploader && !isAdmin) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
        }

        // Get the file path from database
        let filePath = file.filePath;

        // Handle both absolute and relative paths
        if (!path.isAbsolute(filePath)) {
            filePath = path.join(process.cwd(), filePath);
        }

        // Check if file exists on disk
        try {
            await stat(filePath);
        } catch {
            return NextResponse.json(
                { error: 'File not found on disk' },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = await readFile(filePath);

        // Determine content disposition (inline for images, attachment for documents)
        const isImage = file.mimeType.startsWith('image/');
        const disposition = isImage ? 'inline' : 'attachment';

        // Get query param for forced download
        const { searchParams } = new URL(request.url);
        const forceDownload = searchParams.get('download') === 'true';

        // Create response with file
        const response = new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': file.mimeType,
                'Content-Length': fileBuffer.length.toString(),
                'Content-Disposition': `${forceDownload ? 'attachment' : disposition}; filename="${encodeURIComponent(file.originalName)}"`,
                'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
                'X-Content-Type-Options': 'nosniff',
            },
        });

        return response;

    } catch (error) {
        console.error('File download error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
