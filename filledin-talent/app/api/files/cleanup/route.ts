import { NextRequest } from 'next/server';
import { FileService, createFileResponse, createFileErrorResponse } from '@/lib/services/fileService';
import { storageConfig } from '@/lib/config/storage';

// POST - Cleanup old files (admin only operation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { directory, olderThanDays } = body;

    if (!directory) {
      return createFileErrorResponse('Directory parameter is required', 400);
    }

    if (!olderThanDays || typeof olderThanDays !== 'number' || olderThanDays < 1) {
      return createFileErrorResponse('olderThanDays must be a positive number', 400);
    }

    // Validate directory path using storageConfig
    const validPrefix = storageConfig.publicUrlPrefix;
    if (!directory.startsWith(validPrefix) && !directory.startsWith('/uploads/') && !directory.startsWith('uploads/')) {
      return createFileErrorResponse('Invalid directory path', 400);
    }

    const normalizedDirectory = directory.startsWith('/') ? directory : `/${directory}`;

    // Check if directory exists and get initial stats
    // const initialFiles = await FileService.listFiles(normalizedDirectory);
    const initialSize = await FileService.getDirectorySize(normalizedDirectory);

    // Perform cleanup
    const deletedCount = await FileService.cleanupOldFiles(normalizedDirectory, olderThanDays);

    // Get final stats
    const finalFiles = await FileService.listFiles(normalizedDirectory);
    const finalSize = await FileService.getDirectorySize(normalizedDirectory);

    return createFileResponse({
      message: `Cleanup completed successfully`,
      directory: normalizedDirectory,
      deletedFiles: deletedCount,
      spaceFreed: initialSize - finalSize,
      remainingFiles: finalFiles.length,
      remainingSize: finalSize,
      olderThanDays
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return createFileErrorResponse('Internal Server Error', 500);
  }
}
