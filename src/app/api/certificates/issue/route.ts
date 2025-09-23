import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { walletId, courseName, issuerWalletId } = await request.json();

    // Validate required fields
    if (!walletId || !courseName || !issuerWalletId) {
      return NextResponse.json(
        { error: 'Missing required fields: walletId, courseName, and issuerWalletId' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the learner by wallet ID
    const learner = await User.findOne({ walletId: walletId.trim() });
    if (!learner) {
      return NextResponse.json(
        { error: 'Learner not found with the provided wallet ID' },
        { status: 404 }
      );
    }

    // Find the issuer (organization) by wallet ID
    const issuer = await User.findOne({ walletId: issuerWalletId.trim() });
    if (!issuer) {
      return NextResponse.json(
        { error: 'Issuer not found with the provided wallet ID' },
        { status: 404 }
      );
    }

    // Validate that issuer has the right role
    if (!['organization', 'admin'].includes(issuer.role)) {
      return NextResponse.json(
        { error: 'Only organizations and admins can issue certificates' },
        { status: 403 }
      );
    }

    // Check if certificate already exists for this learner and course from this issuer
    const existingCertificate = await Certificate.findOne({
      learnerWalletId: walletId.trim(),
      courseName: courseName.trim(),
      issuerWalletId: issuerWalletId.trim(),
      status: 'issued'
    });

    if (existingCertificate) {
      return NextResponse.json(
        { error: 'Certificate already exists for this learner and course' },
        { status: 409 }
      );
    }

    // Create new certificate
    const certificate = new Certificate({
      learnerWalletId: walletId.trim(),
      courseName: courseName.trim(),
      issuerWalletId: issuerWalletId.trim(),
      issuerOrganization: issuer.organizationName || `${issuer.firstName} ${issuer.lastName}`,
      status: 'issued',
    });

    // Save the certificate
    const savedCertificate = await certificate.save();
    console.log('Certificate saved with ID:', savedCertificate._id);

    // Add certificate reference to learner's certificates array
    try {
      // Use a simple approach: find the user, update manually, and save
      const learnerDoc = await User.findById(learner._id);
      if (learnerDoc) {
        // Initialize certificates array if it doesn't exist
        if (!Array.isArray(learnerDoc.certificates)) {
          learnerDoc.certificates = [];
        }
        
        // Add the certificate ID if not already present
        if (!learnerDoc.certificates.some((certId: any) => certId.toString() === savedCertificate._id.toString())) {
          learnerDoc.certificates.push(savedCertificate._id);
          learnerDoc.updatedAt = new Date();
          await learnerDoc.save();
          console.log('Successfully added certificate to learner array');
          console.log('Final certificates array:', learnerDoc.certificates);
        } else {
          console.log('Certificate already exists in learner array');
        }
      } else {
        console.error('Learner document not found for update');
      }
      
    } catch (updateError) {
      console.error('Error updating learner document:', updateError);
      // Don't fail the whole operation, just log the error
      // The certificate was still created successfully
    }

    // Return success response with certificate details
    return NextResponse.json({
      success: true,
      message: 'Certificate issued successfully',
      certificate: {
        id: savedCertificate._id,
        learnerWalletId: savedCertificate.learnerWalletId,
        courseName: savedCertificate.courseName,
        issuerOrganization: savedCertificate.issuerOrganization,
        certificateHash: savedCertificate.certificateHash,
        issuedAt: savedCertificate.issuedAt,
        status: savedCertificate.status,
      },
      learner: {
        name: `${learner.firstName} ${learner.lastName}`,
        email: learner.email,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error issuing certificate:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Certificate with this hash already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}