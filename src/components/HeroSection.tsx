const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Powered by Algorand Blockchain
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Future of{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Digital Credentials
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Secure, transparent, and tamper-proof platform for digital skill certificates. 
            Institutions issue, learners own for life, employers verify instantly.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm sm:text-base">
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Blockchain Secured
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Instant Verification
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Global Portability
            </div>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              QR-Based Access
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto">
              Get Started
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200 w-full sm:w-auto">
              Watch Demo
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-6">Trusted by leading institutions</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center text-gray-600 font-semibold">
                Institution 1
              </div>
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center text-gray-600 font-semibold">
                Institution 2
              </div>
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center text-gray-600 font-semibold">
                Institution 3
              </div>
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center text-gray-600 font-semibold">
                Institution 4
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;