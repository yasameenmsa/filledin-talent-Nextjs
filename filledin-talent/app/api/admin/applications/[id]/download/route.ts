import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db/mongodb';
import Application from '@/models/Application';
import File from '@/models/File';
import { auth } from '@/auth';
import { storageConfig } from '@/lib/config/storage';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Application ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find the application
        const application = await Application.findById(id)
            .populate('applicant', 'email profile.firstName profile.lastName');

        if (!application) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        if (!application.cvUrl) {
            return NextResponse.json(
                { error: 'CV not found for this application' },
                { status: 404 }
            );
        }

        // The cvUrl might be a file ID from /api/files/download/[id] or a direct path
        // Check if it's a URL pattern like /api/files/download/[id]
        let filePath: string;
        let originalName = 'cv.pdf';
        let mimeType = 'application/pdf';

        if (application.cvUrl.includes('/api/files/download/')) {
            // Extract file ID and get file info from database
            const fileId = application.cvUrl.split('/api/files/download/').pop();
            const fileDoc = await File.findById(fileId);

            if (!fileDoc) {
                return NextResponse.json(
                    { error: 'CV file not found in database' },
                    { status: 404 }
                );
            }

            filePath = fileDoc.filePath;
            originalName = fileDoc.originalName || 'cv.pdf';
            mimeType = fileDoc.mimeType || 'application/pdf';
        } else {
            // It's a direct file path - handle relative or absolute paths
            filePath = application.cvUrl;

            if (!path.isAbsolute(filePath)) {
                // Check if it starts with storage path prefixes
                if (filePath.startsWith(storageConfig.privateRoot)) {
                    filePath = path.join(process.cwd(), filePath);
                } else if (filePath.startsWith('/')) {
                    // Could be a relative path starting with /
                    filePath = path.join(process.cwd(), filePath.substring(1));
                } else {
                    filePath = path.join(process.cwd(), filePath);
                }
            }

            // Determine filename from path
            originalName = path.basename(filePath);
            const ext = path.extname(originalName).toLowerCase();
            if (ext === '.pdf') mimeType = 'application/pdf';
            else if (ext === '.doc') mimeType = 'application/msword';
            else if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        // Make sure path is absolute
        if (!path.isAbsolute(filePath)) {
            filePath = path.join(process.cwd(), filePath);
        }

        // Check if file exists on disk
        try {
            await stat(filePath);
        } catch {
            return NextResponse.json(
                { error: 'CV file not found on server' },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = await readFile(filePath);

        // Check query params for view mode
        const searchParams = request.nextUrl.searchParams;
        const isView = searchParams.get('view') === 'true';
        const disposition = isView ? 'inline' : 'attachment';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': mimeType,
                'Content-Length': fileBuffer.length.toString(),
                'Content-Disposition': `${disposition}; filename="${encodeURIComponent(originalName)}"`,
                'Cache-Control': 'private, max-age=3600',
            },
        });

    } catch (error) {
        console.error('Error downloading application CV:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
