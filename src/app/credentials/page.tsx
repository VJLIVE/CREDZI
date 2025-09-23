'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import Navbar from '@/components/Navbar';

interface Certificate {
  _id: string;
  learnerName: string;
  learnerWallet: string;
  courseName: string;
  issuerWallet: string;
  organizationName: string;
  assetId: number;
  ipfsHash: string;
  metadata: {
    standard: string;
    description: string;
    external_url: string;
    properties: {
      certificate_type: string;
      issue_date: string;
      valid_from: string;
      valid_until: string;
      skills: string[];
      grade: string;
      score: number;
      verification_url: string;
    };
  };
  transactionId: string;
  transferTxId?: string;
  transferredToLearner: boolean;
  transferredAt?: string;
  status: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

const CredentialsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, hasRole, isLoading } = useWalletAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/');
      } else if (!hasRole('learner')) {
        if (hasRole('organization') || hasRole('admin')) {
          router.push('/dashboard/organization');
        } else {
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, hasRole, isLoading, router]);

  // Fetch certificates when user is authenticated
  useEffect(() => {
    const fetchCertificates = async () => {
      if (isAuthenticated && user?.walletId) {
        try {
          setLoadingCertificates(true);
          const response = await fetch(`/api/certificates/learner?walletId=${user.walletId}`);
          if (response.ok) {
            const data = await response.json();
            setCertificates(data.certificates);
          } else {
            console.error('Failed to fetch certificates');
          }
        } catch (error) {
          console.error('Error fetching certificates:', error);
        } finally {
          setLoadingCertificates(false);
        }
      }
    };

    fetchCertificates();
  }, [isAuthenticated, user?.walletId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full opacity-50 blur-3xl" style={{background: 'radial-gradient(circle at 60% 40%, #fff 70%, #f1f5f9 100%)'}} />
          <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full opacity-30 blur-2xl" style={{background: 'radial-gradient(circle at 40% 60%, #fafafa 80%, #e5e7eb 100%)'}} />
        </div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium">Loading...</p>
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
      <div className="relative min-h-screen pb-8">
        {/* Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 w-full h-full" style={{
            background: 'radial-gradient(ellipse 80% 60% at 60% 30%, #f9fafb 95%, #f1f5f9 100%)'
          }} />
          <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full opacity-50 blur-3xl" style={{background: 'radial-gradient(circle, #fff 80%, #f3f4f6 100%)'}}></div>
          <div className="absolute right-[-80px] top-[150px] w-[340px] h-[320px] rounded-full opacity-40 blur-2xl" style={{background: 'radial-gradient(circle, #e5e7eb 80%, #f3f4f6 100%)'}}></div>
        </div>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">My Credentials</h1>
            <p className="text-gray-600">View and manage your earned certificates</p>
          </div>

          {/* Loading State */}
          {loadingCertificates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : certificates.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Credentials Yet</h3>
              <p className="text-gray-500">You haven't earned any credentials yet. Start learning to earn your first certificate!</p>
            </div>
          ) : (
            /* Certificates Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <div
                  key={certificate._id}
                  className="bg-white bg-opacity-95 rounded-xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:border-gray-300"
                >
                  {/* Certificate Header */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(certificate.metadata.properties.grade)}`}>
                        {certificate.metadata.properties.grade}
                      </span>
                      <span className="text-xs text-gray-500">
                        Score: {certificate.metadata.properties.score}%
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{certificate.courseName}</h3>
                    <p className="text-sm text-gray-600">{certificate.organizationName}</p>
                  </div>

                  {/* Certificate Details */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Skills Earned</p>
                      <div className="flex flex-wrap gap-1">
                        {certificate.metadata.properties.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Issued Date</p>
                      <p className="text-sm text-gray-700">{formatDate(certificate.metadata.properties.issue_date)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valid Until</p>
                      <p className="text-sm text-gray-700">{formatDate(certificate.metadata.properties.valid_until)}</p>
                    </div>
                  </div>

                  {/* Certificate Actions */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">Asset ID:</span>
                      <span className="text-xs font-mono text-gray-700">{certificate.assetId}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default CredentialsPage;