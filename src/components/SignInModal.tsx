'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PeraWallet from './PeraWallet';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const router = useRouter();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWalletConnect = useCallback((walletId: string) => {
    setIsWalletConnected(true);
    setConnectedWallet(walletId);
    setError(null);
  }, []);

  const handleWalletDisconnect = useCallback(() => {
    setIsWalletConnected(false);
    setConnectedWallet(null);
    setError(null);
  }, []);

  const handleUserFound = useCallback((user: any) => {
    // Close modal and redirect to appropriate dashboard
    onClose();
    if (user.role === 'learner') {
      router.push('/dashboard/learner');
    } else if (user.role === 'organization' || user.role === 'admin') {
      router.push('/dashboard/organization');
    }
  }, [router, onClose]);

  const handleUserNotFound = useCallback(() => {
    setError('Wallet not found. Please sign up first or connect the correct wallet.');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sign In to Credzi
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 text-center mb-6">
              Connect your Pera wallet to sign in to your Credzi account
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
                <div className="mt-2">
                  <button
                    onClick={onClose}
                    className="text-sm underline hover:no-underline"
                  >
                    Go to Sign Up
                  </button>
                </div>
              </div>
            )}

            {/* Wallet Connection */}
            <PeraWallet
              onWalletConnect={handleWalletConnect}
              onWalletDisconnect={handleWalletDisconnect}
              onUserFound={handleUserFound}
              onUserNotFound={handleUserNotFound}
              isConnected={isWalletConnected}
              connectedWallet={connectedWallet}
            />
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>Don't have an account?</p>
            <button
              onClick={() => {
                onClose();
                router.push('/signup');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;