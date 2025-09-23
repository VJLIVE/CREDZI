import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');

    if (!walletId) {
      return NextResponse.json(
        { error: 'walletId parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user and populate certificates
    const user = await User.findOne({ walletId: walletId.trim() })
      .populate('certificates')
      .select('firstName lastName email walletId certificates');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        walletId: user.walletId,
        certificates: user.certificates || [],
        certificateCount: user.certificates ? user.certificates.length : 0
      }
    });

  } catch (error: any) {
    console.error('Error fetching user certificates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}