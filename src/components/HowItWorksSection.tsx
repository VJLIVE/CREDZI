const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Institution Issues",
      description: "Educational institutions and training providers create and issue digital certificates on the Credzi platform using our secure interface.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "02",
      title: "Blockchain Stores",
      description: "Credentials are securely stored on the Algorand blockchain, creating an immutable and tamper-proof record of achievements.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "03",
      title: "Learner Owns",
      description: "Students receive their credentials in their digital wallet, giving them complete ownership and control over their achievements forever.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "from-green-500 to-emerald-500"
    },
    {
      number: "04",
      title: "QR Verification",
      description: "Employers can instantly verify credentials by scanning QR codes or accessing digital certificates through our verification portal.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Credzi Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A simple, secure, and transparent process that revolutionizes how educational credentials 
            are issued, stored, and verified.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 lg:space-y-0">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Content */}
              <div className="flex-1 max-w-lg">
                <div className="flex items-center mb-4">
                  <span className={`text-4xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mr-4`}>
                    {step.number}
                  </span>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white`}>
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {step.description}
                </p>
              </div>

              {/* Visual */}
              <div className="flex-1 max-w-lg">
                <div className={`relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100`}>
                  <div className={`w-full h-48 rounded-xl bg-gradient-to-br ${step.color} opacity-10 flex items-center justify-center`}>
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white shadow-xl`}>
                      {step.icon}
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                      Step {step.number}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {step.title}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 mt-24">
                  <div className="w-px h-12 bg-gradient-to-b from-blue-300 to-purple-300"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform -translate-x-1"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Process Flow Visualization */}
        <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Complete Process Flow
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
                  {step.icon}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute transform translate-x-20">
                    <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;