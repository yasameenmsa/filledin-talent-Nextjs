/**
 * Shared TypeScript type definitions for the application
 * These types align with Mongoose models and API responses
 */


// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'job_seeker' | 'employer' | 'admin';
export type ProfileVisibility = 'public' | 'private' | 'connections';
export type Language = 'en' | 'ar' | 'fr';

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current?: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
  grade?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
}

export interface UserPreferences {
  emailNotifications?: boolean;
  jobAlerts?: boolean;
  profileVisibility?: ProfileVisibility;
  language?: Language;
}

export interface UserProfile {
  name?: string;
  phone?: string;
  location?: string;
  company?: string;
  position?: string;
  profileImage?: string;
  bio?: string;
  website?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  socialLinks?: SocialLinks;
  preferences?: UserPreferences;
}

export interface User extends UserProfile {
  _id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// JOB TYPES
// ============================================================================

export type JobCategory = 'technical' | 'hse' | 'corporate' | 'executive' | 'operations';
export type JobSector = 'oil-gas' | 'renewable' | 'both';
export type WorkingType = 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
export type JobStatus = 'active' | 'closed' | 'draft' | 'pending' | 'rejected';

export interface JobLocation {
  city: string;
  country: string;
  region: string;
}

export interface JobCompany {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
}

export interface JobSalary {
  min?: number;
  max?: number;
  currency: string;
  display: boolean;
  negotiable: boolean;
}

export interface JobRequirements {
  experience: string;
  education: string;
  skills: string[];
  certifications?: string[];
  languages?: string[];
}

export interface JobI18n {
  en?: {
    title?: string;
    description?: string;
    responsibilities?: string[];
    requirements?: JobRequirements;
  };
  ar?: {
    title?: string;
    description?: string;
    responsibilities?: string[];
    requirements?: JobRequirements;
  };
  fr?: {
    title?: string;
    description?: string;
    responsibilities?: string[];
    requirements?: JobRequirements;
  };
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  i18n?: JobI18n;
  imageUrl?: string;
  company: JobCompany;
  category: JobCategory;
  subcategory?: string;
  sector: JobSector;
  location: JobLocation;
  workingType: WorkingType;
  contractDuration?: string;
  salary: JobSalary;
  requirements: JobRequirements;
  benefits?: string[];
  responsibilities: string[];
  applicationDeadline?: Date;
  status: JobStatus;
  rejectionReason?: string;
  postedBy: string;
  viewCount: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// APPLICATION TYPES
// ============================================================================

export type ApplicationStatus = 'pending' | 'interviews' | 'accepted' | 'rejected' | 'offer-accepted' | 'offer-rejected';

export interface StatusHistoryItem {
  status: string;
  date: Date;
  note?: string;
  updatedBy?: string;
}

export interface InterviewDetail {
  date: Date;
  type: 'phone' | 'video' | 'in-person';
  location?: string;
  interviewers?: string[];
  notes?: string;
}

export interface AdditionalDocument {
  name: string;
  url: string;
}

export interface Answer {
  question: string;
  answer: string;
}

export interface Application {
  _id: string;
  job: string | Job;
  applicant: string | User;
  coverLetter?: string;
  cvUrl: string;
  additionalDocuments?: AdditionalDocument[];
  answers?: Answer[];
  status: ApplicationStatus;
  statusHistory: StatusHistoryItem[];
  interviewDetails?: InterviewDetail[];
  rating?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SAVED JOB TYPES
// ============================================================================

export interface SavedJob {
  _id: string;
  userId: string;
  jobId: string;
  job?: Job;
  createdAt: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface JobFormData {
  title: string;
  description: string;
  category: JobCategory;
  sector: JobSector;
  location: JobLocation;
  workingType: WorkingType;
  salary: JobSalary;
  requirements: JobRequirements;
  responsibilities: string[];
  benefits?: string[];
  applicationDeadline?: string;
  status?: JobStatus;
  featured?: boolean;
  urgent?: boolean;
}

export interface ProfileFormData {
  name?: string;
  phone?: string;
  location?: string;
  company?: string;
  position?: string;
  bio?: string;
  website?: string;
  skills?: string[];
}

// ============================================================================
// SEARCH/FILTER TYPES
// ============================================================================

export interface JobFilters {
  keywords?: string;
  location?: string;
  category?: JobCategory;
  workingType?: WorkingType;
  sector?: JobSector;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  jobId?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

export interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface BulkUploadResult {
  successful: string[];
  failed: Array<{ filename: string; error: string }>;
  total: number;
}
