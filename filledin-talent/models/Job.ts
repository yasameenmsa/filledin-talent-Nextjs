import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
    description?: string;
  };
  category: 'technical' | 'hse' | 'corporate' | 'executive' | 'operations';
  subcategory?: string;
  sector: 'oil-gas' | 'renewable' | 'both';
  location: {
    city: string;
    country: string;
    region: string;
  };
  workingType: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  contractDuration?: string;
  salary: {
    min?: number;
    max?: number;
    currency: string;
    display: boolean;
    negotiable: boolean;
  };
  requirements: {
    experience: string;
    education: string;
    skills: string[];
    certifications?: string[];
    languages?: string[];
  };
  benefits?: string[];
  responsibilities: string[];
  applicationDeadline?: Date;
  status: 'active' | 'closed' | 'draft';
  postedBy: mongoose.Types.ObjectId;
  viewCount: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  company: {
    name: { type: String, required: true },
    logo: String,
    website: String,
    description: String,
  },
  category: {
    type: String,
    enum: ['technical', 'hse', 'corporate', 'executive', 'operations'],
    required: true,
  },
  subcategory: String,
  sector: {
    type: String,
    enum: ['oil-gas', 'renewable', 'both'],
    required: true,
  },
  location: {
    city: { type: String, required: true },
    country: { type: String, required: true },
    region: { type: String, required: true },
  },
  workingType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'remote', 'hybrid'],
    required: true,
  },
  contractDuration: String,
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    display: { type: Boolean, default: true },
    negotiable: { type: Boolean, default: false },
  },
  requirements: {
    experience: { type: String, required: true },
    education: { type: String, required: true },
    skills: [{ type: String, required: true }],
    certifications: [String],
    languages: [String],
  },
  benefits: [String],
  responsibilities: [{ type: String, required: true }],
  applicationDeadline: Date,
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active',
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  applicationCount: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  urgent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for better search performance
JobSchema.index({ title: 'text', description: 'text' });
JobSchema.index({ 'location.country': 1, 'location.city': 1 });
JobSchema.index({ category: 1, sector: 1 });
JobSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);