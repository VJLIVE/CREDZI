'use client';

import { useState, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

interface PeraWalletProps {
  onWalletConnect: (walletId: string) => void;
  onWalletDisconnect: () => void;
  isConnected: boolean;
  connectedWallet: string | null;
}

const PeraWallet = ({ onWalletConnect, onWalletDisconnect, isConnected, connectedWallet }: PeraWalletProps) => {
  const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize Pera Wallet
    const wallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
    });
    setPeraWallet(wallet);

    // Check for existing connection
    wallet.reconnectSession().then((accounts) => {
      if (accounts.length > 0) {
        onWalletConnect(accounts[0]);
      }
    }).catch((e) => {
      console.log('No existing session found');
    });

    // Listen for wallet events
    wallet.connector?.on('disconnect', () => {
      onWalletDisconnect();
    });

    return () => {
      // Cleanup
      if (wallet.connector) {
        wallet.connector.off('disconnect');
      }
    };
  }, [onWalletConnect, onWalletDisconnect]);

  const handleConnect = async () => {
    if (!peraWallet) return;

    setIsLoading(true);
    try {
      const newAccounts = await peraWallet.connect();
      if (newAccounts.length > 0) {
        onWalletConnect(newAccounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect to Pera Wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (peraWallet) {
      peraWallet.disconnect();
      onWalletDisconnect();
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && connectedWallet) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-green-800">Wallet Connected</p>
              <p className="text-xs text-green-600 font-mono">{formatWalletAddress(connectedWallet)}</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13z"/>
              <path d="M7 12h10M7 16h10M7 8h10"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Pera Wallet</h3>
          <p className="text-sm text-gray-600">
            Connect your Pera wallet to create an account on Credzi. Your wallet address will be securely stored with your profile.
          </p>
        </div>
        
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </div>
          ) : (
            'Connect Pera Wallet'
          )}
        </button>
        
        <p className="text-xs text-gray-500 mt-3">
          Make sure you have the Pera Wallet app installed on your device
        </p>
      </div>
    </div>
  );
};

export default PeraWallet;