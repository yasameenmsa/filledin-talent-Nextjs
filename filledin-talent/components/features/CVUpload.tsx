'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, X, Check, AlertCircle, Loader2, Trash2, Archive, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CV {
  _id: string;
  name: string;
  originalName: string;
  fileUrl: string;
  isArchived: boolean;
  createdAt: string;
}

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
  const [cvList, setCvList] = useState<CV[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; cvId: string | null }>({
    isOpen: false,
    cvId: null,
  });

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  // Load CVs when component mounts
  useEffect(() => {
    if (user?._id) {
      fetchCVs();
    }
  }, [user?._id]);

  const fetchCVs = async () => {
    try {
      setIsLoadingList(true);
      const response = await fetch('/api/cv');
      if (response.ok) {
        const data = await response.json();
        setCvList(data.cvs || []);
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setIsLoadingList(false);
    }
  };

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

  // Dialog translations
  const getDialogText = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'dialog.deleteTitle': {
        en: 'Delete CV',
        ar: 'حذف السيرة الذاتية',
        fr: 'Supprimer le CV'
      },
      'dialog.deleteDescription': {
        en: 'Are you sure you want to delete this CV? This action cannot be undone.',
        ar: 'هل أنت متأكد أنك تريد حذف هذه السيرة الذاتية؟ لا يمكن التراجع عن هذا الإجراء.',
        fr: 'Êtes-vous sûr de vouloir supprimer ce CV ? Cette action est irréversible.'
      },
      'dialog.cancel': {
        en: 'Cancel',
        ar: 'إلغاء',
        fr: 'Annuler'
      },
      'dialog.delete': {
        en: 'Delete',
        ar: 'حذف',
        fr: 'Supprimer'
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', userData?.name || 'Unknown User');
      formData.append('email', user?.email || 'unknown@example.com');
      formData.append('language', currentLanguage);

      // Simulate progress since fetch doesn't support it natively
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/drop-cv', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || getText('cv.uploadFailed'));
      }

      // Refresh list after upload
      fetchCVs();

      return data.data.fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
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

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmation({ isOpen: true, cvId: id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirmation.cvId;
    if (!id) return;

    try {
      const response = await fetch(`/api/cv?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // If we deleted the active CV, update profile context
        const deletedCv = cvList.find(c => c._id === id);
        if (deletedCv?.fileUrl === userData?.profile?.cvUrl) {
          // Refresh user data to clear CV URL
          window.location.reload();
        }
        fetchCVs();
        setSuccess('CV deleted successfully');
      } else {
        setError('Failed to delete CV');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      setError('Failed to delete CV');
    } finally {
      setDeleteConfirmation({ isOpen: false, cvId: null });
    }
  };

  const toggleArchive = async (id: string, isArchived: boolean) => {
    try {
      const response = await fetch('/api/cv', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isArchived }),
      });

      if (response.ok) {
        // If we archived the active CV, update profile context
        const archivedCv = cvList.find(c => c._id === id);
        if (isArchived && archivedCv?.fileUrl === userData?.profile?.cvUrl) {
          // Refresh user data to clear CV URL
          window.location.reload();
        }
        fetchCVs();
        setSuccess(isArchived ? 'CV archived successfully' : 'CV restored successfully');
      } else {
        setError('Failed to update CV status');
      }
    } catch (error) {
      console.error('Error updating CV:', error);
      setError('Failed to update CV status');
    }
  };

  // Filter lists
  const activeCVs = cvList.filter(cv => !cv.isArchived);
  const archivedCVs = cvList.filter(cv => cv.isArchived);

  // Use the most recent active CV if available, otherwise fallback to profile URL
  const activeCv = activeCVs.length > 0 ? activeCVs[0] : null;
  const hasActiveCv = !!activeCv || !!userData?.profile?.cvUrl;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area - Only show if no active CV */}
      {!hasActiveCv && (
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
                  Upload your CV/Resume
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
      )}

      {/* Active CV Display */}
      {hasActiveCv && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Active CV</h3>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <File className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {activeCv?.originalName || 'Current CV'}
                  </p>
                  <div className="flex space-x-3 mt-1">
                    <a
                      href={activeCv?.fileUrl || userData?.profile?.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                      View
                    </a>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500">
                      Uploaded: {activeCv ? new Date(activeCv.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {activeCv && (
                  <button
                    onClick={() => toggleArchive(activeCv._id, true)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Archive CV"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => activeCv ? handleDeleteClick(activeCv._id) : null}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete CV"
                  disabled={!activeCv}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archived CVs List */}
      {archivedCVs.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Archived CVs</h3>
          <div className="space-y-2">
            {archivedCVs.map((cv) => (
              <div key={cv._id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <File className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">{cv.originalName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(cv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleArchive(cv._id, false)}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Restore to Active"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(cv._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => !open && setDeleteConfirmation({ isOpen: false, cvId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogText('dialog.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {getDialogText('dialog.deleteDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmation({ isOpen: false, cvId: null })}>
              {getDialogText('dialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {getDialogText('dialog.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}