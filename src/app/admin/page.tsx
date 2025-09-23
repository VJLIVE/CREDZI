'use client';

import { useState } from 'react';

const AdminPage = () => {
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runMigration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setMigrationResult(result);
    } catch (error: any) {
      console.error('Migration failed:', error);
      setMigrationResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Database Migration</h2>
          <p className="text-gray-600 mb-4">
            Run this migration to add the certificates field to all existing users.
          </p>
          
          <button
            onClick={runMigration}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Running Migration...' : 'Run Migration'}
          </button>

          {migrationResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-bold mb-2">Migration Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(migrationResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;