'use client';

import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CVUploadProps {
  onUploadSuccess?: (cvUrl: string) => void;
  onUploadError?: (error: string) => void;
  currentCvUrl?: string;
  className?: string;
}

export default function CVUpload({ 
  onUploadSuccess, 
  onUploadError, 
  currentCvUrl,
  className = '' 
}: CVUploadProps) {
  const { user, userData, updateProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF or Word document (.pdf, .doc, .docx)';
    }
    if (file.size > maxFileSize) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('cv', file);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.cvUrl);
            } catch (error) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.error || 'Upload failed'));
            } catch (error) {
              reject(new Error('Upload failed'));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('POST', `/api/users/${user?.uid}/cv`);
        xhr.send(formData);
      });
    } catch (error) {
      throw error;
    }
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onUploadError?.(validationError);
      return;
    }

    try {
      const cvUrl = await uploadFile(file);
      
      // Update user profile with new CV URL
      if (userData) {
        const updatedProfile = {
          ...userData,
          profile: {
            ...userData.profile,
            cvUrl
          }
        };
        await updateProfile(updatedProfile);
      }

      setSuccess('CV uploaded successfully!');
      onUploadSuccess?.(cvUrl);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload CV';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeCv = async () => {
    if (!userData?.profile?.cvUrl) return;

    try {
      setIsUploading(true);
      
      // Update profile to remove CV URL
      const updatedProfile = {
        ...userData,
        profile: {
          ...userData.profile,
          cvUrl: undefined
        }
      };
      
      await updateProfile(updatedProfile);
      setSuccess('CV removed successfully!');
    } catch (error: any) {
      setError('Failed to remove CV');
    } finally {
      setIsUploading(false);
    }
  };

  const currentCv = currentCvUrl || userData?.profile?.cvUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current CV Display */}
      {currentCv && !isUploading && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Current CV
                </p>
                <a
                  href={currentCv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-800 underline"
                >
                  View CV
                </a>
              </div>
            </div>
            <button
              onClick={removeCv}
              className="text-red-600 hover:text-red-800"
              title="Remove CV"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Uploading CV...
              </p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {uploadProgress}% complete
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {currentCv ? 'Upload New CV' : 'Upload your CV/Resume'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports PDF, DOC, DOCX (max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* File Requirements */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Accepted formats: PDF, DOC, DOCX</p>
        <p>• Maximum file size: 5MB</p>
        <p>• Make sure your CV is up-to-date and professional</p>
      </div>
    </div>
  );
}