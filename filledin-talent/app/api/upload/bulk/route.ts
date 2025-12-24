import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/db/mongodb';
import File from '@/models/File';

// Reuse validation and utility functions from main upload route
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

// Get upload directory and URL path based on type
function getUploadPaths(type: string, userId?: string, jobId?: string, companyId?: string) {
    let uploadDir: string;
    let urlPath: string;

    switch (type) {
        case 'cv':
            uploadDir = path.join(process.cwd(), `public/uploads/cvs/${userId || 'general'}`);
            urlPath = `/uploads/cvs/${userId || 'general'}`;
            break;

        case 'job-image':
            if (jobId) {
                uploadDir = path.join(process.cwd(), `public/uploads/jobs/${jobId}/images`);
                urlPath = `/uploads/jobs/${jobId}/images`;
            } else {
                uploadDir = path.join(process.cwd(), 'public/uploads/jobs/images');
                urlPath = '/uploads/jobs/images';
            }
            break;

        case 'company-logo':
            uploadDir = path.join(process.cwd(), `public/uploads/companies/${companyId || 'general'}/logos`);
            urlPath = `/uploads/companies/${companyId || 'general'}/logos`;
            break;

        case 'profile-image':
            uploadDir = path.join(process.cwd(), `public/uploads/users/${userId || 'general'}/profile`);
            urlPath = `/uploads/users/${userId || 'general'}/profile`;
            break;

        case 'document':
            uploadDir = path.join(process.cwd(), `public/uploads/documents/${userId || 'general'}`);
            urlPath = `/uploads/documents/${userId || 'general'}`;
            break;

        case 'certificate':
            uploadDir = path.join(process.cwd(), `public/uploads/certificates/${userId || 'general'}`);
            urlPath = `/uploads/certificates/${userId || 'general'}`;
            break;

        default:
            uploadDir = path.join(process.cwd(), 'public/uploads/general');
            urlPath = '/uploads/general';
    }

    return { uploadDir, urlPath };
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const type = formData.get('type') as string;
        const userId = formData.get('userId') as string;
        const jobId = formData.get('jobId') as string;
        const companyId = formData.get('companyId') as string;
        const uploadedBy = formData.get('uploadedBy') as string;

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files uploaded' },
                { status: 400 }
            );
        }

        if (!type) {
            return NextResponse.json(
                { error: 'File type is required' },
                { status: 400 }
            );
        }

        if (files.length > 10) {
            return NextResponse.json(
                { error: 'Maximum 10 files allowed in bulk upload' },
                { status: 400 }
            );
        }

        const { uploadDir, urlPath } = getUploadPaths(type, userId, jobId, companyId);

        // Create directory if it doesn't exist
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.warn('Directory creation warning:', error);
        }

        const uploadedFiles = [];
        const errors = [];

        // Process each file
        for (const file of files) {
            try {
                // Validate file
                const validation = validateFile(file, type);
                if (!validation.isValid) {
                    errors.push({
                        filename: file.name,
                        error: validation.error
                    });
                    continue;
                }

                const buffer = Buffer.from(await file.arrayBuffer());

                // Generate safe filename
                const timestamp = Date.now();
                const sanitizedName = sanitizeFileName(file.name);
                const extension = path.extname(sanitizedName);
                const baseName = path.basename(sanitizedName, extension);
                const filename = `${timestamp}-${baseName}${extension}`;

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
                        uploadedBy: uploadedBy || userId,
                        userId: userId,
                        jobId: jobId,
                        companyId: companyId,
                        isPublic: true,
                    });

                    fileMetadata = await fileDoc.save();
                } catch (dbError) {
                    console.warn(`Failed to save file metadata for ${filename}:`, dbError);
                }

                uploadedFiles.push({
                    url: fileUrl,
                    filename: filename,
                    originalName: file.name,
                    size: file.size,
                    type: file.type,
                    uploadType: type,
                    uploadedAt: new Date().toISOString(),
                    fileId: fileMetadata?._id?.toString(),
                });

            } catch (fileError) {
                console.error(`Error processing file ${file.name}:`, fileError);
                errors.push({
                    filename: file.name,
                    error: 'Failed to process file'
                });
            }
        }

        return NextResponse.json({
            uploadedFiles,
            errors,
            totalUploaded: uploadedFiles.length,
            totalErrors: errors.length,
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

