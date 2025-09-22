'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import LearnerProfile from '@/components/profile/LearnerProfile';
import OrganizationProfile from '@/components/profile/OrganizationProfile';
import Navbar from '@/components/Navbar';

const ProfilePage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useWalletAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Render different profile components based on user role
  const renderProfileByRole = () => {
    switch (user?.role) {
      case 'learner':
        return <LearnerProfile user={user} />;
      case 'organization':
      case 'admin':
        return <OrganizationProfile user={user} />;
      default:
        return (
          <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.598 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Role</h2>
                <p className="text-gray-600 mb-4">Your account role is not recognized.</p>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return renderProfileByRole();
};

export default ProfilePage;