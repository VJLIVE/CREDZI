'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import Navbar from '@/components/Navbar';

interface Certificate {
  id: string;
  certificateHash: string;
  courseName: string;
  status: string;
  issuedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    description?: string;
    skills?: string[];
    duration?: string;
    level?: string;
  };
  issuer: {
    name: string;
    organizationName?: string;
    email?: string;
    walletId: string;
  };
}

interface LearnerData {
  name: string;
  email: string;
  walletId: string;
}

const CredentialsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, hasRole, isLoading } = useWalletAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [learnerData, setLearnerData] = useState<LearnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [certificatesFetched, setCertificatesFetched] = useState(false);


  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (!hasRole('learner')) {
      if (hasRole('organization') || hasRole('admin')) {
        router.push('/dashboard/organization');
      } else {
        router.push('/');
      }
      return;
    }

    if (user?.walletId && !certificatesFetched) {
      const fetchCertificates = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/learner/certificates?walletId=${encodeURIComponent(user.walletId)}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch certificates');
          }

          setCertificates(data.certificates || []);
          setLearnerData(data.learner);
          setCertificatesFetched(true);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCertificates();
    }
  }, [isLoading, isAuthenticated, user?.walletId, certificatesFetched, hasRole, router]);

  // fetchCertificates moved inside useEffect

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleVerifyCertificate = (certificateHash: string) => {
    router.push(`/verify?hash=${encodeURIComponent(certificateHash)}`);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !hasRole('learner')) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Credentials</h1>
                <p className="mt-2 text-gray-600">
                  View and manage your earned certificates and credentials
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/learner')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>

            {/* Stats */}
            {learnerData && (
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Learner Name</p>
                    <p className="text-lg font-semibold text-gray-900">{learnerData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Certificates</p>
                    <p className="text-lg font-semibold text-blue-600">{certificates.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wallet ID</p>
                    <p className="text-sm font-mono text-gray-700">{learnerData.walletId.slice(0, 10)}...{learnerData.walletId.slice(-6)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Certificates Grid */}
          {certificates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
              <p className="text-gray-600 mb-6">You haven't earned any certificates yet. Start learning to earn your first credential!</p>
              <button
                onClick={() => router.push('/dashboard/learner')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Explore Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Certificate Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(certificate.status)}`}>
                        {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Certificate Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{certificate.courseName}</h3>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Issued by</p>
                        <p className="text-sm font-medium text-gray-900">{certificate.issuer.name}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600">Issued on</p>
                        <p className="text-sm text-gray-900">{formatDate(certificate.issuedAt)}</p>
                      </div>

                      {certificate.metadata.level && (
                        <div>
                          <p className="text-xs text-gray-600">Level</p>
                          <p className="text-sm text-gray-900 capitalize">{certificate.metadata.level}</p>
                        </div>
                      )}

                      {certificate.metadata.skills && certificate.metadata.skills.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {certificate.metadata.skills.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                            {certificate.metadata.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{certificate.metadata.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Certificate Hash */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Certificate Hash</p>
                      <p className="text-xs font-mono text-gray-700 break-all">{certificate.certificateHash}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerifyCertificate(certificate.certificateHash)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(certificate.certificateHash)}
                        className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        title="Copy Hash"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CredentialsPage;