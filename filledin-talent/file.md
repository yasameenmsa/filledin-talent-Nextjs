🚀 Complete Step-by-Step Guide: Building FilledIn Talent Recruitment Website
📋 Table of Contents

Project Setup & Initial Configuration
Database Design & Models
Authentication System
Core Features Development
UI/UX Implementation
API Development
Testing & Optimization
Deployment


Phase 1: Project Setup & Initial Configuration
Step 1.1: Create Next.js Project
bash# Create new Next.js project with TypeScript and Tailwind
npx create-next-app@latest filledin-talent --typescript --tailwind --eslint --app
cd filledin-talent
done  

# Install essential dependencies
npm install mongoose bcryptjs jsonwebtoken firebase react-hook-form zod
npm install @hookform/resolvers lucide-react framer-motion
npm install @types/bcryptjs @types/jsonwebtoken --save-dev

# Install UI components library (shadcn/ui)
npx shadcn-ui@latest init

Step 1.2: Environment Configuration
Create .env.local file:
env# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/filledin-talent
MONGODB_DB=filledin-talent

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000


Step 1.3: Project Structure
filledin-talent/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── employer/
│   │   │   ├── jobs/
│   │   │   ├── candidates/
│   │   │   └── analytics/
│   │   ├── jobseeker/
│   │   │   ├── profile/
│   │   │   ├── applications/
│   │   │   └── saved-jobs/
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── jobs/
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── trends/
│   │   │   ├── hr-trends/
│   │   │   └── industry-trends/
│   │   ├── interview-tips/
│   │   │   └── star-method/
│   │   └── about/
│   ├── api/
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── users/
│   │   └── upload/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   └── features/
├── lib/
│   ├── db/
│   ├── firebase/
│   ├── auth/
│   └── utils/
├── models/
├── hooks/
├── types/
└── public/

