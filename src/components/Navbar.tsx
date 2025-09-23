'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import SignInModal from './SignInModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, hasRole, disconnect } = useWalletAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getDashboardLink = () => {
    if (user?.role === 'learner') {
      return '/dashboard/learner';
    } else if (user?.role === 'organization' || user?.role === 'admin') {
      return '/dashboard/organization';
    }
    return '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Credzi
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/verify" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Verify
              </Link>
              {!isAuthenticated && (
                <>
                  <Link 
                    href="#how-it-works" 
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    How it Works
                  </Link>
                  <Link 
                    href="#about" 
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    About
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Link 
                    href={getDashboardLink()}
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            {!isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsSignInModalOpen(true)}
                  className="text-gray-600 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
                <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4 relative">
                <span className="text-sm text-gray-600">
                  {user?.organizationName || `${user?.firstName} ${user?.lastName}` || 'User'}
                </span>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="text-blue-600 font-medium text-sm">
                      {user?.organizationName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          disconnect();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/verify" 
                className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Verify
              </Link>
              {!isAuthenticated && (
                <>
                  <Link 
                    href="#how-it-works" 
                    className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How it Works
                  </Link>
                  <Link 
                    href="#about" 
                    className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <button 
                    onClick={() => {
                      setIsSignInModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                  >
                    Sign In
                  </button>
                  <Link 
                    href="/signup" 
                    className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Link 
                    href={getDashboardLink()}
                    className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile"
                    className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <div className="flex items-center px-3 py-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium text-sm">
                        {user?.organizationName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {user?.organizationName || `${user?.firstName} ${user?.lastName}` || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-800 block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                  >
                    Disconnect Wallet
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sign In Modal */}
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;