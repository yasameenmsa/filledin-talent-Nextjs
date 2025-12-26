import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/db/mongodb';

import File from '@/models/File';
import { auth } from '@/auth';

// File type configurations
const FILE_CONFIGS = {
    'cv': {
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxSize: 10 * 1024 * 1024, // 10MB
        extensions: ['.pdf', '.doc', '.docx']
    },
    'job-image': {
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
        extensions: ['.jpg', '.jpeg', '.png', '.webp']
    },
    'company-logo': {
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
        maxSize: 2 * 1024 * 1024, // 2MB
        extensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg']
    },
    'profile-image': {
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxSize: 3 * 1024 * 1024, // 3MB
        extensions: ['.jpg', '.jpeg', '.png', '.webp']
    },
    'document': {
        allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ],
        maxSize: 15 * 1024 * 1024, // 15MB
        extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']
    },
    'certificate': {
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        maxSize: 5 * 1024 * 1024, // 5MB
        extensions: ['.pdf', '.jpg', '.jpeg', '.png']
    }
};

// Validate file
function validateFile(file: File, type: string): { isValid: boolean; error?: string } {
    const config = FILE_CONFIGS[type as keyof typeof FILE_CONFIGS];

    if (!config) {
        return { isValid: false, error: 'Invalid file type' };
    }

    // Check file size
    if (file.size > config.maxSize) {
        return {
            isValid: false,
            error: `File size exceeds maximum allowed size of ${config.maxSize / (1024 * 1024)}MB`
        };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
        };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = config.extensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
        return {
            isValid: false,
            error: `File extension is not allowed. Allowed extensions: ${config.extensions.join(', ')}`
        };
    }

    return { isValid: true };
}

// Sanitize filename
function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        await connectDB();

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;
        const jobId = formData.get('jobId') as string;
        const companyId = formData.get('companyId') as string;

        // Use session user ID as fallback or primary source
        const currentUserId = session?.user?.id;
        const formUserId = formData.get('userId') as string;
        const formUploadedBy = formData.get('uploadedBy') as string;

        const userId = formUserId || currentUserId;
        const uploadedBy = formUploadedBy || currentUserId;

        if (!uploadedBy) {
            return NextResponse.json(
                { error: 'Unauthorized: User authentication required' },
                { status: 401 }
            );
        }

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        if (!type) {
            return NextResponse.json(
                { error: 'File type is required' },
                { status: 400 }
            );
        }

        // Validate file
        const validation = validateFile(file, type);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Generate safe filename
        const timestamp = Date.now();
        const sanitizedName = sanitizeFileName(file.name);
        const extension = path.extname(sanitizedName);
        const baseName = path.basename(sanitizedName, extension);
        const filename = `${timestamp}-${baseName}${extension}`;

        // Determine upload directory based on type and context
        let uploadDir: string;
        let urlPath: string;

        switch (type) {
            case 'cv':
                // CVs are stored per user
                uploadDir = path.join(process.cwd(), `public/uploads/cvs/${userId || 'general'}`);
                urlPath = `/uploads/cvs/${userId || 'general'}`;
                break;

            case 'job-image':
                // Job images can be general or job-specific
                if (jobId) {
                    uploadDir = path.join(process.cwd(), `public/uploads/jobs/${jobId}/images`);
                    urlPath = `/uploads/jobs/${jobId}/images`;
                } else {
                    uploadDir = path.join(process.cwd(), 'public/uploads/jobs/images');
                    urlPath = '/uploads/jobs/images';
                }
                break;

            case 'company-logo':
                // Company logos
                uploadDir = path.join(process.cwd(), `public/uploads/companies/${companyId || 'general'}/logos`);
                urlPath = `/uploads/companies/${companyId || 'general'}/logos`;
                break;

            case 'profile-image':
                // Profile images per user
                uploadDir = path.join(process.cwd(), `public/uploads/users/${userId || 'general'}/profile`);
                urlPath = `/uploads/users/${userId || 'general'}/profile`;
                break;

            case 'document':
                // General documents
                uploadDir = path.join(process.cwd(), `public/uploads/documents/${userId || 'general'}`);
                urlPath = `/uploads/documents/${userId || 'general'}`;
                break;

            case 'certificate':
                // Certificates per user
                uploadDir = path.join(process.cwd(), `public/uploads/certificates/${userId || 'general'}`);
                urlPath = `/uploads/certificates/${userId || 'general'}`;
                break;

            default:
                // Fallback for unknown types
                uploadDir = path.join(process.cwd(), 'public/uploads/general');
                urlPath = '/uploads/general';
        }

        // Create directory if it doesn't exist
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.warn('Directory creation warning:', error);
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const fileUrl = `${urlPath}/${filename}`;

        // Save file metadata to database
        let fileMetadata = null;
        try {
            const fileDoc = new File({
                filename,
                originalName: file.name,
                url: fileUrl,
                filePath: filepath,
                size: file.size,
                mimeType: file.type,
                fileType: type,
                uploadedBy: uploadedBy,
                userId: userId,
                jobId: jobId,
                companyId: companyId,
                isPublic: true, // Default to public, can be changed later
            });

            fileMetadata = await fileDoc.save();
        } catch (dbError) {
            console.warn('Failed to save file metadata to database:', dbError);
            // Continue with response even if DB save fails
        }

        return NextResponse.json({
            url: fileUrl,
            filename: filename,
            originalName: file.name,
            size: file.size,
            type: file.type,
            uploadType: type,
            uploadedAt: new Date().toISOString(),
            fileId: fileMetadata?._id?.toString(),
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
