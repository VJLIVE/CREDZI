import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateHash = searchParams.get('hash');

    if (!certificateHash) {
      return NextResponse.json(
        { error: 'Certificate hash is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the certificate by hash
    const certificate = await Certificate.findOne({ 
      certificateHash: certificateHash.trim() 
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Find the learner details using the learnerWalletId
    const learner = await User.findOne({ 
      walletId: certificate.learnerWalletId 
    }).select('firstName lastName email');

    if (!learner) {
      return NextResponse.json(
        { error: 'Learner information not found' },
        { status: 404 }
      );
    }

    // Find the issuer details using the issuerWalletId
    const issuer = await User.findOne({ 
      walletId: certificate.issuerWalletId 
    }).select('firstName lastName organizationName email');

    // Format the response
    const certificateData = {
      id: certificate._id,
      certificateHash: certificate.certificateHash,
      courseName: certificate.courseName,
      status: certificate.status,
      issuedAt: certificate.issuedAt,
      expiresAt: certificate.expiresAt,
      createdAt: certificate.createdAt,
      updatedAt: certificate.updatedAt,
      metadata: certificate.metadata,
      learner: {
        name: `${learner.firstName} ${learner.lastName}`,
        firstName: learner.firstName,
        lastName: learner.lastName,
        email: learner.email,
        walletId: certificate.learnerWalletId
      },
      issuer: {
        name: issuer ? (issuer.organizationName || `${issuer.firstName} ${issuer.lastName}`) : certificate.issuerOrganization,
        organizationName: issuer?.organizationName,
        email: issuer?.email,
        walletId: certificate.issuerWalletId
      }
    };

    return NextResponse.json({
      success: true,
      certificate: certificateData
    });

  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}