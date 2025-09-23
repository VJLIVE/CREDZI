'use client';

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Institution Issues",
      description:
        "Educational institutions and training providers create and issue digital certificates on the Credzi platform using our secure interface.",
      color: "from-blue-500 to-cyan-500",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Blockchain Stores",
      description:
        "Credentials are securely stored on the Algorand blockchain, creating an immutable and tamper-proof record of achievements.",
      color: "from-purple-500 to-pink-500",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Learner Owns",
      description:
        "Students receive their credentials in their digital wallet, giving them complete ownership and control over their achievements forever.",
      color: "from-green-500 to-emerald-500",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      number: "04",
      title: "QR Verification",
      description:
        "Employers can instantly verify credentials by scanning QR codes or accessing digital certificates through our verification portal.",
      color: "from-orange-500 to-red-500",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-28 px-6 lg:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How <span className="text-blue-600">Credzi Works</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            A simple, secure, and transparent process that revolutionizes how educational credentials are issued, stored, and verified.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-16 lg:gap-24">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Icon with number */}
              <div className="flex-shrink-0 flex flex-col items-center lg:items-start lg:mr-12 mb-6 lg:mb-0">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white shadow-md`}
                >
                  {step.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-4">
                  Step {step.number}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 max-w-xl text-center lg:text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Process Flow */}
        <div className="mt-28 bg-white rounded-3xl p-10 shadow-xl">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Complete Process Flow
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-12 md:space-y-0 md:space-x-6">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center relative">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white mb-4 shadow-lg`}
                >
                  {step.icon}
                </div>
                <div className="text-sm font-semibold text-gray-900">{step.title}</div>

                {/* Arrows between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute right-[-80px] top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-8 h-8 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
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
