'use client';

import { useState } from 'react';

interface IssueCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { walletId: string; courseName: string }) => void;
}

const IssueCredentialModal = ({ isOpen, onClose, onSubmit }: IssueCredentialModalProps) => {
  const [walletId, setWalletId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletId.trim() || !courseName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ walletId: walletId.trim(), courseName: courseName.trim() });
      // Reset form
      setWalletId('');
      setCourseName('');
      onClose();
    } catch (error) {
      console.error('Error issuing credential:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setWalletId('');
      setCourseName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Issue New Credential</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Wallet ID Field */}
            <div>
              <label htmlFor="walletId" className="block text-sm font-medium text-gray-700 mb-2">
                Learner Wallet ID
              </label>
              <input
                type="text"
                id="walletId"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                placeholder="Enter learner's wallet address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                The Algorand wallet address of the learner
              </p>
            </div>

            {/* Course Name Field */}
            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Enter course name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                The name of the course for which the credential is being issued
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !walletId.trim() || !courseName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Issuing...
                </>
              ) : (
                'Issue Credential'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueCredentialModal;