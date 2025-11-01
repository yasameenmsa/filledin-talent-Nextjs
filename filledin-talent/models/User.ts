import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Simple User interface for basic authentication
export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: 'job_seeker' | 'employer' | 'admin';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Simple User schema
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
    minlength: 6,
  },
  name: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['job_seeker', 'employer', 'admin'],
    default: 'job_seeker',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
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

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;