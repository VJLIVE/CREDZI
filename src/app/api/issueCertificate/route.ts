import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import algosdk from 'algosdk';

// Types for the API
interface IssueCertificateRequest {
  learnerName: string;
  learnerWallet: string;
  courseName: string;
  organizationName?: string;
  description?: string;
  skills?: string[];
  grade?: string;
  score?: number;
  validUntil?: string;
  // New fields for signed transaction
  signedTxn: string; // Base64 encoded signed transaction
  issuerWallet: string; // Wallet address of the issuer
  ipfsHash: string; // IPFS hash from metadata upload
}

interface ARC69Metadata {
  standard: string;
  description: string;
  external_url?: string;
  image?: string;
  image_integrity?: string;
  image_mimetype?: string;
  properties: {
    certificate_type: string;
    issue_date: string;
    valid_from: string;
    valid_until?: string;
    skills?: string[];
    grade?: string;
    score?: number;
    verification_url?: string;
    learner_name: string;
    course_name: string;
    organization_name: string;
  };
}


// Algorand NFT minting function using pre-signed transaction
async function submitSignedTransaction(
  signedTxnBase64: string
): Promise<{ assetId: number; transactionId: string }> {
  // Initialize Algorand client (TestNet for development)
  const algodToken = process.env.ALGORAND_API_TOKEN || '';
  const algodServer = process.env.ALGORAND_API_URL || 'https://testnet-api.algonode.cloud';
  const algodPort = '';
  
  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  
  // Decode the signed transaction
  const signedTxn = new Uint8Array(Buffer.from(signedTxnBase64, 'base64'));
  
  // Submit the transaction
  const response = await algodClient.sendRawTransaction(signedTxn).do();
  const txId = response.txid;
  
  // Wait for confirmation
  const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
  
  const assetId = result.assetIndex;
  
  if (!assetId) {
    throw new Error('Failed to retrieve asset ID from transaction result');
  }
  
  return {
    assetId: Number(assetId),
    transactionId: txId,
  };
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body: IssueCertificateRequest = await request.json();
    const { 
      learnerName, 
      learnerWallet, 
      courseName, 
      organizationName,
      description,
      skills,
      grade,
      score,
      validUntil,
      signedTxn,
      issuerWallet,
      ipfsHash
    } = body;

    // Input validation
    if (!learnerName || !learnerWallet || !courseName || !signedTxn || !issuerWallet || !ipfsHash) {
      return NextResponse.json(
        { error: 'Learner name, learner wallet, course name, signed transaction, issuer wallet, and IPFS hash are required' },
        { status: 400 }
      );
    }

    // Validate Algorand wallet addresses format
    if (!algosdk.isValidAddress(learnerWallet)) {
      return NextResponse.json(
        { error: 'Invalid learner wallet address' },
        { status: 400 }
      );
    }

    if (!algosdk.isValidAddress(issuerWallet)) {
      return NextResponse.json(
        { error: 'Invalid issuer wallet address' },
        { status: 400 }
      );
    }

    // Get organization info (could be from authenticated user or provided)
    let orgName = organizationName;
    if (!orgName) {
      // In a real implementation, you'd get this from the authenticated user
      orgName = 'Default Organization';
    }

    // Check if certificate already exists for this combination
    const existingCertificate = await Certificate.findOne({
      learnerWallet,
      courseName,
      issuerWallet,
    });

    if (existingCertificate) {
      return NextResponse.json(
        { error: 'Certificate already exists for this learner and course' },
        { status: 409 }
      );
    }

    // Create ARC69 metadata for database storage
    const issueDate = new Date();
    const validFromDate = new Date();
    const validUntilDate = validUntil ? new Date(validUntil) : undefined;

    const metadata: ARC69Metadata = {
      standard: 'arc69',
      description: description || `Certificate of completion for ${courseName}`,
      external_url: `${process.env.NEXT_PUBLIC_BASE_URL}/verify`,
      properties: {
        certificate_type: 'course_completion',
        issue_date: issueDate.toISOString(),
        valid_from: validFromDate.toISOString(),
        valid_until: validUntilDate?.toISOString(),
        skills: skills || [],
        grade: grade,
        score: score,
        learner_name: learnerName,
        course_name: courseName,
        organization_name: orgName,
        verification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/verify`,
      },
    };

    // Submit the pre-signed transaction to Algorand
    const { assetId, transactionId } = await submitSignedTransaction(signedTxn);

    // Save certificate record to MongoDB
    const certificate = new Certificate({
      learnerName,
      learnerWallet,
      courseName,
      issuerWallet,
      organizationName: orgName,
      assetId,
      ipfsHash,
      metadata,
      transactionId,
      status: 'issued',
      transferredToLearner: false, // Explicitly set to false when issuing
    });

    const savedCertificate = await certificate.save();

    return NextResponse.json(
      {
        message: 'Certificate issued successfully',
        certificate: {
          id: savedCertificate._id,
          learnerName: savedCertificate.learnerName,
          learnerWallet: savedCertificate.learnerWallet,
          courseName: savedCertificate.courseName,
          organizationName: savedCertificate.organizationName,
          assetId: savedCertificate.assetId,
          ipfsHash: savedCertificate.ipfsHash,
          transactionId: savedCertificate.transactionId,
          issuedAt: savedCertificate.issuedAt,
          verificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${assetId}`,
        },
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Certificate issuance error:', error);
    const err = error as Error & { name?: string; code?: number; errors?: Record<string, { message: string }> };

    if (err.message?.includes('IPFS')) {
      return NextResponse.json(
        { error: 'Failed to upload metadata to IPFS', details: err.message },
        { status: 500 }
      );
    }

    if (err.message?.includes('Algorand') || err.message?.includes('algod')) {
      return NextResponse.json(
        { error: 'Failed to mint NFT on Algorand', details: err.message },
        { status: 500 }
      );
    }

    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors || {}).map(
        (validationErr) => validationErr.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    if (err.code === 11000) {
      return NextResponse.json(
        { error: 'Certificate with this asset ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}