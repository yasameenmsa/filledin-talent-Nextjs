import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { withAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// Configure upload settings
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (request.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    await connectDB();

    // Get the authenticated user from the request
    const authUser = (request as any).user;
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is trying to upload their own CV or is an admin
    if (authUser.uid !== params.id && authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to upload CV for this user' },
        { status: 403 }
      );
    }

    // Get the user from database
    const user = await User.findOne({ 
      firebaseUid: params.id,
      isDeleted: { $ne: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('cv') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or Word document.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `cv_${params.id}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const cvUrl = `/uploads/cvs/${fileName}`;

    // Update user's CV URL in database
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          'profile.cvUrl': cvUrl,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      message: 'CV uploaded successfully',
      cvUrl,
      fileName
    });

  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);