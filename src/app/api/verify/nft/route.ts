import { NextRequest, NextResponse } from 'next/server';
import algosdk from 'algosdk';

// Initialize Algorand client
const getAlgodClient = () => {
  const algodToken = '';
  const algodServer = process.env.NEXT_PUBLIC_ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud';
  const algodPort = '';
  
  return new algosdk.Algodv2(algodToken, algodServer, algodPort);
};

// Function to fetch metadata from IPFS
const fetchMetadataFromIPFS = async (assetUrl: string) => {
  try {
    // Extract IPFS hash from URL
    const ipfsHashMatch = assetUrl.match(/ipfs\/([^/?]+)/);
    if (!ipfsHashMatch) {
      throw new Error('Invalid IPFS URL format');
    }
    
    const ipfsHash = ipfsHashMatch[1];
    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata from IPFS');
    }
    
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching IPFS metadata:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetIdParam = searchParams.get('assetId');

    if (!assetIdParam) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    const assetId = parseInt(assetIdParam);
    if (isNaN(assetId) || assetId <= 0) {
      return NextResponse.json(
        { error: 'Invalid Asset ID' },
        { status: 400 }
      );
    }

    const algodClient = getAlgodClient();

    // Get asset information from Algorand blockchain
    console.log(`Fetching asset information for Asset ID: ${assetId}`);
    const assetInfo = await algodClient.getAssetByID(assetId).do();

    if (!assetInfo) {
      return NextResponse.json(
        { error: 'Asset not found on blockchain' },
        { status: 404 }
      );
    }

    // Extract asset parameters
    const assetParams = assetInfo.params;
    
    // Fetch metadata from IPFS if URL is available
    let metadata = null;
    if (assetParams.url) {
      metadata = await fetchMetadataFromIPFS(assetParams.url);
    }

    // Structure the response similar to the certificate model
    const nftDetails = {
      // Basic asset information from blockchain
      assetId: assetId,
      assetName: assetParams.name || 'Unknown',
      unitName: assetParams.unitName || '',
      total: Number(assetParams.total),
      decimals: assetParams.decimals,
      defaultFrozen: assetParams.defaultFrozen,
      
      // URLs and metadata
      assetUrl: assetParams.url || '',
      metadataHash: assetParams.metadataHash ? Buffer.from(assetParams.metadataHash).toString('base64') : null,
      
      // Addresses
      creator: assetParams.creator,
      manager: assetParams.manager || null,
      reserve: assetParams.reserve || null,
      freeze: assetParams.freeze || null,
      clawback: assetParams.clawback || null,
      
      // IPFS metadata (if available)
      metadata: metadata,
      
      // Additional blockchain info
      createdAtRound: (assetInfo as any)['created-at-round'] || null,
      destroyed: (assetInfo as any).destroyed || false,
      
      // Extract IPFS hash from URL
      ipfsHash: assetParams.url ? assetParams.url.match(/ipfs\/([^/?]+)/)?.[1] : null,
      
      // Verification info
      isNFT: Number(assetParams.total) === 1 && assetParams.decimals === 0,
      verifiedAt: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true,
      nftDetails,
      source: 'blockchain'
    });

  } catch (error: any) {
    console.error('Error fetching NFT details from blockchain:', error);
    
    // Handle specific Algorand errors
    if (error.message?.includes('asset does not exist')) {
      return NextResponse.json(
        { error: 'Asset does not exist on the blockchain' },
        { status: 404 }
      );
    }
    
    if (error.message?.includes('network')) {
      return NextResponse.json(
        { error: 'Network error while connecting to blockchain' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch NFT details from blockchain' },
      { status: 500 }
    );
  }
}