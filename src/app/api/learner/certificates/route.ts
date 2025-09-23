import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Certificate from '@/models/Certificate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user and populate their certificates
    const user = await User.findOne({ walletId: walletId.trim() })
      .populate('certificates')
      .select('firstName lastName email walletId certificates');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get detailed certificate information with issuer details
    const certificatesWithDetails = await Promise.all(
      (user.certificates || []).map(async (cert: any) => {
        // Find issuer details
        const issuer = await User.findOne({ walletId: cert.issuerWalletId })
          .select('firstName lastName organizationName email');

        return {
          id: cert._id,
          certificateHash: cert.certificateHash,
          courseName: cert.courseName,
          status: cert.status,
          issuedAt: cert.issuedAt,
          expiresAt: cert.expiresAt,
          createdAt: cert.createdAt,
          updatedAt: cert.updatedAt,
          metadata: cert.metadata || {},
          issuer: {
            name: issuer ? (issuer.organizationName || `${issuer.firstName} ${issuer.lastName}`) : cert.issuerOrganization,
            organizationName: issuer?.organizationName,
            email: issuer?.email,
            walletId: cert.issuerWalletId
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      learner: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        walletId: user.walletId
      },
      certificates: certificatesWithDetails,
      totalCertificates: certificatesWithDetails.length
    });

  } catch (error: any) {
    console.error('Error fetching learner certificates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}