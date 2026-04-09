import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_MESSAGES = [
  "Initializing Quantum Bridge...",
  "Canalizing Assets to Engine Core...",
  "Establishing Neural Link...",
  "Syncing GitHub Repository Tree...",
  "Finalizing Core Synchronization...",
  "Neural Link Established!"
];

const FlippyCoreSync: React.FC = () => {
  const [statusIndex, setStatusIndex] = useState(0);

  // Memoize random values used for particles to ensure component purity
  const bgParticles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      x: Math.random() > 0.5 ? -100 : 500,
      y: Math.random() * 300,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  }, []);

  const dataBits = useMemo(() => {
    return [...Array(10)].map((_, i) => ({
      id: i,
      yOffset: (Math.random() - 0.5) * 100,
      xOffset: (Math.random() - 0.5) * 400,
      delay: i * 0.3,
      hex: Math.random().toString(16).substring(2, 8)
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex(prev => (prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[320px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-black">
      {/* Background Flow Particles */}
      <div className="absolute inset-0 opacity-20">
        {bgParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
                x: p.x, 
                y: p.y, 
                opacity: 0,
                scale: 0 
            }}
            animate={{ 
                x: 200, 
                y: 150, 
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0] 
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "circIn"
            }}
            className="absolute w-1 h-1 bg-flippy-blue rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* The Core */}
      <div className="relative z-10">
        {/* Core Outer Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-flippy-blue/20 rounded-full blur-3xl"
        />
        
        {/* Main Core Sphere */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 1, ease: "backOut" }}
          className="relative w-24 h-24 rounded-full border-2 border-flippy-blue/30 flex items-center justify-center bg-black/40 backdrop-blur-md overflow-hidden"
        >
          {/* Internal Swirl */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-t-2 border-r-2 border-flippy-blue/40 rounded-full"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border-b-2 border-l-2 border-flippy-purple/40 rounded-full"
          />
          
          {/* Center Light */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 10px #0094FF",
                "0 0 30px #0094FF",
                "0 0 10px #0094FF"
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-4 h-4 bg-white rounded-full"
          />
        </motion.div>

        {/* Pulsing Rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut"
            }}
            className="absolute inset-0 border border-flippy-blue/30 rounded-full"
          />
        ))}
      </div>

      {/* Status Messages */}
      <div className="mt-12 h-6 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={statusIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-[11px] font-bold text-flippy-blue uppercase tracking-[0.2em]"
          >
            {STATUS_MESSAGES[statusIndex]}
          </motion.div>
        </AnimatePresence>
        
        {/* Progress Bar */}
        <div className="w-48 h-1 bg-white/[0.05] rounded-full mt-4 overflow-hidden relative">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="absolute h-full bg-gradient-to-r from-flippy-blue to-flippy-purple"
          />
        </div>
      </div>
      
      {/* Floating Data Bits */}
      <div className="absolute inset-0 pointer-events-none">
          {dataBits.map((d) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 150, x: 200 }}
                animate={{ 
                    opacity: [0, 1, 0],
                    y: 150 + d.yOffset,
                    x: 200 + d.xOffset
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: d.delay }}
                className="absolute text-[8px] text-white/10 font-mono"
              >
                  {d.hex}
              </motion.div>
          ))}
      </div>
    </div>
  );
};

export default FlippyCoreSync;
