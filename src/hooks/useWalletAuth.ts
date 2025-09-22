'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PeraWalletConnect } from '@perawallet/connect';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  walletId: string;
  createdAt: string;
}

export const useWalletAuth = () => {
  const router = useRouter();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null);

  // Initialize Pera Wallet
  useEffect(() => {
    const wallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
    });
    setPeraWallet(wallet);

    // Check for existing session
    wallet.reconnectSession()
      .then((accounts) => {
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setConnectedWallet(accounts[0]);
          checkUserInDatabase(accounts[0]);
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });

    // Listen for disconnect events
    wallet.connector?.on('disconnect', () => {
      handleDisconnect();
    });

    return () => {
      if (wallet.connector) {
        wallet.connector.off('disconnect');
      }
    };
  }, []);

  const checkUserInDatabase = async (walletId: string) => {
    try {
      const response = await fetch('/api/wallet-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletId }),
      });

      const data = await response.json();
      
      if (data.exists) {
        setUser(data.user);
        sessionStorage.setItem('credzi_user', JSON.stringify(data.user));
      } else {
        setUser(null);
        sessionStorage.removeItem('credzi_user');
      }
    } catch (error) {
      console.error('Error checking wallet in database:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = useCallback(() => {
    setIsWalletConnected(false);
    setConnectedWallet(null);
    setUser(null);
    sessionStorage.removeItem('credzi_user');
    
    // Redirect to home if user is on a protected route
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/dashboard')) {
      router.push('/');
    }
  }, [router]);

  const disconnect = () => {
    if (peraWallet) {
      peraWallet.disconnect();
    }
    handleDisconnect();
  };

  // Check if user has the required role for a specific route
  const hasRole = (requiredRole: string) => {
    return user?.role === requiredRole;
  };

  // Check if user is authenticated (wallet connected and user exists in DB)
  const isAuthenticated = () => {
    return isWalletConnected && user !== null;
  };

  return {
    isWalletConnected,
    connectedWallet,
    user,
    isLoading,
    isAuthenticated: isAuthenticated(),
    hasRole,
    disconnect,
    checkUserInDatabase,
  };
};