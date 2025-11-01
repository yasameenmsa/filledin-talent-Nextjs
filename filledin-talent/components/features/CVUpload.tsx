'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { currentLanguage } = useLanguage();
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

  // Load CV from localStorage when component mounts or user changes
  useEffect(() => {
    if (user?._id) {
      try {
        const storedCV = localStorage.getItem(`cv_${user._id}`);
        if (storedCV) {
          const cvData = JSON.parse(storedCV);
          // Update user context if CV exists in localStorage but not in user object
          if (!user.cv && cvData.fileName) {
            updateProfile({ cv: cvData.fileName });
          }
        }
      } catch (error) {
        console.error('Error loading CV from localStorage:', error);
      }
    }
  }, [user?._id]);

  // Inline translation function
  const getText = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'cv.invalidFileType': {
        en: 'Please upload a PDF, DOC, or DOCX file.',
        ar: 'يرجى تحميل ملف PDF أو DOC أو DOCX.',
        fr: 'Veuillez télécharger un fichier PDF, DOC ou DOCX.'
      },
      'cv.fileTooLarge': {
        en: 'File size must be less than 5MB.',
        ar: 'يجب أن يكون حجم الملف أقل من 5 ميجابايت.',
        fr: 'La taille du fichier doit être inférieure à 5 Mo.'
      },
      'cv.uploadSuccess': {
        en: 'CV uploaded successfully!',
        ar: 'تم تحميل السيرة الذاتية بنجاح!',
        fr: 'CV téléchargé avec succès!'
      },
      'cv.uploadFailed': {
        en: 'Failed to upload CV. Please try again.',
        ar: 'فشل في تحميل السيرة الذاتية. يرجى المحاولة مرة أخرى.',
        fr: 'Échec du téléchargement du CV. Veuillez réessayer.'
      }
    };

    return translations[key]?.[currentLanguage] || translations[key]?.['en'] || key;
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return getText('cv.invalidFileType');
    }
    if (file.size > maxFileSize) {
      return getText('cv.fileTooLarge');
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      // Convert file to base64 for localStorage storage
      const reader = new FileReader();
      
      return new Promise<string>((resolve, reject) => {
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };

        reader.onload = () => {
          try {
            const base64String = reader.result as string;
            const cvData = {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              data: base64String,
              uploadDate: new Date().toISOString(),
              userId: user?._id
            };

            // Store in localStorage
            localStorage.setItem(`cv_${user?._id}`, JSON.stringify(cvData));
            
            // Return a mock URL for the stored CV
            const cvUrl = `local://cv_${user?._id}`;
            resolve(cvUrl);
          } catch (error) {
            reject(new Error('Failed to save CV. Please try again.'));
          }
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file. Please try again.'));
        };

        reader.readAsDataURL(file);
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

      setSuccess(getText('cv.uploadSuccess'));
      onUploadSuccess?.(cvUrl);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : getText('cv.uploadFailed');
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
      
      // Remove from localStorage
      if (user?._id) {
        localStorage.removeItem(`cv_${user._id}`);
      }
      
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
    } catch {
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