import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firebaseUid?: string; // Make Firebase UID optional
  email: string;
  password: string; // Make password required for MongoDB auth
  role: 'jobseeker' | 'employer' | 'admin';
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    position?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    experience?: {
      company: string;
      position: string;
      duration: string;
      description: string;
    }[];
    education?: {
      institution: string;
      degree: string;
      field: string;
      year: string;
    }[];
    cvUrl?: string;
    profileImage?: string;
  };
  preferences?: {
    jobCategories: string[];
    locations: string[];
    workingTypes: string[];
    salaryExpectation?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  firebaseUid: { type: String, required: false, unique: true, sparse: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true, // Make password required for MongoDB auth
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['jobseeker', 'employer', 'admin'],
    default: 'jobseeker',
  },
  profile: {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phone: String,
    company: String,
    position: String,
    location: String,
    bio: String,
    skills: [String],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String,
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      year: String,
    }],
    cvUrl: String,
    profileImage: String,
  },
  preferences: {
    jobCategories: [String],
    locations: [String],
    workingTypes: [String],
    salaryExpectation: {
      min: Number,
      max: Number,
      currency: String,
    },
  },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);