import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Certificate from '@/models/Certificate';

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get query parameters for filtering (optional)
    const { searchParams } = new URL(req.url);
    const organizationName = searchParams.get('organization');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query for pending certificates (not transferred)
    const query: Record<string, unknown> = {
      transferredToLearner: { $ne: true }, // Not transferred or false
    };

    // Add organization filter if provided
    if (organizationName) {
      query.organizationName = organizationName;
    }

    // Fetch pending certificates
    const certificates = await Certificate.find(query)
      .sort({ issuedAt: -1 }) // Sort by most recent first
      .limit(limit)
      .skip(offset)
      .select({
        _id: 1,
        learnerName: 1,
        learnerWallet: 1,
        courseName: 1,
        organizationName: 1,
        assetId: 1,
        ipfsHash: 1,
        transactionId: 1,
        issuedAt: 1,
        transferredToLearner: 1,
        transferTxId: 1,
        transferredAt: 1,
      });

    console.log(`Found ${certificates.length} pending certificates with query:`, JSON.stringify(query));
    console.log('Certificates transferredToLearner status:', certificates.map(cert => ({
      id: cert._id.toString(),
      assetId: cert.assetId,
      transferredToLearner: cert.transferredToLearner,
      transferTxId: cert.transferTxId
    })));

    // Get total count for pagination
    const totalCount = await Certificate.countDocuments(query);

    // Transform the certificates to match the expected format
    const formattedCertificates = certificates.map(cert => ({
      id: cert._id.toString(),
      learnerName: cert.learnerName,
      learnerWallet: cert.learnerWallet,
      courseName: cert.courseName,
      organizationName: cert.organizationName,
      assetId: cert.assetId,
      ipfsHash: cert.ipfsHash,
      transactionId: cert.transactionId,
      issuedAt: cert.issuedAt.toISOString(),
      transferredToLearner: cert.transferredToLearner || false,
      transferTxId: cert.transferTxId || null,
      transferredAt: cert.transferredAt ? cert.transferredAt.toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      certificates: formattedCertificates,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });

  } catch (error) {
    console.error('Error fetching pending certificates:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'Failed to fetch pending certificates'
      },
      { status: 500 }
    );
  }
}