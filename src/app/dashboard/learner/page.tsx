'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import Navbar from '@/components/Navbar';

const LearnerDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, hasRole, isLoading } = useWalletAuth();
  const [credentialsCount, setCredentialsCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState<boolean>(true);

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

  // Fetch credentials count when user is authenticated
  useEffect(() => {
    const fetchCredentialsCount = async () => {
      if (isAuthenticated && user?.walletId) {
        try {
          setLoadingCount(true);
          const response = await fetch(`/api/certificates/count?walletId=${user.walletId}`);
          if (response.ok) {
            const data = await response.json();
            setCredentialsCount(data.count);
          } else {
            console.error('Failed to fetch credentials count');
          }
        } catch (error) {
          console.error('Error fetching credentials count:', error);
        } finally {
          setLoadingCount(false);
        }
      }
    };

    fetchCredentialsCount();
  }, [isAuthenticated, user?.walletId]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Soft white gradient corners */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full opacity-50 blur-3xl" style={{background: 'radial-gradient(circle at 60% 40%, #fff 70%, #f1f5f9 100%)'}} />
          <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full opacity-30 blur-2xl" style={{background: 'radial-gradient(circle at 40% 60%, #fafafa 80%, #e5e7eb 100%)'}} />
        </div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium">Checking authentication...</p>
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
        {/* Unique white/gray mesh background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Main subtle base vignette */}
          <div className="absolute inset-0 w-full h-full" style={{
            background: 'radial-gradient(ellipse 80% 60% at 60% 30%, #f9fafb 95%, #f1f5f9 100%)'
          }} />
          {/* Soft white mesh blobs */}
          <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full opacity-50 blur-3xl" style={{background: 'radial-gradient(circle, #fff 80%, #f3f4f6 100%)'}}></div>
          <div className="absolute right-[-80px] top-[150px] w-[340px] h-[320px] rounded-full opacity-40 blur-2xl" style={{background: 'radial-gradient(circle, #e5e7eb 80%, #f3f4f6 100%)'}}></div>
          <div className="absolute left-1/2 bottom-[-160px] w-[500px] h-[300px] rounded-full opacity-20 blur-2xl" style={{background: 'radial-gradient(circle, #e0e7ef 60%, transparent 100%)'}}></div>
        </div>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div
            className="bg-white bg-opacity-90 rounded-2xl shadow-xl ring-2 ring-gray-200 p-8 mb-10 border-2 border-transparent hover:border-gray-300 transition-all duration-300"
            style={{
              boxShadow: "0 8px 32px 0 rgba(220, 220, 220, 0.14), 0 1.5px 8px 0 rgba(240,240,240,0.10)",
              backdropFilter: "saturate(180%) blur(7px)"
            }}
          >
            <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
              Welcome to Your Learning Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Track your progress, manage credentials, and explore your achievements.
            </p>
            {user?.walletId && (
              <div className="mt-5 p-3 bg-gradient-to-r from-white to-gray-100 border border-gray-200 rounded-lg shadow-inner">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Connected Wallet: </span>
                  <span className="font-mono">{user.walletId.slice(0, 6)}...{user.walletId.slice(-4)}</span>
                </p>
              </div>
            )}
          </div>
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* My Credentials */}
            <div className="bg-white bg-opacity-95 rounded-xl p-8 shadow-xl border-2 border-gray-300 ring-2 ring-gray-100 transition hover:ring-gray-300 hover:border-gray-400
              relative before:content-[''] before:block before:absolute before:inset-0 before:rounded-xl before:pointer-events-none before:blur-md before:opacity-50 before:z-[-1] before:bg-gradient-to-tr before:from-white before:via-gray-100 before:to-gray-200"
            >
              <div className="flex items-center mb-5">
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center shadow border border-gray-200">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-bold text-gray-900">My Credentials</h3>
                  <p className="text-gray-600 text-base">View and manage your earned credentials</p>
                </div>
              </div>
              <div className="text-center mt-5">
                {loadingCount ? (
                  <div className="animate-pulse">
                    <div className="w-16 h-10 bg-gray-200 rounded mx-auto mb-2"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-4xl font-extrabold text-gray-700 drop-shadow">{credentialsCount}</p>
                    <p className="text-base text-gray-400 mb-4">Credentials Earned</p>
                    <button
                      onClick={() => router.push('/credentials')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      View All Credentials
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Recent Activity */}
            <div className="bg-white bg-opacity-95 rounded-xl p-8 shadow-xl border-2 border-gray-300 ring-2 ring-gray-100 transition hover:ring-gray-300 hover:border-gray-400
              relative before:content-[''] before:block before:absolute before:inset-0 before:rounded-xl before:pointer-events-none before:blur-md before:opacity-30 before:z-[-1] before:bg-gradient-to-br before:from-gray-100 before:via-gray-50 before:to-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-5">Recent Activity</h2>
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No recent activity</p>
                <p className="text-sm text-gray-400">Start learning to see your progress here</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default LearnerDashboard;
