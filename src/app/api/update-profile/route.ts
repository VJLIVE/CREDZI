import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../lib/mongodb';
import User from '../../../models/User';

export async function PUT(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const body = await request.json();
    const { walletId, ...updateData } = body;

    if (!walletId) {
      return NextResponse.json(
        { success: false, message: 'Wallet ID is required' },
        { status: 400 }
      );
    }

    // Find and update the user
    const updatedUser = await User.findOneAndUpdate(
      { walletId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return the updated user data
    return NextResponse.json({
      success: true,
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      walletId: updatedUser.walletId,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      // Learner-specific fields
      skills: updatedUser.skills,
      experience: updatedUser.experience,
      education: updatedUser.education,
      location: updatedUser.location,
      githubProfile: updatedUser.githubProfile,
      linkedinProfile: updatedUser.linkedinProfile,
      // Organization-specific fields
      organizationName: updatedUser.organizationName,
      organizationType: updatedUser.organizationType,
      website: updatedUser.website,
      description: updatedUser.description,
      industry: updatedUser.industry,
      size: updatedUser.size,
      address: updatedUser.address,
      establishedYear: updatedUser.establishedYear,
      certificationAuthority: updatedUser.certificationAuthority,
      createdAt: updatedUser.createdAt
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}