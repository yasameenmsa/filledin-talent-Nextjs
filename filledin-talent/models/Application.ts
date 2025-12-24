import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  coverLetter?: string;
  cvUrl: string;
  additionalDocuments?: {
    name: string;
    url: string;
  }[];
  answers?: {
    question: string;
    answer: string;
  }[];
  status: 'pending' | 'interviews' | 'accepted' | 'rejected';
  statusHistory: {
    status: string;
    date: Date;
    note?: string;
    updatedBy?: mongoose.Types.ObjectId;
  }[];
  interviewDetails?: {
    date: Date;
    type: 'phone' | 'video' | 'in-person';
    location?: string;
    interviewers?: string[];
    notes?: string;
  }[];
  rating?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  applicant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverLetter: String,
  cvUrl: {
    type: String,
    required: true,
  },
  additionalDocuments: [{
    name: String,
    url: String,
  }],
  answers: [{
    question: String,
    answer: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'interviews', 'accepted', 'rejected'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    date: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  interviewDetails: [{
    date: Date,
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person'],
    },
    location: String,
    interviewers: [String],
    notes: String,
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  notes: String,
}, {
  timestamps: true,
});

// Compound index to prevent duplicate applications
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);