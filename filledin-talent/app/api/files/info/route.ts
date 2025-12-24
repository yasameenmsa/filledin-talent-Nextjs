import { NextRequest, NextResponse } from 'next/server';
import { FileService, createFileResponse, createFileErrorResponse } from '@/lib/services/fileService';

// GET - Get file information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('file');

    if (!fileUrl) {
      return createFileErrorResponse('File parameter is required', 400);
    }

    // Validate file path (basic security check)
    if (!fileUrl.startsWith('/uploads/')) {
      return createFileErrorResponse('Invalid file path', 400);
    }

    const fileInfo = await FileService.getFileInfo(fileUrl);

    if (!fileInfo) {
      return createFileErrorResponse('File not found', 404);
    }

    return createFileResponse({ file: fileInfo });
  } catch (error) {
    console.error('Error getting file info:', error);
    return createFileErrorResponse('Internal Server Error', 500);
  }
}
