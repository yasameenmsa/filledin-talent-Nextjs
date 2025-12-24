import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { z } from 'zod';

// Profile validation schema
const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  location: z.string().max(200, 'Location too long').optional(),
  company: z.string().max(100, 'Company name too long').optional(),
  position: z.string().max(100, 'Position too long').optional(),
  profileImage: z.string().url('Invalid profile image URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio too long').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  skills: z.array(z.string().max(50, 'Skill name too long')).optional(),
  experience: z.array(z.object({
    company: z.string().min(1, 'Company name is required').max(100),
    position: z.string().min(1, 'Position is required').max(100),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    description: z.string().max(500).optional(),
    current: z.boolean().optional()
  })).optional(),
  education: z.array(z.object({
    institution: z.string().min(1, 'Institution is required').max(100),
    degree: z.string().min(1, 'Degree is required').max(100),
    field: z.string().min(1, 'Field of study is required').max(100),
    year: z.string().regex(/^\d{4}$/, 'Invalid year format'),
    grade: z.string().max(10).optional()
  })).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal(''))
  }).optional(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    jobAlerts: z.boolean().optional(),
    profileVisibility: z.enum(['public', 'private', 'connections']).optional(),
    language: z.enum(['en', 'ar', 'fr']).optional()
  }).optional()
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Structure the response with all user fields
    const userProfile = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      location: user.location,
      company: user.company,
      position: user.position,
      profileImage: user.profileImage,
      bio: user.bio,
      website: user.website,
      skills: user.skills || [],
      experience: user.experience || [],
      education: user.education || [],
      socialLinks: user.socialLinks || {},
      preferences: user.preferences || {
        emailNotifications: true,
        jobAlerts: true,
        profileVisibility: 'public',
        language: 'en'
      },
      isEmailVerified: user.isEmailVerified || false,
      lastLogin: user.lastLogin?.toISOString(),
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString()
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profile, cv, ...otherUpdates } = body;

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user fields
    if (otherUpdates.email && otherUpdates.email !== user.email) {
      // Check if new email already exists
      const existingUser = await User.findOne({ email: otherUpdates.email });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      user.email = otherUpdates.email;
    }

    if (otherUpdates.name) {
      user.name = otherUpdates.name;
    }

    // Update profile
    if (profile) {
      user.profile = {
        ...user.profile,
        ...profile
      };
    }

    // Update CV
    if (cv !== undefined) {
      user.cv = cv;
    }

    await user.save();

    // Return updated user data
    const updatedUser = {
      id: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified || false,
      profile: user.profile || {},
      cv: user.cv,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString()
    };

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}