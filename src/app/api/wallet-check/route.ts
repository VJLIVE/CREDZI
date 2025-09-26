import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { walletId } = body;

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID is required' },
        { status: 400 }
      );
    }

    // Find user by wallet ID
    const user = await User.findOne({ walletId });

    if (!user) {
      return NextResponse.json(
        { exists: false, message: 'Wallet not found in database' },
        { status: 200 }
      );
    }

    // Return user data (excluding sensitive information)
    return NextResponse.json(
      {
        exists: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          walletId: user.walletId,
          phone: user.phone,
          bio: user.bio,
          // Learner-specific fields
          skills: user.skills,
          experience: user.experience,
          education: user.education,
          location: user.location,
          githubProfile: user.githubProfile,
          linkedinProfile: user.linkedinProfile,
          // Organization-specific fields
          organizationName: user.organizationName,
          organizationType: user.organizationType,
          website: user.website,
          description: user.description,
          industry: user.industry,
          size: user.size,
          address: user.address,
          establishedYear: user.establishedYear,
          certificationAuthority: user.certificationAuthority,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Wallet check error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}