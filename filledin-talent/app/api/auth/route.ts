import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password, role, profile } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' }, 
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' }, 
        { status: 400 }
      );
    }

    const newUser = new User({
      email,
      password, // Will be hashed automatically by the pre-save middleware
      role: role || 'jobseeker',
      profile: {
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        ...profile
      },
    });

    await newUser.save();

    // Remove password from response for security
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('API Registration error:', error);
    
    // Handle specific MongoDB/Mongoose errors
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return NextResponse.json({ 
          message: 'Validation error',
          error: error.message
        }, { status: 400 });
      }
      
      if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        return NextResponse.json({ 
          message: 'User already exists with this email'
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}