Phase 2: Database Design & Models
Step 2.1: MongoDB Connection
typescript// lib/db/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
Step 2.2: User Model
typescript// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'jobseeker' | 'employer' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
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
  role: {
    type: String,
    enum: ['jobseeker', 'employer', 'admin'],
    default: 'jobseeker',
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
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
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
Step 2.3: Job Model
typescript// models/Job.ts
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
Step 2.4: Application Model
typescript// models/Application.ts
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
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn';
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
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn'],
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

Phase 3: Authentication System
Step 3.1: Firebase Configuration
typescript// lib/firebase/config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);
export default app;
Step 3.2: JWT Token Management
typescript// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
  });
}
Step 3.3: Auth Context Provider
typescript// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch additional user data from MongoDB
        const response = await fetch(`/api/users/${firebaseUser.uid}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user data from MongoDB
      const response = await fetch(`/api/users/${userCredential.user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        // Redirect based on user role
        if (data.role === 'employer') {
          router.push('/employer/dashboard');
        } else if (data.role === 'jobseeker') {
          router.push('/jobseeker/dashboard');
        } else if (data.role === 'admin') {
          router.push('/admin/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user data to MongoDB
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: userCredential.user.uid,
          email,
          ...userData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await fetch(`/api/users/${user?.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

Phase 4: Core Features Development
Step 4.1: Job Search & Filtering Component
tsx// components/features/JobSearch.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Briefcase, Clock, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface JobFilters {
  keywords: string;
  location: string;
  category: string;
  workingType: string;
  sector: string;
  salaryMin?: number;
  salaryMax?: number;
}

export default function JobSearch() {
  const [filters, setFilters] = useState<JobFilters>({
    keywords: '',
    location: '',
    category: '',
    workingType: '',
    sector: '',
  });
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const debouncedKeywords = useDebounce(filters.keywords, 500);

  useEffect(() => {
    fetchJobs();
  }, [debouncedKeywords, filters.location, filters.category, filters.workingType, filters.sector]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...(filters.keywords && { keywords: filters.keywords }),
        ...(filters.location && { location: filters.location }),
        ...(filters.category && { category: filters.category }),
        ...(filters.workingType && { workingType: filters.workingType }),
        ...(filters.sector && { sector: filters.sector }),
      });

      const response = await fetch(`/api/jobs?${queryParams}`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Keywords, Job Title"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.keywords}
              onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="">All Locations</option>
              <option value="saudi-arabia">Saudi Arabia</option>
              <option value="uae">UAE</option>
              <option value="qatar">Qatar</option>
              <option value="kuwait">Kuwait</option>
              <option value="oman">Oman</option>
              <option value="bahrain">Bahrain</option>
            </select>
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="hse">HSE</option>
              <option value="corporate">Corporate Functions</option>
              <option value="executive">Executive</option>
              <option value="operations">Operations</option>
            </select>
          </div>

          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={filters.workingType}
              onChange={(e) => setFilters({ ...filters, workingType: e.target.value })}
            >
              <option value="">Working Type</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </button>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filters.sector}
              onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
            >
              <option value="">All Sectors</option>
              <option value="oil-gas">Oil & Gas</option>
              <option value="renewable">Renewable Energy</option>
              <option value="both">Both</option>
            </select>

            <input
              type="number"
              placeholder="Min Salary"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              onChange={(e) => setFilters({ ...filters, salaryMin: Number(e.target.value) })}
            />

            <input
              type="number"
              placeholder="Max Salary"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              onChange={(e) => setFilters({ ...filters, salaryMax: Number(e.target.value) })}
            />
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job: any) => (
            <JobCard key={job._id} job={job} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Job Card Component
function JobCard({ job }: { job: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-gray-600">{job.company.name}</p>
        </div>
        {job.urgent && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
            Urgent
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {job.location.city}, {job.location.country}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="w-4 h-4 mr-2" />
          {job.category} • {job.sector === 'oil-gas' ? 'Oil & Gas' : job.sector === 'renewable' ? 'Renewable' : 'Both'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {job.workingType}
        </div>
      </div>

      {job.salary.display && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900">
            ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()} {job.salary.currency}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </span>
        <a
          href={`/jobs/${job._id}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View Details →
        </a>
      </div>
    </div>
  );
}
Step 4.2: CV Upload Component with Firebase Storage
tsx// components/features/CVUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';

interface CVUploadProps {
  onUploadComplete?: (url: string) => void;
  maxSizeMB?: number;
}

export default function CVUpload({ onUploadComplete, maxSizeMB = 5 }: CVUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!acceptedFileTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      // Create a unique file name
      const timestamp = Date.now();
      const fileName = `cvs/${user.uid}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Start the upload
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user.uid,
          originalName: file.name,
        }
      });

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Failed to upload file. Please try again.');
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedUrl(downloadURL);
          
          // Save CV URL to user profile in database
          await saveCV ToProfile(downloadURL);
          
          if (onUploadComplete) {
            onUploadComplete(downloadURL);
          }
          
          setUploading(false);
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
      setUploading(false);
    }
  };

  const saveCVToProfile = async (cvUrl: string) => {
    try {
      const response = await fetch(`/api/users/${user?.uid}/cv`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to save CV to profile');
      }
    } catch (error) {
      console.error('Error saving CV to profile:', error);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadedUrl(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!uploadedUrl ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="cv-upload"
          />
          
          {!file ? (
            <label
              htmlFor="cv-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Drop your CV here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                PDF or Word (Max {maxSizeMB}MB)
              </p>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <File className="w-8 h-8 text-blue-500" />
                <span className="text-gray-700">{file.name}</span>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploading ? (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{uploadProgress}% uploaded</p>
                </div>
              ) : (
                <button
                  onClick={handleUpload}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload CV
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-green-700">CV uploaded successfully!</span>
          </div>
          <button
            onClick={handleRemoveFile}
            className="text-gray-500 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
Step 4.3: Job Application Form
tsx// components/features/JobApplicationForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CVUpload from './CVUpload';

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export default function JobApplicationForm({ 
  jobId, 
  jobTitle, 
  companyName 
}: JobApplicationFormProps) {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    coverLetter: '',
    cvUrl: userData?.profile?.cvUrl || '',
    answers: [] as { question: string; answer: string }[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!formData.cvUrl) {
      setError('Please upload your CV');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          applicantId: user.uid,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit application');
      }

      // Redirect to success page
      router.push(`/applications/success?job=${jobTitle}`);
    } catch (error: any) {
      console.error('Application submission error:', error);
      setError(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Applying for: {jobTitle}</h3>
        <p className="text-gray-600">at {companyName}</p>
      </div>

      {/* CV Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your CV *
        </label>
        {userData?.profile?.cvUrl ? (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Using CV from your profile. Upload a new one to replace it.
              </p>
            </div>
            <CVUpload
              onUploadComplete={(url) => setFormData({ ...formData, cvUrl: url })}
            />
          </div>
        ) : (
          <CVUpload
            onUploadComplete={(url) => setFormData({ ...formData, cvUrl: url })}
          />
        )}
      </div>

      {/* Cover Letter */}
      <div>
        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
          Cover Letter (Optional)
        </label>
        <textarea
          id="coverLetter"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell us why you're interested in this position..."
          value={formData.coverLetter}
          onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !formData.cvUrl}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
}

Phase 5: UI/UX Implementation
Step 5.1: Homepage Hero Section
tsx// app/page.tsx
import HeroSection from '@/components/sections/HeroSection';
import FeaturedJobs from '@/components/sections/FeaturedJobs';
import TrendsSection from '@/components/sections/TrendsSection';
import StatsSection from '@/components/sections/StatsSection';
import CTASection from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturedJobs />
      <TrendsSection />
      <CTASection />
    </>
  );
}

// components/sections/HeroSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import JobSearch from '@/components/features/JobSearch';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The Alternative Solution
          </h1>
          <h2 className="text-2xl md:text-3xl mb-4">
            Global Energy Talent Partner
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Connecting expertise from the reservoir to the refinery 
            or from the source to the grid
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <JobSearch />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          <button className="px-8 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            For Businesses
          </button>
          <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-colors">
            For Job Seekers
          </button>
        </motion.div>
      </div>
    </section>
  );
}
Step 5.2: Responsive Navigation Header
tsx// components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, userData, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    {
      name: 'For Businesses',
      href: '/businesses',
      dropdown: [
        { name: 'Hire Talent', href: '/businesses/hire' },
        { name: 'Our Expertise', href: '/businesses/expertise' },
        { name: 'Our Commitment', href: '/businesses/commitment' },
      ],
    },
    {
      name: 'For Job Seekers',
      href: '/job-seekers',
      dropdown: [
        { name: 'Job Search', href: '/jobs' },
        { name: 'Interview Tips', href: '/interview-tips' },
        { name: 'STAR Method', href: '/interview-tips/star-method' },
        { name: 'Drop CV', href: '/drop-cv' },
      ],
    },
    {
      name: 'Trends',
      href: '/trends',
      dropdown: [
        { name: 'HR Trends', href: '/trends/hr' },
        { name: 'Industry Trends', href: '/trends/industry' },
        { name: 'AI & Recruitment', href: '/trends/ai-recruitment' },
      ],
    },
    {
      name: 'About FINT',
      href: '/about',
    },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className={`text-2xl font-bold ${scrolled ? 'text-blue-900' : 'text-white'}`}>
              FilledIn Talent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === item.name ? null : item.name)}
                      className={`flex items-center space-x-1 ${
                        scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
                      } transition-colors`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {dropdownOpen === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2"
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => setDropdownOpen(null)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`${
                      scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
                    } transition-colors`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === 'user' ? null : 'user')}
                  className={`flex items-center space-x-2 ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>{userData?.profile?.firstName}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2"
                    >
                      <Link
                        href={`/${userData?.role}/dashboard`}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`${
                    scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
                  } transition-colors`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    scrolled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-blue-900 hover:bg-gray-100'
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden ${scrolled ? 'text-gray-700' : 'text-white'}`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity



🚀 Complete FilledIn Talent Website - Full Implementation
Phase 6: Multi-Language Support Implementation
Step 6.1: Language Configuration
typescript// lib/i18n/config.ts
export const languages = ['en', 'ar', 'fr'] as const;
export type Language = typeof languages[number];

export const defaultLanguage: Language = 'en';

export const languageNames: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français'
};

export const rtlLanguages: Language[] = ['ar'];
Step 6.2: Translation Files Structure
typescript// lib/i18n/translations/en.ts
export const en = {
  common: {
    filledinTalent: 'FilledIn Talent',
    tagline: 'The Alternative Solution',
    globalPartner: 'Global Energy Talent Partner',
    search: 'Search',
    apply: 'Apply',
    submit: 'Submit',
    cancel: 'Cancel',
    viewMore: 'View More',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success'
  },
  nav: {
    businesses: 'Businesses',
    trends: 'Trends',
    expertise: 'Expertise',
    engagement: 'Engagement',
    jobSeekers: 'Job seekers',
    jobSearch: 'Job Search',
    interviewTips: 'Interview tips',
    dropCV: 'Drop CV',
    aboutFINT: 'About FINT',
    languages: 'Languages'
  },
  hero: {
    title: 'The Alternative Solution',
    subtitle: 'Global Energy Talent Partner',
    description: 'Connecting expertise from the reservoir to the refinery or from the source to the grid',
    forBusinesses: 'For Businesses',
    forJobSeekers: 'For Job Seekers',
    searchPlaceholder: 'Keywords, Job title',
    categoryPlaceholder: 'Category',
    workingTypePlaceholder: 'Working type',
    locationPlaceholder: 'Location'
  },
  businesses: {
    title: 'For businesses',
    subtitle: 'Hire your future talent today',
    ourExpertise: 'Our expertise to your service',
    commitment: 'FilledIn Talent is committed to you and to provide you with future-Ready recruitment for the Energy Workforce of tomorrow',
    deepSourcing: 'Deeply Specialized Sourcing, Not Just Searching',
    precisionRecruitment: 'Precision Recruitment for Energy Experts',
    dataDrivern: 'Data-Driven Recruitment. Guaranteed Results',
    noFeeGuarantee: 'No Second Interview, No Fee',
    globalSourcing: 'Global Sourcing',
    keyMetrics: 'Key Recruitment Metrics',
    readyToHire: 'Ready to Hire with Confidence?',
    contactToday: 'Contact Us Today'
  },
  jobSeekers: {
    title: 'For Job Seekers',
    readyForNext: 'Ready for your next career move?',
    interviewTips: 'Our best tips for smashing your next interview!',
    howToSucceed: 'How to succeed at interviews?',
    starMethod: 'THE STAR METHOD',
    knowCompany: 'Know the Company',
    reflectRole: 'Reflect on the Role',
    prepareStories: 'Prepare your "Stories"',
    masterTechniques: 'Master Proven Techniques'
  },
  trends: {
    industryTrends: 'Industry Trends',
    hrTrends: 'HR Trends',
    aiRecruitment: 'AI & Talent Acquisition',
    oilGas: 'Oil & Gas',
    renewable: 'Renewable energy',
    leverageKnowledge: 'Leverage your own knowledge with FilledIn Global trends',
    emergingSolutions: 'Emerging solutions, such as generative AI, have the potential to transform HR operations'
  },
  expertise: {
    technical: 'Technical',
    hse: 'HSE',
    corporateFunctions: 'Corporate functions',
    executiveSearch: 'Executive Search',
    operations: 'Operations',
    generalManager: 'General Manager',
    electricalEngineer: 'Electrical engineer',
    petroleumEngineer: 'Petroleum Engineer',
    projectManager: 'Project Manager',
    mechanicalEngineer: 'Mechanical engineer',
    icEngineer: 'I&C engineer',
    finance: 'Finance',
    cfo: 'CFO',
    operationManager: 'Operation Manager',
    humanResources: 'Human Resources',
    marketing: 'Marketing',
    managingDirector: 'Managing Director'
  },
  footer: {
    followUs: 'Follow us',
    getInTouch: 'Get In Touch',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    youtube: 'Youtube'
  }
};
Step 6.3: Arabic Translations
typescript// lib/i18n/translations/ar.ts
export const ar = {
  common: {
    filledinTalent: 'FilledIn Talent',
    tagline: 'الحل البديل',
    globalPartner: 'شريك المواهب العالمي للطاقة',
    search: 'بحث',
    apply: 'تقديم',
    submit: 'إرسال',
    cancel: 'إلغاء',
    viewMore: 'عرض المزيد',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح'
  },
  nav: {
    businesses: 'للشركات',
    trends: 'الاتجاهات',
    expertise: 'خبرتنا',
    engagement: 'المشاركة',
    jobSeekers: 'الباحثون عن عمل',
    jobSearch: 'البحث عن وظيفة',
    interviewTips: 'نصائح المقابلة',
    dropCV: 'إرسال السيرة الذاتية',
    aboutFINT: 'حول FINT',
    languages: 'اللغات'
  },
  hero: {
    title: 'الحل البديل',
    subtitle: 'شريك المواهب العالمي للطاقة',
    description: 'ربط الخبرات من الخزان إلى المصفاة أو من المصدر إلى الشبكة',
    forBusinesses: 'للشركات',
    forJobSeekers: 'للباحثين عن عمل',
    searchPlaceholder: 'كلمات مفتاحية، المسمى الوظيفي',
    categoryPlaceholder: 'الفئة',
    workingTypePlaceholder: 'نوع العمل',
    locationPlaceholder: 'الموقع'
  },
  businesses: {
    title: 'للشركات',
    subtitle: 'وظف مواهب المستقبل اليوم',
    ourExpertise: 'خبرتنا في خدمتك',
    commitment: 'FilledIn Talent ملتزمة بتقديم التوظيف الجاهز للمستقبل لقوة العمل في قطاع الطاقة',
    deepSourcing: 'البحث المتخصص العميق، وليس مجرد البحث',
    precisionRecruitment: 'التوظيف الدقيق لخبراء الطاقة',
    dataDrivern: 'التوظيف القائم على البيانات. نتائج مضمونة',
    noFeeGuarantee: 'لا رسوم بدون مقابلة ثانية',
    globalSourcing: 'البحث العالمي',
    keyMetrics: 'مؤشرات التوظيف الرئيسية',
    readyToHire: 'مستعد للتوظيف بثقة؟',
    contactToday: 'اتصل بنا اليوم'
  },
  jobSeekers: {
    title: 'للباحثين عن عمل',
    readyForNext: 'مستعد لخطوتك المهنية التالية؟',
    interviewTips: 'أفضل نصائحنا لتتميز في مقابلتك القادمة!',
    howToSucceed: 'كيف تنجح في المقابلات؟',
    starMethod: 'طريقة STAR',
    knowCompany: 'اعرف الشركة',
    reflectRole: 'فكر في الدور',
    prepareStories: 'حضر "قصصك"',
    masterTechniques: 'أتقن التقنيات المثبتة'
  },
  trends: {
    industryTrends: 'اتجاهات الصناعة',
    hrTrends: 'اتجاهات الموارد البشرية',
    aiRecruitment: 'الذكاء الاصطناعي والتوظيف',
    oilGas: 'النفط والغاز',
    renewable: 'الطاقة المتجددة',
    leverageKnowledge: 'استفد من معرفتك مع اتجاهات FilledIn العالمية',
    emergingSolutions: 'الحلول الناشئة مثل الذكاء الاصطناعي التوليدي لديها القدرة على تحويل عمليات الموارد البشرية'
  },
  expertise: {
    technical: 'تقني',
    hse: 'الصحة والسلامة والبيئة',
    corporateFunctions: 'الوظائف المؤسسية',
    executiveSearch: 'البحث التنفيذي',
    operations: 'العمليات',
    generalManager: 'المدير العام',
    electricalEngineer: 'مهندس كهربائي',
    petroleumEngineer: 'مهندس بترول',
    projectManager: 'مدير مشروع',
    mechanicalEngineer: 'مهندس ميكانيكي',
    icEngineer: 'مهندس أجهزة وتحكم',
    finance: 'المالية',
    cfo: 'المدير المالي',
    operationManager: 'مدير العمليات',
    humanResources: 'الموارد البشرية',
    marketing: 'التسويق',
    managingDirector: 'المدير الإداري'
  },
  footer: {
    followUs: 'تابعنا',
    getInTouch: 'تواصل معنا',
    instagram: 'انستغرام',
    linkedin: 'لينكد إن',
    youtube: 'يوتيوب'
  }
};
Step 6.4: French Translations
typescript// lib/i18n/translations/fr.ts
export const fr = {
  common: {
    filledinTalent: 'FilledIn Talent',
    tagline: 'La Solution Alternative',
    globalPartner: 'Partenaire Mondial des Talents Énergétiques',
    search: 'Rechercher',
    apply: 'Postuler',
    submit: 'Soumettre',
    cancel: 'Annuler',
    viewMore: 'Voir plus',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès'
  },
  nav: {
    businesses: 'Entreprises',
    trends: 'Tendances',
    expertise: 'Expertise',
    engagement: 'Engagement',
    jobSeekers: 'Chercheurs d\'emploi',
    jobSearch: 'Recherche d\'emploi',
    interviewTips: 'Conseils d\'entretien',
    dropCV: 'Déposer CV',
    aboutFINT: 'À propos de FINT',
    languages: 'Langues'
  },
  hero: {
    title: 'La Solution Alternative',
    subtitle: 'Partenaire Mondial des Talents Énergétiques',
    description: 'Connecter l\'expertise du réservoir à la raffinerie ou de la source au réseau',
    forBusinesses: 'Pour les Entreprises',
    forJobSeekers: 'Pour les Chercheurs d\'Emploi',
    searchPlaceholder: 'Mots-clés, Titre du poste',
    categoryPlaceholder: 'Catégorie',
    workingTypePlaceholder: 'Type de travail',
    locationPlaceholder: 'Lieu'
  },
  businesses: {
    title: 'Pour les entreprises',
    subtitle: 'Recrutez vos futurs talents aujourd\'hui',
    ourExpertise: 'Notre expertise à votre service',
    commitment: 'FilledIn Talent s\'engage à vous fournir un recrutement prêt pour l\'avenir pour la main-d\'œuvre énergétique de demain',
    deepSourcing: 'Recherche Spécialisée Approfondie, Pas Seulement une Recherche',
    precisionRecruitment: 'Recrutement de Précision pour les Experts en Énergie',
    dataDrivern: 'Recrutement Basé sur les Données. Résultats Garantis',
    noFeeGuarantee: 'Pas de Deuxième Entretien, Pas de Frais',
    globalSourcing: 'Recherche Mondiale',
    keyMetrics: 'Indicateurs Clés de Recrutement',
    readyToHire: 'Prêt à Recruter avec Confiance?',
    contactToday: 'Contactez-nous Aujourd\'hui'
  },
  jobSeekers: {
    title: 'Pour les Chercheurs d\'Emploi',
    readyForNext: 'Prêt pour votre prochaine évolution de carrière?',
    interviewTips: 'Nos meilleurs conseils pour réussir votre prochain entretien!',
    howToSucceed: 'Comment réussir aux entretiens?',
    starMethod: 'LA MÉTHODE STAR',
    knowCompany: 'Connaître l\'Entreprise',
    reflectRole: 'Réfléchir au Rôle',
    prepareStories: 'Préparez vos "Histoires"',
    masterTechniques: 'Maîtriser les Techniques Éprouvées'
  },
  trends: {
    industryTrends: 'Tendances de l\'Industrie',
    hrTrends: 'Tendances RH',
    aiRecruitment: 'IA & Acquisition de Talents',
    oilGas: 'Pétrole et Gaz',
    renewable: 'Énergie renouvelable',
    leverageKnowledge: 'Tirez parti de vos connaissances avec les tendances mondiales FilledIn',
    emergingSolutions: 'Les solutions émergentes comme l\'IA générative ont le potentiel de transformer les opérations RH'
  },
  expertise: {
    technical: 'Technique',
    hse: 'HSE',
    corporateFunctions: 'Fonctions d\'entreprise',
    executiveSearch: 'Recherche de cadres',
    operations: 'Opérations',
    generalManager: 'Directeur général',
    electricalEngineer: 'Ingénieur électricien',
    petroleumEngineer: 'Ingénieur pétrolier',
    projectManager: 'Chef de projet',
    mechanicalEngineer: 'Ingénieur mécanicien',
    icEngineer: 'Ingénieur I&C',
    finance: 'Finance',
    cfo: 'Directeur financier',
    operationManager: 'Directeur des opérations',
    humanResources: 'Ressources humaines',
    marketing: 'Marketing',
    managingDirector: 'Directeur général'
  },
  footer: {
    followUs: 'Suivez-nous',
    getInTouch: 'Contactez-nous',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    youtube: 'Youtube'
  }
};
Phase 7: Updated Header Component with Language Switcher
Step 7.1: Enhanced Header with Multi-language Support
typescript// components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, User, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, logout } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    {
      name: t('nav.businesses'),
      href: '/businesses',
      dropdown: [
        { name: t('nav.trends'), href: '/trends' },
        { name: t('nav.expertise'), href: '/businesses/expertise' },
        { name: t('nav.engagement'), href: '/businesses/engagement' },
      ],
    },
    {
      name: t('nav.jobSeekers'),
      href: '/job-seekers',
      dropdown: [
        { name: t('nav.jobSearch'), href: '/jobs' },
        { name: t('nav.interviewTips'), href: '/interview-tips' },
        { name: t('nav.dropCV'), href: '/drop-cv' },
      ],
    },
    {
      name: t('nav.aboutFINT'),
      href: '/about',
    },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Anchor Icon */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-12 h-12">
              <svg
                viewBox="0 0 100 100"
                className={`w-full h-full ${scrolled ? 'text-blue-900' : 'text-white'}`}
                fill="currentColor"
              >
                {/* Anchor Icon */}
                <path d="M50 10 C50 10, 50 30, 50 30 M35 25 L65 25 M50 30 C30 30, 20 45, 20 60 C20 75, 30 90, 50 90 C70 90, 80 75, 80 60 C80 45, 70 30, 50 30 M40 60 C40 55, 45 50, 50 50 C55 50, 60 55, 60 60" />
              </svg>
            </div>
            <div>
              <span className={`text-2xl font-bold ${scrolled ? 'text-blue-900' : 'text-white'}`}>
                {t('common.filledinTalent')}
              </span>
              <span className={`block text-sm ${scrolled ? 'text-gray-600' : 'text-white/80'}`}>
                {t('common.tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === item.name ? null : item.name)}
                      className={`flex items-center space-x-1 ${
                        scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
                      } transition-colors`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {dropdownOpen === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-2`}
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => setDropdownOpen(null)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`${
                      scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
                    } transition-colors`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === 'language' ? null : 'language')}
                className={`flex items-center space-x-2 ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span>{t('nav.languages')}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {dropdownOpen === 'language' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-xl py-2`}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setDropdownOpen(null);
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center space-x-3 hover:bg-blue-50 ${
                          language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === 'user' ? null : 'user')}
                  className={`flex items-center space-x-2 ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>{userData?.profile?.firstName}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-xl py-2`}
                    >
                      <Link
                        href={`/${userData?.role}/dashboard`}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`${
                    scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200'
                  } transition-colors`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    scrolled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-blue-900 hover:bg-gray-100'
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden ${scrolled ? 'text-gray-700' : 'text-white'}`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white rounded-lg shadow-lg mt-2 p-4"
            >
              {navigation.map((item) => (
                <div key={item.name} className="py-2">
                  <Link
                    href={item.href}
                    className="block text-gray-700 hover:text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block text-gray-600 hover:text-blue-600 text-sm"
                          onClick={() => setIsOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Language Switcher Mobile */}
              <div className="border-t pt-4 mt-4">
                <p className="text-gray-700 font-medium mb-2">{t('nav.languages')}</p>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded flex items-center space-x-3 ${
                        language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>              