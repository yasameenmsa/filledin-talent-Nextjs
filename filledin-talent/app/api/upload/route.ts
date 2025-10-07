import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

// POST /api/upload - Upload files to Firebase Storage
export const POST = withAuth(async (request, user) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'cv', 'image', 'document'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = {
      cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    };

    const maxSizes = {
      cv: 10 * 1024 * 1024, // 10MB
      image: 5 * 1024 * 1024, // 5MB
      document: 10 * 1024 * 1024 // 10MB
    };

    const type = fileType as keyof typeof allowedTypes;
    
    if (!allowedTypes[type] || !allowedTypes[type].includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}. Allowed types: ${allowedTypes[type].join(', ')}` },
        { status: 400 }
      );
    }

    if (file.size > maxSizes[type]) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${maxSizes[type] / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.userId}_${timestamp}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `${type}s/${fileName}`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return NextResponse.json({
      url: downloadURL,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
});

// GET /api/upload - Get upload status or file info (if needed)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Upload endpoint is ready' },
    { status: 200 }
  );
}