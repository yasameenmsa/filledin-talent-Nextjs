import mongoose, { Schema, Document } from 'mongoose';

export type RevenueType =
  | 'job_posting'
  | 'featured_job'
  | 'urgent_job'
  | 'company_subscription'
  | 'resume_access'
  | 'advertisement'
  | 'premium_feature'
  | 'other';

export type RevenueStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface IRevenue extends Document {
  type: RevenueType;
  amount: number;
  currency: string;
  description: string;
  status: RevenueStatus;

  // Associated entities
  userId?: mongoose.Types.ObjectId; // User who paid
  jobId?: mongoose.Types.ObjectId; // Associated job posting
  companyId?: mongoose.Types.ObjectId; // Associated company

  // Payment details
  paymentMethod?: string;
  transactionId?: string;
  paymentProvider?: string; // stripe, paypal, etc.

  // Metadata
  metadata?: {
    planType?: string;
    duration?: number; // in days/months
    features?: string[];
    discountCode?: string;
    discountAmount?: number;
  };

  // Tracking
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

const RevenueSchema = new Schema<IRevenue>({
  type: {
    type: String,
    enum: ['job_posting', 'featured_job', 'urgent_job', 'company_subscription', 'resume_access', 'advertisement', 'premium_feature', 'other'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  },

  // Associated entities
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

  // Payment details
  paymentMethod: String,
  transactionId: String,
  paymentProvider: String,

  // Metadata
  metadata: {
    planType: String,
    duration: Number,
    features: [String],
    discountCode: String,
    discountAmount: Number,
  },

  processedAt: Date,
}, {
  timestamps: true,
});

// Indexes for better query performance
RevenueSchema.index({ type: 1, status: 1, createdAt: -1 });
RevenueSchema.index({ userId: 1, createdAt: -1 });
RevenueSchema.index({ jobId: 1 });
RevenueSchema.index({ status: 1, createdAt: -1 });
RevenueSchema.index({ createdAt: -1 });

// Virtual for formatted amount
RevenueSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${(this.amount / 100).toFixed(2)}`;
});

// Pre-save middleware to set processedAt when status changes to completed
RevenueSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.processedAt) {
    this.processedAt = new Date();
  }
  next();
});

export default mongoose.models.Revenue || mongoose.model<IRevenue>('Revenue', RevenueSchema);