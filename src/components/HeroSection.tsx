'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

// --- Blockchain Network Data ---
const nodes = [
  [10, 20], [25, 15], [40, 10], [55, 30], [70, 25],
  [85, 15], [20, 50], [35, 40], [50, 35], [65, 60],
  [80, 55], [30, 70], [45, 80], [60, 65], [75, 90], [90, 80]
];

const lines = [
  [10, 20, 25, 15], [25, 15, 40, 10], [40, 10, 55, 30],
  [55, 30, 70, 25], [70, 25, 85, 15], [20, 50, 35, 40],
  [35, 40, 50, 35], [50, 35, 65, 60], [65, 60, 80, 55],
  [30, 70, 45, 80], [45, 80, 60, 65], [60, 65, 75, 90],
  [75, 90, 90, 80], [10, 20, 20, 50], [40, 10, 35, 40],
  [70, 25, 65, 60], [20, 50, 30, 70], [50, 35, 45, 80],
  [80, 55, 75, 90]
];

// --- Packet Animation Hook ---
const usePackets = () =>
  useMemo(
    () =>
      lines.map(([x1, y1, x2, y2]) => ({
        x1,
        y1,
        x2,
        y2,
        speed: 2 + Math.random() * 2,
        delay: Math.random() * 4,
      })),
    []
  );

const HeroSection = () => {
  const packets = usePackets();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 py-24 px-6 lg:px-8 min-h-[80vh] flex items-center justify-center">
      {/* --- Animated Blockchain Background --- */}
      <div className="absolute inset-0 z-0 opacity-70">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Lines */}
          <g stroke="#CBD5F0" strokeWidth="0.15">
            {lines.map(([x1, y1, x2, y2], idx) => (
              <motion.line
                key={`line-${idx}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: idx * 0.02 }}
              />
            ))}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map(([cx, cy], idx) => (
              <motion.circle
                key={`node-${idx}`}
                cx={cx}
                cy={cy}
                r="0.5"
                fill="#A8B6FF"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </g>

          {/* Packets */}
          <g>
            {packets.map((packet, idx) => (
              <motion.circle
                key={`packet-${idx}`}
                r="0.3"
                fill="#6366F1"
                animate={{
                  cx: [packet.x1, packet.x2],
                  cy: [packet.y1, packet.y2],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: packet.speed,
                  delay: packet.delay,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* --- Foreground Content --- */}
      <div className="relative z-10 max-w-6xl mx-auto text-center w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/80 text-blue-700 rounded-full text-sm font-medium mb-6 shadow-sm"
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
          Powered by Algorand Blockchain
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold leading-tight mb-6"
        >
          <span className="text-gray-900">Prove Your Skills,</span>{" "}
          <span className="text-blue-600">Advance Your Career</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10"
        >
          Secure, blockchain-verified certificates for vocational skills and professional training.
          Helping learners prove their expertise and employers verify qualifications instantly.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
        >
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all transform hover:scale-105">
            Get Started
          </button>
          <button className="border border-gray-300 bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 shadow-sm transition-all transform hover:scale-105">
            Learn More
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            {
              title: 'Skill Verification',
              description: 'Blockchain secured certificates that prove vocational skills and professional competencies.',
              icon: <ShieldCheck className="w-7 h-7 text-blue-600" />,
            },
            {
              title: 'Employer Recognition',
              description: 'Employers can instantly verify candidate skills and training completion through QR codes.',
              icon: <Zap className="w-7 h-7 text-blue-600" />,
            },
            {
              title: 'Career Mobility',
              description: 'Portable certificates that move with you across jobs, industries, and geographical locations.',
              icon: <Globe className="w-7 h-7 text-blue-600" />,
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-8 hover:shadow-xl transition-all duration-300 border border-white/60"
            >
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-100">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
