'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface CertificateMetadata {
  description?: string;
  properties?: {
    certificate_type?: string;
    grade?: string;
    score?: number;
    issue_date?: string;
    valid_from?: string;
    valid_until?: string;
    skills?: string[];
    learner_name?: string;
    course_name?: string;
    organization_name?: string;
  };
}

interface NFTDetails {
  assetId: number;
  assetName: string;
  unitName: string;
  total: number;
  decimals: number;
  defaultFrozen: boolean;
  assetUrl: string;
  metadataHash: string | null;
  creator: string;
  manager: string | null;
  reserve: string | null;
  freeze: string | null;
  clawback: string | null;
  metadata: CertificateMetadata | null;
  createdAtRound: number | null;
  destroyed: boolean;
  ipfsHash: string | null;
  isNFT: boolean;
  verifiedAt: string;
}

interface VerificationResponse {
  success: boolean;
  nftDetails?: NFTDetails;
  source?: string;
  error?: string;
}

const VerifyPageInner = () => {
  const searchParams = useSearchParams();
  const [assetId, setAssetId] = useState<string>('');
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Check for assetId in URL parameters on component mount
  useEffect(() => {
    const urlAssetId = searchParams.get('assetId');
    if (urlAssetId) {
      setAssetId(urlAssetId);
      // Auto-verify if assetId is provided in URL
      handleVerifyWithAssetId(urlAssetId);
    }
  }, [searchParams]);

  const handleVerifyWithAssetId = async (assetIdValue: string) => {
    if (!assetIdValue.trim()) {
      setError('Please enter an Asset ID');
      return;
    }

    const assetIdNumber = parseInt(assetIdValue.trim());
    if (isNaN(assetIdNumber) || assetIdNumber <= 0) {
      setError('Please enter a valid Asset ID');
      return;
    }

    setLoading(true);
    setError('');
    setNftDetails(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/verify/nft?assetId=${assetIdNumber}`);
      const data: VerificationResponse = await response.json();

      if (response.ok && data.success) {
        setNftDetails(data.nftDetails!);
      } else {
        setError(data.error || 'Failed to verify NFT');
      }
    } catch (error) {
      console.error('Error verifying NFT:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleVerifyWithAssetId(assetId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWalletAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen pb-8">
        {/* Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 w-full h-full" style={{
            background: 'radial-gradient(ellipse 80% 60% at 60% 30%, #f9fafb 95%, #f1f5f9 100%)'
          }} />
          <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full opacity-50 blur-3xl" style={{background: 'radial-gradient(circle, #fff 80%, #f3f4f6 100%)'}}></div>
          <div className="absolute right-[-80px] top-[150px] w-[340px] h-[320px] rounded-full opacity-40 blur-2xl" style={{background: 'radial-gradient(circle, #e5e7eb 80%, #f3f4f6 100%)'}}></div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">NFT Certificate Verification</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter an Asset ID to verify and view the details of any NFT certificate on the Algorand blockchain.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white bg-opacity-95 rounded-xl p-8 shadow-xl border border-gray-200 mb-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="assetId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Asset ID
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    id="assetId"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    placeholder="Enter Asset ID (e.g., 746239196)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      'Verify NFT'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Verification Failed</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* NFT Details */}
          {nftDetails && (
            <div className="bg-white bg-opacity-95 rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Certificate Verified</h2>
                    <p className="text-green-100">Fetched directly from Algorand blockchain</p>
                  </div>
                </div>
              </div>

              {/* NFT Content */}
              <div className="p-8">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Certificate Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Asset Name:</span>
                        <p className="font-semibold text-gray-800">{nftDetails.assetName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Asset ID:</span>
                        <p className="font-mono text-gray-800">{nftDetails.assetId}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Unit Name:</span>
                        <p className="font-semibold text-gray-800">{nftDetails.unitName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${nftDetails.isNFT ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {nftDetails.isNFT ? 'NFT Certificate' : 'Fungible Token'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Blockchain Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Creator:</span>
                        <p className="font-mono text-gray-800 text-sm">{formatWalletAddress(nftDetails.creator)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Total Supply:</span>
                        <p className="font-semibold text-gray-800">{nftDetails.total}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Decimals:</span>
                        <p className="font-semibold text-gray-800">{nftDetails.decimals}</p>
                      </div>
                      {nftDetails.createdAtRound && (
                        <div>
                          <span className="text-sm text-gray-500">Created at Round:</span>
                          <p className="font-semibold text-gray-800">{nftDetails.createdAtRound}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {nftDetails.metadata && (
                  <div className="border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Certificate Metadata</h3>
                    
                    {/* Course Information */}
                    {nftDetails.metadata.properties && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {nftDetails.metadata.properties.certificate_type && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-sm text-gray-500">Certificate Type:</span>
                            <p className="font-semibold text-gray-800 capitalize">
                              {nftDetails.metadata.properties.certificate_type.replace('_', ' ')}
                            </p>
                          </div>
                        )}
                        
                        {nftDetails.metadata.properties.grade && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-sm text-gray-500">Grade:</span>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getGradeColor(nftDetails.metadata.properties.grade)}`}>
                              {nftDetails.metadata.properties.grade}
                            </span>
                          </div>
                        )}
                        
                        {nftDetails.metadata.properties.score && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <span className="text-sm text-gray-500">Score:</span>
                            <p className="font-semibold text-gray-800">{nftDetails.metadata.properties.score}%</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dates */}
                    {nftDetails.metadata.properties && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {nftDetails.metadata.properties.issue_date && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <span className="text-sm text-blue-600">Issue Date:</span>
                            <p className="font-semibold text-blue-800">
                              {formatDate(nftDetails.metadata.properties.issue_date)}
                            </p>
                          </div>
                        )}
                        
                        {nftDetails.metadata.properties.valid_from && (
                          <div className="bg-green-50 rounded-lg p-4">
                            <span className="text-sm text-green-600">Valid From:</span>
                            <p className="font-semibold text-green-800">
                              {formatDate(nftDetails.metadata.properties.valid_from)}
                            </p>
                          </div>
                        )}
                        
                        {nftDetails.metadata.properties.valid_until && (
                          <div className="bg-orange-50 rounded-lg p-4">
                            <span className="text-sm text-orange-600">Valid Until:</span>
                            <p className="font-semibold text-orange-800">
                              {formatDate(nftDetails.metadata.properties.valid_until)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skills */}
                    {nftDetails.metadata.properties?.skills && nftDetails.metadata.properties.skills.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-4 mb-6">
                        <span className="text-sm text-purple-600 block mb-2">Skills Earned:</span>
                        <div className="flex flex-wrap gap-2">
                          {nftDetails.metadata.properties.skills.map((skill: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {nftDetails.metadata.description && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-sm text-gray-500">Description:</span>
                        <p className="text-gray-800 mt-1">{nftDetails.metadata.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* IPFS Information */}
                {nftDetails.ipfsHash && (
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">IPFS Storage</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">IPFS Hash:</span>
                          <p className="font-mono text-sm text-gray-800 break-all">{nftDetails.ipfsHash}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Asset URL:</span>
                          <p className="font-mono text-sm text-gray-800 break-all">{nftDetails.assetUrl}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Footer */}
                <div className="border-t pt-6 mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Verified on {formatDate(nftDetails.verifiedAt)} • Source: Algorand Blockchain
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {hasSearched && !loading && !nftDetails && !error && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Verify</h3>
              <p className="text-gray-500">Enter an Asset ID above to verify and view NFT certificate details.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

const VerifyPage = () => (
  <Suspense fallback={<div className="min-h-screen"><Navbar /><div className="p-8 text-center text-gray-600">Loading verification interface...</div></div>}>
    <VerifyPageInner />
  </Suspense>
);

export default VerifyPage;