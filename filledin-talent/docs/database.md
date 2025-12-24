# Database Documentation

## Overview

This Next.js application uses **MongoDB** as its primary database with **Mongoose** as the ODM (Object Document Mapper). The database is designed to support a job portal platform with user authentication, job postings, and application management.

## Database Configuration

### Connection Setup

**File**: `lib/db/mongodb.ts`

The application uses a connection pooling strategy to optimize database performance:

```typescript
// Connection caching for optimal performance
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
```

**Key Features**:
- Connection caching to prevent multiple connections
- Global connection reuse across serverless functions
- Error handling with connection retry logic
- Buffer commands disabled for better performance

**Environment Variables**:
- `MONGODB_URI`: MongoDB connection string (required)

### Authentication Integration

**File**: `auth.ts`

The database integrates with NextAuth.js for authentication:
- JWT strategy for session management
- Credentials provider for email/password authentication
- User validation against MongoDB User collection
- Password comparison using bcrypt

## Data Models

### 1. User Model

**File**: `models/User.ts`

**Purpose**: Manages user accounts for job seekers, employers, and administrators.

#### Schema Structure

```typescript
interface IUser {
  email: string;              // Unique, lowercase, trimmed
  password: string;           // Hashed with bcrypt (min 6 chars)
  name?: string;              // Optional display name
  role: 'job_seeker' | 'employer' | 'admin';
  isEmailVerified: boolean;   // Email verification status
  createdAt: Date;           // Auto-generated
  updatedAt: Date;           // Auto-generated
}
```

#### Key Features

- **Password Security**: Automatic bcrypt hashing with salt rounds (10)
- **Email Validation**: Lowercase conversion and trimming
- **Role-Based Access**: Three distinct user roles
- **Timestamps**: Automatic creation and update tracking

#### Methods

- `comparePassword(candidatePassword: string)`: Validates password against hash

#### Indexes

- Unique index on `email` field
- Automatic `_id` index

### 2. Job Model

**File**: `models/Job.ts`

**Purpose**: Stores job postings with comprehensive details for the energy sector.

#### Schema Structure

```typescript
interface IJob {
  title: string;                    // Job title
  description: string;              // Detailed job description
  company: {                        // Company information
    name: string;
    logo?: string;
    website?: string;
    description?: string;
  };
  category: 'technical' | 'hse' | 'corporate' | 'executive' | 'operations';
  subcategory?: string;             // Optional subcategory
  sector: 'oil-gas' | 'renewable' | 'both';
  location: {                       // Job location
    city: string;
    country: string;
    region: string;
  };
  workingType: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  contractDuration?: string;        // For contract positions
  salary: {                         // Salary information
    min?: number;
    max?: number;
    currency: string;               // Default: 'USD'
    display: boolean;               // Show salary publicly
    negotiable: boolean;            // Salary negotiable flag
  };
  requirements: {                   // Job requirements
    experience: string;
    education: string;
    skills: string[];
    certifications?: string[];
    languages?: string[];
  };
  benefits?: string[];              // Job benefits
  responsibilities: string[];       // Job responsibilities
  applicationDeadline?: Date;       // Application deadline
  status: 'active' | 'closed' | 'draft';
  postedBy: ObjectId;              // Reference to User (employer)
  viewCount: number;               // Job view counter
  applicationCount: number;        // Application counter
  featured: boolean;               // Featured job flag
  urgent: boolean;                 // Urgent hiring flag
  createdAt: Date;                 // Auto-generated
  updatedAt: Date;                 // Auto-generated
}
```

#### Key Features

- **Energy Sector Focus**: Specialized categories (technical, HSE, corporate, etc.)
- **Flexible Location**: City, country, and region tracking
- **Comprehensive Requirements**: Skills, certifications, languages
- **Salary Management**: Range, currency, visibility controls
- **Status Tracking**: Draft, active, closed states
- **Analytics**: View and application counters

#### Indexes

- **Text Search**: `title` and `description` fields
- **Location**: Compound index on `location.country` and `location.city`
- **Category**: Compound index on `category` and `sector`
- **Status**: Compound index on `status` and `createdAt` (descending)

### 3. Application Model

**File**: `models/Application.ts`

**Purpose**: Manages job applications and tracks the hiring process.

#### Schema Structure

```typescript
interface IApplication {
  job: ObjectId;                    // Reference to Job
  applicant: ObjectId;              // Reference to User (job seeker)
  coverLetter?: string;             // Optional cover letter
  cvUrl: string;                    // Required CV file URL
  additionalDocuments?: {           // Optional additional documents
    name: string;
    url: string;
  }[];
  answers?: {                       // Custom application questions
    question: string;
    answer: string;
  }[];
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn';
  statusHistory: {                  // Application status tracking
    status: string;
    date: Date;
    note?: string;
    updatedBy?: ObjectId;           // Reference to User (who updated)
  }[];
  interviewDetails?: {              // Interview management
    date: Date;
    type: 'phone' | 'video' | 'in-person';
    location?: string;
    interviewers?: string[];
    notes?: string;
  }[];
  rating?: number;                  // Applicant rating (1-5)
  notes?: string;                   // Internal notes
  createdAt: Date;                  // Auto-generated
  updatedAt: Date;                  // Auto-generated
}
```

#### Key Features

- **Application Tracking**: Complete status workflow from pending to hired/rejected
- **Document Management**: CV and additional document storage
- **Interview Scheduling**: Multiple interview rounds support
- **Custom Questions**: Flexible application questionnaire
- **Audit Trail**: Complete status history with timestamps
- **Rating System**: 1-5 star applicant rating

