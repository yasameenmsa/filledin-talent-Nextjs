import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email }).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
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
    });
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