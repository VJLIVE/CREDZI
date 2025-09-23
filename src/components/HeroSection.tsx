'use client';

import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="relative bg-white py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto text-center">

        {/* Professional Algorand Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center px-6 py-3 rounded-full bg-gray-50 shadow-md mb-10"
        >
          {/* Algorand Logo */}
          <img
            src="https://imgs.search.brave.com/UR09hCJEx4_5d_h6j914EsB5ExduABAsAkr0V0RmLA8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9hbGdv/cmFuZC1hbGdvLXB1/cnBsZS1kZXNpZ24t/dGVjaG5vbG9neS1i/YWNrZ3JvdW5kLWNy/eXB0by1jdXJyZW5j/eS1kaWdpdGFsLW1v/bmV5LWV4Y2hhbmdl/LXZlY2hhaW4tMjQz/NjkzNzI3LmpwZw"
            alt="Algorand Logo"
            className="w-6 h-6 mr-3"
          />
          <span className="text-gray-800 font-semibold text-sm">
            Powered by Algorand Blockchain
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black leading-tight mb-6"
        >
          The Future of Digital Credentials
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Secure, transparent, and tamper-proof platform for digital skill
          certificates. Institutions issue, learners own for life, employers
          verify instantly.
        </motion.p>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-6 mb-14 text-base sm:text-lg">
          {[
            'Blockchain Secured',
            'Instant Verification',
            'Global Portability',
            'QR-Based Access',
          ].map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center px-5 py-3 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition"
            >
              <svg
                className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 
                  8a1 1 0 01-1.414 0l-4-4a1 1 
                  0 011.414-1.414L8 12.586l7.293-7.293a1 
                  1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-black font-medium">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <button className="bg-blue-600 text-white px-10 py-4 rounded-lg text-lg font-semibold w-full sm:w-auto">
            Get Started
          </button>
        </motion.div>

        {/* Trust Indicators */}
        <div className="mt-20 pt-10 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-8">
            Trusted by leading institutions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 opacity-90">
            {['Institution 1', 'Institution 2', 'Institution 3', 'Institution 4'].map((name) => (
              <div
                key={name}
                className="h-14 w-36 rounded-md flex items-center justify-center bg-gray-100 text-gray-700 font-semibold shadow-sm hover:shadow-md transition"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
