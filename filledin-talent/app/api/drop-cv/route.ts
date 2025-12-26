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

        // Get user ID if available (optional)
        let userId = null;
        try {
            // We can't easily get session here without importing auth, 
            // but we can try to find user by email since we have it
            if (email) {
                await dbConnect();
                // Dynamic import to avoid circular dependencies if any
                const User = (await import('@/models/User')).default;
                const user = await User.findOne({ email });
                if (user) {
                    userId = user._id;
                }
            }
        } catch (e) {
            console.error('Error finding user:', e);
        }

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
        } catch {
            // Ignore error if directory already exists
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Save to MongoDB
        await dbConnect();

        const cv = await CV.create({
            name,
            email,
            userId, // Save user ID
            originalName: file.name, // Save original filename
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
