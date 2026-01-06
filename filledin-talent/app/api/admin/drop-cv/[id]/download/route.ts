import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db/mongodb';
import CV from '@/models/CV';
import { auth } from '@/auth';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const cv = await CV.findById(params.id);

        if (!cv) {
            return NextResponse.json(
                { error: 'CV not found' },
                { status: 404 }
            );
        }

        if (!cv.fileUrl) {
            return NextResponse.json(
                { error: 'File path missing' },
                { status: 404 }
            );
        }

        // Check if fileUrl is a full path or relative
        let filePath = cv.fileUrl;
        // In the upload route, we stored the full path. 
        // Ideally we should verify it is within the storage directory for security.

        try {
            const fileBuffer = await readFile(filePath);

            // Determine content type
            const ext = path.extname(cv.originalName || filePath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.pdf') contentType = 'application/pdf';
            else if (ext === '.doc') contentType = 'application/msword';
            else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            const searchParams = request.nextUrl.searchParams;
            const isView = searchParams.get('view') === 'true';
            const disposition = isView ? 'inline' : 'attachment';

            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `${disposition}; filename="${cv.originalName || 'cv'}${ext}"`,
                },
            });
        } catch (fileError) {
            console.error('Error reading file:', fileError);
            return NextResponse.json(
                { error: 'File not found on server' },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error('Error downloading CV:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
