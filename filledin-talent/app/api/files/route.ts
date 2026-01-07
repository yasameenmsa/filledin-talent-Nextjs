import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import File from '@/models/File';
import { unlink } from 'fs/promises';
import path from 'path';
import { storageConfig } from '@/lib/config/storage';

interface FileResponse {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  fileType: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  userId?: string;
  jobId?: string;
  companyId?: string;
  isPublic: boolean;
  createdAt: string;
}

// GET - List files with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const fileType = searchParams.get('fileType') || 'all';
    const userId = searchParams.get('userId') || 'all';
    const jobId = searchParams.get('jobId') || 'all';
    const uploadedBy = searchParams.get('uploadedBy') || 'all';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: Record<string, unknown> = {};

    if (fileType !== 'all') {
      query.fileType = fileType;
    }

    if (userId !== 'all') {
      query.userId = userId;
    }

    if (jobId !== 'all') {
      query.jobId = jobId;
    }

    if (uploadedBy !== 'all') {
      query.uploadedBy = uploadedBy;
    }

    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count
    const total = await File.countDocuments(query);

    // Get files with pagination and populate
    const files = await File.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('uploadedBy', 'name email')
      .populate('userId', 'name email')
      .lean();

    // Format response
    const filesResponse: FileResponse[] = files.map(file => ({
      id: String(file._id),
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      size: file.size,
      mimeType: file.mimeType,
      fileType: file.fileType,
      uploadedBy: {
        id: (file.uploadedBy as { _id: unknown })._id?.toString() || '',
        name: (file.uploadedBy as { name: string }).name || 'Unknown User',
      },
      userId: file.userId?.toString(),
      jobId: file.jobId?.toString(),
      companyId: file.companyId?.toString(),
      isPublic: file.isPublic,
      createdAt: file.createdAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      files: filesResponse,
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', files: [], total: 0 },
      { status: 500 }
    );
  }
}

// DELETE - Bulk delete files
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',') || [];

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: 'File IDs are required' },
        { status: 400 }
      );
    }

    // Get files to delete their physical files
    const filesToDelete = await File.find({ _id: { $in: ids } });

    // Delete physical files
    const deletePromises = filesToDelete.map(async (file) => {
      try {
        // filePath is now stored as absolute path in the new system
        // Handle both old (public/uploads) and new (storageConfig) paths using centralized config
        let absolutePath = file.filePath;

        if (!path.isAbsolute(absolutePath)) {
          // Handle storage paths using storageConfig
          if (absolutePath.startsWith(storageConfig.publicUrlPrefix.substring(1))) {
            // New public storage path (e.g., storage/uploads/...)
            absolutePath = path.join(process.cwd(), 'public', absolutePath);
          } else if (absolutePath.startsWith(storageConfig.publicUrlPrefix)) {
            // URL path with leading slash (e.g., /storage/uploads/...)
            absolutePath = path.join(process.cwd(), 'public', absolutePath.substring(1));
          } else if (absolutePath.startsWith(storageConfig.privateRoot)) {
            // Private storage path (e.g., storage/uploads/cvs/...)
            absolutePath = path.join(process.cwd(), absolutePath);
          } else if (absolutePath.startsWith('/uploads') || absolutePath.startsWith('uploads')) {
            // Legacy path (e.g., /uploads/filename.pdf)
            const cleanPath = absolutePath.replace(/^\/?uploads/, '');
            absolutePath = path.join(process.cwd(), storageConfig.publicRoot, cleanPath);
          } else {
            // Fallback: treat as relative path from project root
            absolutePath = path.join(process.cwd(), absolutePath);
          }
        }

        await unlink(absolutePath);
      } catch (fileError) {
        console.warn(`Failed to delete physical file ${file.filePath}:`, fileError);
      }
    });

    await Promise.all(deletePromises);

    // Delete from database
    const result = await File.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} file(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting files:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}