#### Indexes

- **Unique Constraint**: Compound unique index on `job` and `applicant` (prevents duplicate applications)

## Data Relationships

### Entity Relationship Diagram

```
User (1) ----< Job (Many)
  |              |
  |              |
  |              v
  +----------> Application (Many)
```

### Relationship Details

1. **User → Job** (One-to-Many)
   - One employer can post multiple jobs
   - Field: `Job.postedBy` references `User._id`
   - Constraint: Only users with role 'employer' can post jobs

2. **User → Application** (One-to-Many)
   - One job seeker can submit multiple applications
   - Field: `Application.applicant` references `User._id`
   - Constraint: Only users with role 'job_seeker' can apply

3. **Job → Application** (One-to-Many)
   - One job can receive multiple applications
   - Field: `Application.job` references `Job._id`
   - Constraint: Unique application per user per job

4. **User → Application.statusHistory** (One-to-Many)
   - Status updates can be tracked by user
   - Field: `Application.statusHistory.updatedBy` references `User._id`
   - Used for audit trail of who changed application status

## Database Operations

### Common Queries

#### User Operations
```typescript
// Find user by email
const user = await User.findOne({ email: email.toLowerCase() });

// Create new user
const newUser = new User({ email, password, name, role });
await newUser.save(); // Password automatically hashed

// Verify password
const isValid = await user.comparePassword(password);
```

#### Job Operations
```typescript
// Find active jobs with pagination
const jobs = await Job.find({ status: 'active' })
  .populate('postedBy', 'name email')
  .sort({ createdAt: -1 })
  .limit(20)
  .skip(page * 20);

// Search jobs by text
const searchResults = await Job.find({
  $text: { $search: searchTerm },
  status: 'active'
});

// Find jobs by location and category
const filteredJobs = await Job.find({
  'location.country': country,
  category: category,
  status: 'active'
});
```

#### Application Operations
```typescript
// Create new application
const application = new Application({
  job: jobId,
  applicant: userId,
  cvUrl: cvFileUrl,
  coverLetter: coverLetter
});

// Update application status
await Application.findByIdAndUpdate(applicationId, {
  status: newStatus,
  $push: {
    statusHistory: {
      status: newStatus,
      date: new Date(),
      updatedBy: updatedByUserId,
      note: statusNote
    }
  }
});

// Get applications for a job
const applications = await Application.find({ job: jobId })
  .populate('applicant', 'name email')
  .sort({ createdAt: -1 });
```

### Performance Considerations

#### Indexing Strategy
- **Text Search**: Full-text search on job titles and descriptions
- **Location Queries**: Compound indexes for efficient location-based searches
- **Status Filtering**: Optimized queries for active/closed jobs
- **Unique Constraints**: Prevent duplicate applications

#### Query Optimization
- Use `populate()` selectively to avoid over-fetching
- Implement pagination for large result sets
- Use projection to limit returned fields
- Leverage MongoDB aggregation pipeline for complex queries

## Security Considerations

### Password Security
- **Hashing**: bcrypt with salt rounds (10)
- **Validation**: Minimum 6 characters
- **Storage**: Never store plain text passwords

### Data Validation
- **Email**: Lowercase conversion and format validation
- **Required Fields**: Enforced at schema level
- **Enum Values**: Restricted to predefined options
- **ObjectId References**: Validated for existence

### Access Control
- **Role-Based**: User roles determine access permissions
- **Ownership**: Users can only modify their own data
- **Status Validation**: Proper workflow enforcement

## Environment Setup

### Required Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/filledin-talent
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/filledin-talent

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Development Setup

1. **Install MongoDB** locally or use MongoDB Atlas
2. **Set Environment Variables** in `.env.local`
3. **Run Database Migrations** (if any)
4. **Seed Initial Data** (optional)

### Production Considerations

- **Connection Pooling**: Configured for serverless environments
- **Error Handling**: Comprehensive error logging
- **Backup Strategy**: Regular database backups
- **Monitoring**: Database performance monitoring
- **Scaling**: Horizontal scaling with MongoDB sharding

## File Storage Integration

### CV and Document Storage

The application integrates with local storage for CV files:

- **Storage Location**: Local storage (browser-based)
- **File Types**: PDF, DOC, DOCX
- **Size Limits**: Configurable per file type
- **Security**: File validation and sanitization

### Implementation Notes

- CV URLs stored in `Application.cvUrl` field
- Additional documents stored in `Application.additionalDocuments` array
- File cleanup handled by application logic
- Consider cloud storage (AWS S3, Google Cloud) for production

## Migration and Maintenance

### Schema Updates

When updating schemas:
1. **Backup Database** before changes
2. **Test Migrations** in development
3. **Version Control** schema changes
4. **Document Changes** in this file

### Data Integrity

- **Referential Integrity**: Maintained through application logic
- **Cleanup Jobs**: Remove orphaned documents
- **Data Validation**: Regular validation scripts
- **Audit Logs**: Track important data changes

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check `MONGODB_URI` environment variable
   - Verify MongoDB server is running
   - Check network connectivity

2. **Authentication Failures**
   - Verify user credentials
   - Check password hashing implementation
   - Validate JWT configuration

3. **Query Performance**
   - Review index usage
   - Optimize query patterns
   - Monitor slow queries

### Debugging Tools

- **MongoDB Compass**: GUI for database exploration
- **Mongoose Debug**: Enable query logging
- **Application Logs**: Comprehensive error logging
- **Performance Monitoring**: Query performance tracking

---

*Last Updated: January 2025*
*Version: 1.0*