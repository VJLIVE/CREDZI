'use client';

import { useState } from 'react';

interface IssueCertificateFormProps {
  onSubmit: (formData: CertificateFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
  connectedWallet: string; // Add connected wallet prop
}

export interface CertificateFormData {
  learnerName: string;
  learnerWallet: string;
  courseName: string;
  organizationName?: string;
  description?: string;
  skills?: string[];
  grade?: string;
  score?: number;
  validUntil?: string;
  issuerWallet: string; // Add issuer wallet address
}

const IssueCertificateForm: React.FC<IssueCertificateFormProps> = ({
  onSubmit,
  isLoading,
  onCancel,
  connectedWallet,
}) => {
  const [formData, setFormData] = useState<CertificateFormData>({
    learnerName: '',
    learnerWallet: '',
    courseName: '',
    organizationName: '',
    description: '',
    skills: [],
    grade: '',
    score: undefined,
    validUntil: '',
    issuerWallet: connectedWallet,
  });

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.learnerName.trim()) {
      newErrors.learnerName = 'Learner name is required';
    }

    if (!formData.learnerWallet.trim()) {
      newErrors.learnerWallet = 'Learner wallet address is required';
    } else if (formData.learnerWallet.length !== 58) {
      newErrors.learnerWallet = 'Invalid Algorand wallet address format';
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }

    if (formData.score !== undefined && (formData.score < 0 || formData.score > 100)) {
      newErrors.score = 'Score must be between 0 and 100';
    }

    if (formData.validUntil && new Date(formData.validUntil) <= new Date()) {
      newErrors.validUntil = 'Valid until date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CertificateFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || [],
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Issue New Certificate</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="learnerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Learner Name *
                </label>
                <input
                  type="text"
                  id="learnerName"
                  value={formData.learnerName}
                  onChange={(e) => handleInputChange('learnerName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.learnerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter learner's full name"
                  disabled={isLoading}
                />
                {errors.learnerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.learnerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  id="courseName"
                  value={formData.courseName}
                  onChange={(e) => handleInputChange('courseName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.courseName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter course or program name"
                  disabled={isLoading}
                />
                {errors.courseName && (
                  <p className="mt-1 text-sm text-red-600">{errors.courseName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="learnerWallet" className="block text-sm font-medium text-gray-700 mb-2">
                Learner Wallet Address *
              </label>
              <input
                type="text"
                id="learnerWallet"
                value={formData.learnerWallet}
                onChange={(e) => handleInputChange('learnerWallet', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm ${
                  errors.learnerWallet ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter Algorand wallet address (58 characters)"
                disabled={isLoading}
              />
              {errors.learnerWallet && (
                <p className="mt-1 text-sm text-red-600">{errors.learnerWallet}</p>
              )}
            </div>

            {/* Optional Fields */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Your organization name"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                    Grade
                  </label>
                  <select
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">Select grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="Pass">Pass</option>
                    <option value="Merit">Merit</option>
                    <option value="Distinction">Distinction</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-100)
                  </label>
                  <input
                    type="number"
                    id="score"
                    min="0"
                    max="100"
                    value={formData.score || ''}
                    onChange={(e) => handleInputChange('score', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors.score ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter numerical score"
                    disabled={isLoading}
                  />
                  {errors.score && (
                    <p className="mt-1 text-sm text-red-600">{errors.score}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    id="validUntil"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors.validUntil ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.validUntil && (
                    <p className="mt-1 text-sm text-red-600">{errors.validUntil}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Certificate description or additional details"
                  disabled={isLoading}
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Competencies
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Add a skill and press Enter"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isLoading || !skillInput.trim()}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        disabled={isLoading}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                disabled={isLoading}
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Issuing Certificate...' : 'Issue Certificate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IssueCertificateForm;