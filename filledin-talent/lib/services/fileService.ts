import { stat, unlink, readdir, mkdir } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { storageConfig } from '@/lib/config/storage';

export interface FileInfo {
  name: string;
  size: number;
  modified: Date;
  type: string;
  url: string;
}

export class FileService {
  // Use centralized storage configuration
  private static readonly PUBLIC_UPLOAD_BASE = path.join(process.cwd(), storageConfig.publicRoot);
  private static readonly PRIVATE_UPLOAD_BASE = path.join(process.cwd(), storageConfig.privateRoot);

  /**
   * Get the full filesystem path for a URL path
   */
  static getFileSystemPath(urlPath: string, isPrivate = false): string {
    // Handle storage URL prefix
    const urlPrefix = storageConfig.publicUrlPrefix;
    const relativePath = urlPath.replace(new RegExp(`^${urlPrefix}/`), '').replace(/^\//, '');
    const baseDir = isPrivate ? this.PRIVATE_UPLOAD_BASE : this.PUBLIC_UPLOAD_BASE;
    return path.join(baseDir, relativePath);
  }

  /**
   * Get the URL path for a filesystem path
   */
  static getUrlPath(fileSystemPath: string): string {
    // Check if path is in public or private storage
    if (fileSystemPath.includes(storageConfig.publicRoot)) {
      const relativePath = path.relative(this.PUBLIC_UPLOAD_BASE, fileSystemPath);
      return `${storageConfig.publicUrlPrefix}/${relativePath.replace(/\\/g, '/')}`;
    }
    // For private files, return API download path
    const relativePath = path.relative(this.PRIVATE_UPLOAD_BASE, fileSystemPath);
    return `/api/files/download/${relativePath.replace(/\\/g, '/')}`;
  }

  /**
   * Check if a file exists and get its info
   */
  static async getFileInfo(urlPath: string): Promise<FileInfo | null> {
    try {
      const filePath = this.getFileSystemPath(urlPath);
      const stats = await stat(filePath);

      return {
        name: path.basename(filePath),
        size: stats.size,
        modified: stats.mtime,
        type: this.getFileType(filePath),
        url: urlPath
      };
    } catch {
      return null;
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(urlPath: string): Promise<boolean> {
    try {
      const filePath = this.getFileSystemPath(urlPath);
      await unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List files in a directory
   */
  static async listFiles(directoryUrl: string): Promise<FileInfo[]> {
    try {
      const dirPath = this.getFileSystemPath(directoryUrl);
      const files = await readdir(dirPath);
      const fileInfos: FileInfo[] = [];

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
          const stats = await stat(filePath);
          if (stats.isFile()) {
            fileInfos.push({
              name: file,
              size: stats.size,
              modified: stats.mtime,
              type: this.getFileType(file),
              url: `${directoryUrl}/${file}`
            });
          }
        } catch {
          // Skip files that can't be accessed
          continue;
        }
      }

      return fileInfos.sort((a, b) => b.modified.getTime() - a.modified.getTime());
    } catch {
      return [];
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  static async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await mkdir(dirPath, { recursive: true });
    } catch (error) {
      if ((error as { code?: string }).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Get file type from filename
   */
  private static getFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();

    const typeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif'
    };

    return typeMap[ext] || 'application/octet-stream';
  }

  /**
   * Clean up old files (for maintenance)
   */
  static async cleanupOldFiles(directoryUrl: string, olderThanDays: number): Promise<number> {
    try {
      const files = await this.listFiles(directoryUrl);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      let deletedCount = 0;
      for (const file of files) {
        if (file.modified < cutoffDate) {
          if (await this.deleteFile(file.url)) {
            deletedCount++;
          }
        }
      }

      return deletedCount;
    } catch {
      return 0;
    }
  }

  /**
   * Get directory size
   */
  static async getDirectorySize(directoryUrl: string): Promise<number> {
    try {
      const files = await this.listFiles(directoryUrl);
      return files.reduce((total, file) => total + file.size, 0);
    } catch {
      return 0;
    }
  }
}

// API Response helpers
export function createFileResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function createFileErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
