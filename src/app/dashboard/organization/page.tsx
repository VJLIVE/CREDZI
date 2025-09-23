'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import Navbar from '@/components/Navbar';
import IssueCertificateForm, { CertificateFormData } from '@/components/IssueCertificateForm';
import { prepareAndSignCertificateTransaction, prepareAndSignTransferTransaction, prepareAndSignOptInTransaction, checkAssetOptInStatus } from '@/lib/algorandUtils';

interface IssuedCertificate {
  id: string;
  learnerName: string;
  learnerWallet: string;
  courseName: string;
  organizationName: string;
  assetId: number;
  ipfsHash: string;
  transactionId: string;
  issuedAt: string;
  verificationUrl: string;
}

interface ApiResponse {
  message: string;
  certificate: IssuedCertificate;
}

interface ApiError {
  error: string;
  details?: string;
}

const OrganizationDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, hasRole, isLoading, connectedWallet, peraWallet } = useWalletAuth();
  
  // Component state
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([]);
  const [pendingTransfersCount, setPendingTransfersCount] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // API call to issue certificate with wallet signing
  const handleIssueCertificate = async (formData: CertificateFormData) => {
    setIsIssuing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!connectedWallet) {
        throw new Error('Wallet not connected. Please connect your wallet to issue certificates.');
      }

      if (!peraWallet) {
        throw new Error('Wallet service not initialized. Please refresh the page and try again.');
      }

      // Step 1: Upload metadata to IPFS first
      const metadataResponse = await fetch('/api/uploadMetadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learnerName: formData.learnerName,
          courseName: formData.courseName,
          organizationName: formData.organizationName || user?.organizationName || 'Organization',
          description: formData.description,
          skills: formData.skills,
          grade: formData.grade,
          score: formData.score,
          validUntil: formData.validUntil,
        }),
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        throw new Error(errorData.error || 'Failed to upload metadata');
      }

      const { ipfsHash } = await metadataResponse.json();

      // Step 2: Prepare and sign asset creation transaction using connected wallet
      const signedTransactionResult = await prepareAndSignCertificateTransaction(
        peraWallet,
        connectedWallet,
        formData.learnerWallet,
        ipfsHash,
        formData.courseName
      );

      // Step 3: Submit the signed transaction to create the certificate
      const response = await fetch('/api/issueCertificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organizationName: formData.organizationName || user?.organizationName || 'Organization',
          signedTxn: signedTransactionResult.signedTxn,
          issuerWallet: connectedWallet,
          ipfsHash: ipfsHash,
        }),
      });

      const data: ApiResponse | ApiError = await response.json();

      if (!response.ok) {
        const errorData = data as ApiError;
        throw new Error(errorData.details || errorData.error || 'Failed to issue certificate');
      }

      const successData = data as ApiResponse;

      // Step 4: Check if learner wallet is opted into the asset
      console.log('Checking asset opt-in status...');
      const isOptedIn = await checkAssetOptInStatus(formData.learnerWallet, successData.certificate.assetId);
      
      if (!isOptedIn) {
        // If not opted in, show success message for certificate creation but warn about transfer
        setSuccessMessage(`Certificate created successfully! Asset ID: ${successData.certificate.assetId}. 
          
⚠️ Transfer pending: The learner's wallet needs to opt into this asset before receiving it. 
Please share the Asset ID (${successData.certificate.assetId}) with the learner and ask them to opt into it using their Pera Wallet, then you can retry the transfer.`);
        
        // Add to local state 
        setIssuedCertificates(prev => [successData.certificate, ...prev]);
        
        // Refresh pending transfers count
        fetchPendingTransfersCount();
        
        // Close form
        setShowCertificateForm(false);
        
        // Clear success message after 10 seconds (longer for important message)
        setTimeout(() => setSuccessMessage(''), 10000);
        return; // Exit early, don't attempt transfer
      }

      // Step 5: Transfer the asset to the learner (only if opted in)
      console.log('Learner is opted in, preparing transfer transaction...');
      const transferSignedResult = await prepareAndSignTransferTransaction(
        peraWallet,
        connectedWallet,
        formData.learnerWallet,
        successData.certificate.assetId
      );

      // Step 6: Submit the transfer transaction
      console.log('Submitting transfer transaction...');
      const transferResponse = await fetch('/api/transferCertificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateId: successData.certificate.id,
          signedTransaction: transferSignedResult.signedTxn,
          learnerWallet: formData.learnerWallet,
        }),
      });

      const transferData = await transferResponse.json();

      if (!transferResponse.ok) {
        console.error('Transfer failed:', transferData);
        // If transfer fails due to opt-in issue, provide helpful message
        if (transferData.error?.includes('not opted in')) {
          throw new Error(`Transfer failed: The learner's wallet (${formData.learnerWallet}) needs to opt into the asset first. Asset ID: ${successData.certificate.assetId}. Please ask the learner to opt into this asset in their wallet before transfer.`);
        }
        throw new Error(transferData.error || 'Failed to transfer certificate to learner');
      }
      
      // Add to local state with updated transfer information
      setIssuedCertificates(prev => [transferData.certificate, ...prev]);
      
      // Refresh pending transfers count
      fetchPendingTransfersCount();
      
      // Show success message
      setSuccessMessage(`Certificate issued and transferred successfully! Asset ID: ${successData.certificate.assetId}. The NFT certificate has been sent to the learner's wallet.`);
      
      // Close form
      setShowCertificateForm(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (error: any) {
      console.error('Certificate issuance error:', error);
      
      // Handle specific wallet errors
      if (error.message.includes('User rejected')) {
        setErrorMessage('Transaction was cancelled by user.');
      } else if (error.message.includes('Wallet not connected')) {
        setErrorMessage(error.message);
      } else if (error.message.includes('not opted in')) {
        setErrorMessage(error.message + ' The certificate has been created but needs to be transferred manually.');
      } else if (error.message.includes('insufficient')) {
        setErrorMessage('Insufficient ALGO balance for transaction fees. Please add ALGO to your wallet.');
      } else {
        setErrorMessage(error.message || 'Failed to issue certificate. Please try again.');
      }
    } finally {
      setIsIssuing(false);
    }
  };

  // Clear error message when user interacts
  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Fetch pending transfers count
  const fetchPendingTransfersCount = async () => {
    try {
      const response = await fetch('/api/certificates/pending?limit=1');
      if (response.ok) {
        const data = await response.json();
        setPendingTransfersCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching pending transfers count:', error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to home
        router.push('/');
      } else if (!hasRole('organization') && !hasRole('admin')) {
        // Wrong role, redirect to learner dashboard if they're a learner
        if (hasRole('learner')) {
          router.push('/dashboard/learner');
        } else {
          router.push('/');
        }
      } else {
        // User is authenticated and has correct role, fetch pending transfers count
        fetchPendingTransfersCount();
      }
    }
  }, [isAuthenticated, hasRole, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (!hasRole('organization') && !hasRole('admin'))) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Organization Dashboard
          </h1>
          <p className="text-gray-600">
            Manage credentials, issue certificates, and track learner progress.
          </p>
          {user?.walletId && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-medium">Connected Wallet:</span>{' '}
                <span className="font-mono">{user.walletId.slice(0, 6)}...{user.walletId.slice(-4)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Issued Credentials */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{issuedCertificates.length}</p>
              <p className="text-sm text-gray-600">Credentials Issued</p>
            </div>
          </div>

          {/* Active Learners */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Active Learners</p>
            </div>
          </div>

          {/* Courses Created */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Courses Created</p>
            </div>
          </div>

          {/* Verification Requests */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.598 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Pending Verifications</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  clearMessages();
                  setShowCertificateForm(true);
                }}
                disabled={!connectedWallet || !peraWallet}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium text-gray-900">Issue New Credential</span>
                </div>
              </button>
              
              <button 
                className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                onClick={() => {
                  router.push('/dashboard/organization/pending-transfers');
                }}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="font-medium text-gray-900">Pending Transfers</span>
                  {pendingTransfersCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded-full">
                      {pendingTransfersCount}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1 ml-8">
                  {pendingTransfersCount > 0 
                    ? `${pendingTransfersCount} certificate${pendingTransfersCount === 1 ? '' : 's'} waiting for transfer`
                    : 'All certificates have been transferred'
                  }
                </div>
              </button>
              
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-medium text-gray-900">Create New Course</span>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium text-gray-900">View Analytics</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Certificates</h2>
            {issuedCertificates.length > 0 ? (
              <div className="space-y-3">
                {issuedCertificates.slice(0, 5).map((cert) => (
                  <div key={cert.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{cert.learnerName}</p>
                        <p className="text-sm text-gray-600">{cert.courseName}</p>
                        <p className="text-xs text-gray-500">
                          Asset ID: {cert.assetId} • {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Verify
                      </a>
                    </div>
                  </div>
                ))}
                {issuedCertificates.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    And {issuedCertificates.length - 5} more certificates...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500">No certificates issued yet</p>
                <p className="text-sm text-gray-400">Start issuing credentials to see activity here</p>
              </div>
            )}
          </div>
        </div>
        </main>
      </div>

      {/* Certificate Issuance Form Modal */}
      {showCertificateForm && connectedWallet && peraWallet && (
        <IssueCertificateForm
          onSubmit={handleIssueCertificate}
          isLoading={isIssuing}
          onCancel={() => {
            setShowCertificateForm(false);
            clearMessages();
          }}
          connectedWallet={connectedWallet}
        />
      )}
    </>
  );
};

export default OrganizationDashboard;