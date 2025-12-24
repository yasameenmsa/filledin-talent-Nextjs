import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'cv' or 'job-image'
        const jobId = formData.get('jobId') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

        // Determine upload directory based on type
        let uploadDir: string;
        let urlPath: string;

        if (type === 'job-image') {
            uploadDir = path.join(process.cwd(), 'public/uploads/jobs');
            urlPath = '/uploads/jobs';
        } else if (jobId) {
            // CV uploads for a specific job
            uploadDir = path.join(process.cwd(), `public/uploads/jobs/${jobId}`);
            urlPath = `/uploads/jobs/${jobId}`;
        } else {
            // Default to generic uploads if no jobId provided (fallback)
            uploadDir = path.join(process.cwd(), 'public/uploads');
            urlPath = '/uploads';
        }

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch {
            // Ignore error if directory already exists
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const fileUrl = `${urlPath}/${filename}`;

        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
