'use client';

import { motion } from 'framer-motion';

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

  const nodes = [
    [5, 10], [10, 20], [20, 30], [30, 40], [40, 50],
    [50, 60], [15, 65], [25, 70], [35, 20], [60, 15],
    [70, 35], [85, 20], [80, 55], [90, 75], [95, 40]
  ];

  const lines = [
    [5, 10, 35, 15], [10, 20, 40, 10], [20, 30, 60, 25],
    [30, 40, 70, 35], [40, 50, 80, 45], [50, 60, 90, 55],
    [15, 65, 45, 75], [25, 70, 60, 80], [35, 20, 75, 10],
    [60, 15, 85, 20], [70, 35, 95, 40]
  ];

  return (
    <section className="relative py-28 px-6 lg:px-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 overflow-hidden">
      {/* Animated Background */}
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
        <g stroke="#94a3b8" strokeWidth="0.5">
          {lines.map(([x1, y1, x2, y2], idx) => (
            <motion.line
              key={idx}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              animate={{
                x1: [`${x1}%`, `${x1 + Math.random()*5 - 2.5}%`, `${x1}%`],
                y1: [`${y1}%`, `${y1 + Math.random()*5 - 2.5}%`, `${y1}%`],
                x2: [`${x2}%`, `${x2 + Math.random()*5 - 2.5}%`, `${x2}%`],
                y2: [`${y2}%`, `${y2 + Math.random()*5 - 2.5}%`, `${y2}%`],
              }}
              transition={{
                duration: 8 + Math.random()*4,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          ))}
        </g>
        <g fill="#60a5fa">
          {nodes.map(([cx, cy], idx) => (
            <motion.circle
              key={idx}
              cx={`${cx}%`}
              cy={`${cy}%`}
              r="4"
              animate={{
                cx: [`${cx}%`, `${cx + Math.random()*5 - 2.5}%`, `${cx}%`],
                cy: [`${cy}%`, `${cy + Math.random()*5 - 2.5}%`, `${cy}%`],
              }}
              transition={{
                duration: 6 + Math.random()*4,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          ))}
        </g>
      </svg>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How <span className="text-blue-600">Credzi Works</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            A simple, secure, and transparent process that revolutionizes how educational credentials are issued, stored, and verified.
          </p>
        </div>

        {/* Vertical timeline with horizontal branches */}
        <div className="relative">
          {/* Central vertical line */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-300 h-full"></div>

          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div key={index} className="relative mb-32 w-full flex">
                {/* Horizontal branch */}
                <div className={`absolute top-10 ${isLeft ? 'left-1/2 w-1/2' : 'left-0 w-1/2'} h-1 bg-gray-300`}></div>

                {/* Box */}
                <div className={`relative ${isLeft ? 'mr-auto pr-8 text-right' : 'ml-auto pl-8 text-left'} max-w-md`}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-base">{step.description}</p>
                  </div>
                </div>

                {/* Circle node */}
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
