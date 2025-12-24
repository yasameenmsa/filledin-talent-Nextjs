import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  filename: string;
  originalName: string;
  url: string;
  filePath: string;
  size: number;
  mimeType: string;
  fileType: 'cv' | 'job-image' | 'company-logo' | 'profile-image' | 'document' | 'certificate';
  uploadedBy: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Associated user
  jobId?: mongoose.Types.ObjectId; // Associated job
  companyId?: mongoose.Types.ObjectId; // Associated company
  isPublic: boolean;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // For videos if added later
    pages?: number; // For PDFs
  };
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['cv', 'job-image', 'company-logo', 'profile-image', 'document', 'certificate'],
    required: true,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number,
    pages: Number,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
FileSchema.index({ uploadedBy: 1, createdAt: -1 });
FileSchema.index({ userId: 1, fileType: 1 });
FileSchema.index({ jobId: 1, fileType: 1 });
FileSchema.index({ fileType: 1, createdAt: -1 });

export default mongoose.models.File || mongoose.model<IFile>('File', FileSchema);

