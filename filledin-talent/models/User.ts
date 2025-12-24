import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { authConfig } from '@/lib/auth/auth-config';

// User interface with security fields
export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  location?: string;
  company?: string;
  position?: string;
  profileImage?: string;
  bio?: string;
  website?: string;
  skills?: string[];
  experience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
    current?: boolean;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
    grade?: string;
  }>;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    jobAlerts?: boolean;
    profileVisibility?: 'public' | 'private' | 'connections';
    language?: 'en' | 'ar' | 'fr';
  };
  role: 'job_seeker' | 'employer' | 'admin';
  isEmailVerified: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incLoginAttempts(): Promise<IUser>;
  resetLoginAttempts(): Promise<IUser>;
}

// User schema with security enhancements
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  website: {
    type: String,
    trim: true,
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: 50,
  }],
  experience: [{
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: String,
    description: {
      type: String,
      maxlength: 500,
    },
    current: {
      type: Boolean,
      default: false,
    },
  }],
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    field: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    year: {
      type: String,
      required: true,
      match: /^\d{4}$/,
    },
    grade: {
      type: String,
      maxlength: 10,
    },
  }],
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String,
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    jobAlerts: {
      type: Boolean,
      default: true,
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'connections'],
      default: 'public',
    },
    language: {
      type: String,
      enum: ['en', 'ar', 'fr'],
      default: 'en',
    },
  },
  role: {
    type: String,
    enum: ['job_seeker', 'employer', 'admin'],
    default: 'job_seeker',
  },
  isEmailVerified: {
    type: Boolean,
    default: true, // Changed to true by default per user requirement
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12); // Increased to 12 rounds for stronger security
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
UserSchema.methods.isLocked = function (): boolean {
  // Check if lock time has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    return false;
  }

  // Account is locked if lockUntil is set and hasn't expired
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Increment login attempts and lock account if necessary
UserSchema.methods.incLoginAttempts = async function (): Promise<IUser> {
  // If we have a previous lock that has expired, reset attempts
  if (this.lockUntil && this.lockUntil < new Date()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Otherwise, increment attempts
  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock the account if we've reached max attempts
  const maxAttempts = authConfig.lockout.maxAttempts;
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = {
      lockUntil: new Date(Date.now() + authConfig.lockout.lockDuration)
    };
  }

  return await this.updateOne(updates);
};

// Reset login attempts after successful login
UserSchema.methods.resetLoginAttempts = async function (): Promise<IUser> {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Create and export the model
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;