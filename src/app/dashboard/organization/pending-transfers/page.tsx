'use client';

import { useState, useEffect } from 'react';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { prepareAndSignTransferTransaction, checkAssetOptInStatus } from '@/lib/algorandUtils';
import { PeraWalletConnect } from '@perawallet/connect';
import Navbar from '@/components/Navbar';

interface PendingCertificate {
  id: string;
  learnerName: string;
  learnerWallet: string;
  courseName: string;
  organizationName: string;
  assetId: number;
  ipfsHash: string;
  transactionId: string;
  issuedAt: string;
  transferredToLearner: boolean;
}

interface TransferButtonProps {
  certificate: PendingCertificate;
  peraWallet: PeraWalletConnect | null;
  connectedWallet: string;
  onTransferComplete: (certificateId: string) => void;
}

const TransferButton: React.FC<TransferButtonProps> = ({ 
  certificate, 
  peraWallet, 
  connectedWallet, 
  onTransferComplete 
}) => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [isCheckingOptIn, setIsCheckingOptIn] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  const checkOptInStatus = async () => {
    setIsCheckingOptIn(true);
    setError('');
    try {
      console.log(`Checking opt-in status for wallet: ${certificate.learnerWallet}, Asset ID: ${certificate.assetId}`);
      
      // Add a small delay to ensure network propagation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const optInStatus = await checkAssetOptInStatus(certificate.learnerWallet, certificate.assetId);
      console.log(`Opt-in status result: ${optInStatus}`);
      setIsOptedIn(optInStatus);
      
      // If not opted in, provide more detailed feedback
      if (!optInStatus) {
        console.log('Asset not found in wallet holdings');
        setError('Asset not found in wallet. Please ensure the learner has opted into Asset ID: ' + certificate.assetId);
      } else {
        setError(''); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error checking opt-in status:', error);
      setError(`Failed to check opt-in status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Set to null to indicate unknown status
      setIsOptedIn(null);
    } finally {
      setIsCheckingOptIn(false);
    }
  };

  const handleTransfer = async () => {
    if (!peraWallet || !connectedWallet) {
      setError('Wallet not connected');
      return;
    }

    setIsTransferring(true);
    setError('');

    try {
      console.log('Proceeding with transfer without opt-in check...');

      // Prepare and sign transfer transaction
      const transferSignedResult = await prepareAndSignTransferTransaction(
        peraWallet,
        connectedWallet,
        certificate.learnerWallet,
        certificate.assetId
      );

      // Submit transfer transaction
      const transferResponse = await fetch('/api/transferCertificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateId: certificate.id,
          signedTransaction: transferSignedResult.signedTxn,
          learnerWallet: certificate.learnerWallet,
        }),
      });

      const transferData = await transferResponse.json();

      if (!transferResponse.ok) {
        throw new Error(transferData.error || 'Transfer failed');
      }

      // Notify parent component of successful transfer
      onTransferComplete(certificate.id);
      setError('');
      
    } catch (error: any) {
      console.error('Transfer error:', error);
      if (error.message.includes('User rejected')) {
        setError('Transaction was cancelled by user');
      } else if (error.message.includes('asset not found') || error.message.includes('not opted')) {
        setError('Learner has not opted into this asset. Please ask them to opt-in first.');
      } else {
        setError(error.message || 'Transfer failed');
      }
    } finally {
      setIsTransferring(false);
    }
  };

  useEffect(() => {
    // Check opt-in status when component mounts
    checkOptInStatus();
  }, [certificate.assetId, certificate.learnerWallet]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <button
          onClick={checkOptInStatus}
          disabled={isCheckingOptIn}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {isCheckingOptIn ? 'Checking...' : 'Check Opt-in'}
        </button>
        
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
        >
          Debug
        </button>
        
        {isOptedIn !== null && (
          <span className={`text-sm px-2 py-1 rounded ${
            isOptedIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOptedIn ? 'Opted In ✓' : 'Not Opted In ✗'}
          </span>
        )}
      </div>

      {showDebug && (
        <div className="bg-gray-100 p-3 rounded text-xs">
          <div><strong>Asset ID:</strong> {certificate.assetId}</div>
          <div><strong>Learner Wallet:</strong> {certificate.learnerWallet}</div>
          <div><strong>Opt-in Status:</strong> {isOptedIn === null ? 'Unknown' : isOptedIn.toString()}</div>
          <div><strong>Algorithm API:</strong> {process.env.NEXT_PUBLIC_ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud'}</div>
        </div>
      )}

      <button
        onClick={handleTransfer}
        disabled={isTransferring || isCheckingOptIn}
        className={`px-4 py-2 rounded text-white font-medium ${
          !isTransferring && !isCheckingOptIn
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {isTransferring ? 'Transferring...' : 'Transfer Certificate'}
      </button>

      {error && (
        <div className="text-red-600 text-sm mt-1">
          {error}
        </div>
      )}

      {!isOptedIn && isOptedIn !== null && (
        <div className="text-orange-600 text-sm mt-1">
          <div>Share Asset ID <strong>{certificate.assetId}</strong> with learner to opt-in</div>
          <div className="text-xs mt-1">
            Note: Opt-in check may be unreliable. Try transferring anyway - the blockchain will reject if not opted in.
          </div>
        </div>
      )}

      {isOptedIn === null && (
        <div className="text-blue-600 text-sm mt-1">
          <div>Asset ID: <strong>{certificate.assetId}</strong></div>
          <div className="text-xs mt-1">
            Opt-in status check disabled. Transfer will proceed and fail if learner hasn't opted in.
          </div>
        </div>
      )}
    </div>
  );
};

export default function PendingTransfersPage() {
  const { user, connectedWallet, peraWallet } = useWalletAuth();
  const [pendingCertificates, setPendingCertificates] = useState<PendingCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPendingCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/certificates/pending');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending certificates');
      }

      const data = await response.json();
      setPendingCertificates(data.certificates || []);
    } catch (error: any) {
      console.error('Error fetching pending certificates:', error);
      setError(error.message || 'Failed to load pending certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleManualUpdate = async (certificateId: string) => {
    try {
      const response = await fetch('/api/certificates/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateId: certificateId,
          transferredToLearner: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Remove from pending list
        setPendingCertificates(prev => prev.filter(cert => cert.id !== certificateId));
        setSuccessMessage('Certificate marked as transferred successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(`Failed to update certificate: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating certificate:', error);
      setError('Failed to update certificate status');
    }
  };

  const handleTransferComplete = (certificateId: string) => {
    // Remove the certificate from pending list immediately for better UX
    setPendingCertificates(prev => prev.filter(cert => cert.id !== certificateId));
    setSuccessMessage('Certificate transferred successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
    
    // Refresh the list from the server after a short delay to ensure database is updated
    setTimeout(() => {
      fetchPendingCertificates();
    }, 2000);
  };

  useEffect(() => {
    fetchPendingCertificates();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please connect your wallet to view pending transfers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending Certificate Transfers</h1>
          <p className="text-gray-600 mt-2">
            Manage certificates that have been issued but not yet transferred to learners
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between items-center">
            <span>{successMessage}</span>
            <button 
              onClick={fetchPendingCertificates}
              className="ml-4 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Refresh Now
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading pending certificates...</span>
          </div>
        ) : (
          /* Certificates List */
          <div className="bg-white rounded-lg shadow">
            {pendingCertificates.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Transfers</h3>
                <p className="text-gray-600">
                  All certificates have been successfully transferred to learners.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Certificate Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Learner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issued Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingCertificates.map((certificate) => (
                      <tr key={certificate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {certificate.courseName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {certificate.organizationName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {certificate.learnerName}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {certificate.learnerWallet.slice(0, 10)}...{certificate.learnerWallet.slice(-8)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {certificate.assetId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(certificate.issuedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <TransferButton
                              certificate={certificate}
                              peraWallet={peraWallet}
                              connectedWallet={connectedWallet || ''}
                              onTransferComplete={handleTransferComplete}
                            />
                            <button
                              onClick={() => handleManualUpdate(certificate.id)}
                              className="w-full px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                            >
                              Mark as Transferred
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-6 text-center space-x-4">
          <button
            onClick={fetchPendingCertificates}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh List'}
          </button>
          
          <button
            onClick={() => {
              // Force a hard refresh by clearing state first
              setPendingCertificates([]);
              setError('');
              setSuccessMessage('');
              setTimeout(fetchPendingCertificates, 100);
            }}
            disabled={loading}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            Force Refresh
          </button>
        </div>
      </div>
    </div>
  );
}