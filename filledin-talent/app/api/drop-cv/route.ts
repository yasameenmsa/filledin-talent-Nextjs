import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db/mongodb';
import CV from '@/models/CV';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const language = formData.get('language') as string;

        console.log('Processing upload for:', name, email, 'Language:', language);

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only PDF and Word documents are allowed.' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitize filename and add timestamp
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${sanitizedFilename}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads/cvs');

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            // Ignore error if directory already exists
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Save to MongoDB
        await dbConnect();

        const cv = await CV.create({
            name,
            email,
            fileUrl: `/uploads/cvs/${filename}`,
            language
        });

        console.log(`CV Uploaded and Saved to DB: ${name} (${email}) - ${filename}`);

        return NextResponse.json({
            success: true,
            message: 'CV uploaded successfully',
            filename: filename,
            data: cv
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
