import { NextRequest, NextResponse } from 'next/server';

interface MetadataRequest {
  learnerName: string;
  courseName: string;
  organizationName: string;
  description?: string;
  skills?: string[];
  grade?: string;
  score?: number;
  validUntil?: string;
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

// Pinata IPFS upload function
async function uploadToIPFS(metadata: ARC69Metadata): Promise<string> {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  
  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error('Pinata API credentials not configured');
  }

  const pinataEndpoint = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  const data = {
    pinataContent: metadata,
    pinataMetadata: {
      name: `Certificate-${metadata.properties.learner_name}-${metadata.properties.course_name}`,
    },
  };

  const response = await fetch(pinataEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': pinataApiKey,
      'pinata_secret_api_key': pinataSecretApiKey,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to upload to IPFS: ${response.status} ${errorData}`);
  }

  const result = await response.json();
  return result.IpfsHash;
}

export async function POST(request: NextRequest) {
  try {
    const body: MetadataRequest = await request.json();
    const { 
      learnerName, 
      courseName, 
      organizationName,
      description,
      skills,
      grade,
      score,
      validUntil 
    } = body;

    // Input validation
    if (!learnerName || !courseName || !organizationName) {
      return NextResponse.json(
        { error: 'Learner name, course name, and organization name are required' },
        { status: 400 }
      );
    }

    // Create ARC69 metadata
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
        organization_name: organizationName,
        verification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/verify`,
      },
    };

    // Upload metadata to IPFS
    const ipfsHash = await uploadToIPFS(metadata);

    return NextResponse.json(
      {
        message: 'Metadata uploaded successfully',
        ipfsHash: ipfsHash,
        metadata: metadata,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Metadata upload error:', error);
    const err = error as Error;

    if (err.message?.includes('IPFS')) {
      return NextResponse.json(
        { error: 'Failed to upload metadata to IPFS', details: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}