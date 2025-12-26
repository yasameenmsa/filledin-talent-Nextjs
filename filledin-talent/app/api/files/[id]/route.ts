import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import File from '@/models/File';
import { unlink } from 'fs/promises';
import path from 'path';

// GET - Get file details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const fileId = resolvedParams.id;

    const file = await File.findById(fileId)
      .populate('uploadedBy', 'name email')
      .populate('userId', 'name email')
      .populate('jobId', 'title')
      .populate('companyId', 'name');

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: String(file._id),
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      filePath: file.filePath,
      size: file.size,
      mimeType: file.mimeType,
      fileType: file.fileType,
      uploadedBy: {
        id: String((file.uploadedBy as unknown as { _id: string })._id),
        name: (file.uploadedBy as unknown as { name: string }).name,
        email: (file.uploadedBy as unknown as { email: string }).email,
      },
      userId: file.userId ? {
        id: String((file.userId as unknown as { _id: string })._id),
        name: (file.userId as unknown as { name: string }).name,
        email: (file.userId as unknown as { email: string }).email,
      } : null,
      jobId: file.jobId ? {
        id: String((file.jobId as unknown as { _id: string })._id),
        title: (file.jobId as unknown as { title: string }).title,
      } : null,
      companyId: file.companyId ? {
        id: String((file.companyId as unknown as { _id: string })._id),
        name: (file.companyId as unknown as { name: string }).name,
      } : null,
      isPublic: file.isPublic,
      metadata: file.metadata,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT - Update file metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const fileId = resolvedParams.id;
    const body = await request.json();

    const { originalName, isPublic, metadata } = body;

    const updateData: Record<string, unknown> = {};

    if (originalName !== undefined) {
      updateData.originalName = originalName;
    }

    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }

    if (metadata !== undefined) {
      updateData.metadata = { ...metadata };
    }

    const file = await File.findByIdAndUpdate(
      fileId,
      { $set: updateData },
      { new: true }
    ).populate('uploadedBy', 'name email');

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'File updated successfully',
      file: {
        id: String(file._id),
        filename: file.filename,
        originalName: file.originalName,
        isPublic: file.isPublic,
        metadata: file.metadata,
      },
    });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const fileId = resolvedParams.id;

    // Get file info before deletion
    const file = await File.findById(fileId);
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete physical file
    try {
      // Convert relative path to absolute
      const absolutePath = path.join(process.cwd(), 'public', file.filePath.replace('/uploads', 'uploads'));
      await unlink(absolutePath);
    } catch (fileError) {
      console.warn(`Failed to delete physical file ${file.filePath}:`, fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await File.findByIdAndDelete(fileId);

    return NextResponse.json({
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

