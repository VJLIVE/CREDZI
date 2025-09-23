'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

interface CertificateData {
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
  learner: {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    walletId: string;
  };
  issuer: {
    name: string;
    organizationName?: string;
    email?: string;
    walletId: string;
  };
}

const VerifyPage = () => {
  const [certificateHash, setCertificateHash] = useState('');
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateHash.trim()) {
      setError('Please enter a certificate hash');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);

    try {
      const response = await fetch(`/api/certificates/verify?hash=${encodeURIComponent(certificateHash.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify certificate');
      }

      setCertificate(data.certificate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Certificate Verification
            </h1>
            <p className="text-xl text-gray-600">
              Enter a certificate hash to verify its authenticity and view details
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="certificateHash" className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Hash
                </label>
                <input
                  type="text"
                  id="certificateHash"
                  value={certificateHash}
                  onChange={(e) => setCertificateHash(e.target.value)}
                  placeholder="Enter the certificate hash (e.g., 87t65fftyvhgbgy7678776gugyh78uyhnhj)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  The unique hash identifier for the certificate you want to verify
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading || !certificateHash.trim()}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verify Certificate
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Certificate Details */}
          {certificate && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Certificate Verified</h2>
                    <p className="text-blue-100">Valid certificate found in the blockchain</p>
                  </div>
                  <div className="text-white">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Certificate Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Course Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Course Name</p>
                          <p className="font-medium text-gray-900">{certificate.courseName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(certificate.status)}`}>
                            {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                          </span>
                        </div>
                        {certificate.metadata.level && (
                          <div>
                            <p className="text-sm text-gray-600">Level</p>
                            <p className="font-medium text-gray-900 capitalize">{certificate.metadata.level}</p>
                          </div>
                        )}
                        {certificate.metadata.duration && (
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium text-gray-900">{certificate.metadata.duration}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Learner Information */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Learner Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium text-gray-900">{certificate.learner.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{certificate.learner.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Wallet ID</p>
                          <p className="font-mono text-xs text-gray-700 break-all">{certificate.learner.walletId}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Issuer Information */}
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Issuer Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Organization</p>
                          <p className="font-medium text-gray-900">{certificate.issuer.name}</p>
                        </div>
                        {certificate.issuer.email && (
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{certificate.issuer.email}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Wallet ID</p>
                          <p className="font-mono text-xs text-gray-700 break-all">{certificate.issuer.walletId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Certificate ID</p>
                          <p className="font-mono text-xs text-gray-700 break-all">{certificate.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Certificate Hash</p>
                          <p className="font-mono text-xs text-gray-700 break-all">{certificate.certificateHash}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Issued At</p>
                          <p className="font-medium text-gray-900">{formatDate(certificate.issuedAt)}</p>
                        </div>
                        {certificate.expiresAt && (
                          <div>
                            <p className="text-sm text-gray-600">Expires At</p>
                            <p className="font-medium text-gray-900">{formatDate(certificate.expiresAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {certificate.metadata.skills && certificate.metadata.skills.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Covered</h3>
                        <div className="flex flex-wrap gap-2">
                          {certificate.metadata.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-yellow-200 text-yellow-800 text-sm rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {certificate.metadata.description && (
                  <div className="mt-8 bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-700">{certificate.metadata.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyPage;