import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Map backend flat structure to frontend nested structure
    // Split name into firstName and lastName best-effort
    const nameParts = (user.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const responseData = {
      id: user._id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profile: {
        firstName,
        lastName,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        company: user.company,
        position: user.position,
        website: user.website,
        skills: user.skills || [],
        experience: user.experience || [],
        education: user.education || [],
        profileImage: user.profileImage, // Ensure this field exists in frontend interface
      }
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    // Extract fields from frontend structure
    const { profile } = data;

    if (!profile) {
      return NextResponse.json({ error: 'Missing profile data' }, { status: 400 });
    }

    const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

    // Update object matching User model schema
    const updates: any = {
      name,
      phone: profile.phone,
      location: profile.location,
      bio: profile.bio,
      company: profile.company,
      position: profile.position,
      website: profile.website,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
    };

    // Only update email if it's changing (might require verification logic in real app, but for now simple update)
    if (data.email && data.email !== session.user.email) {
      // Optional: Add email update logic or separate endpoint
      // For now, let's assume specific email update flow is separate or trusted
      updates.email = data.email;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Re-construct response format matching GET
    const nameParts = (updatedUser.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const responseData = {
      id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      isEmailVerified: updatedUser.isEmailVerified,
      profile: {
        firstName,
        lastName,
        phone: updatedUser.phone,
        location: updatedUser.location,
        bio: updatedUser.bio,
        company: updatedUser.company,
        position: updatedUser.position,
        website: updatedUser.website,
        skills: updatedUser.skills || [],
        experience: updatedUser.experience || [],
        education: updatedUser.education || [],
        profileImage: updatedUser.profileImage,
      }
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}