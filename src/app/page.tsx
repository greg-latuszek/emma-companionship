'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div
      id="welcome-container"
      className="min-h-screen w-full flex flex-col items-center justify-center text-white font-serif select-none overflow-hidden relative"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Image
          src="/docs/img/Christ_and_st_Menas.webp"
          alt="Christ and St. Menas Background"
          fill
          className="object-cover object-top"
          priority
          quality={85}
        />
      </div>

      {/* Dark Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 z-10 pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-40 px-6 sm:px-12 py-6 sm:py-8 flex items-center justify-between">
        {/* Logo on the left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isLoaded ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
            <div className="relative w-72 h-72 sm:w-74 sm:h-34">
            <Image
              src="/docs/img/logo_emmanuel_en-1.png"
              alt="Emmanuel Community Logo"
              fill
              className="object-contain"
              quality={90}
            />
          </div>
        </motion.div>

      </nav>

      {/* Decorative Outer Border */}
      <div className="absolute inset-0 pointer-events-none border-[16px] sm:border-[32px] border-white/15 z-30"></div>

      {/* Main Content - Centered */}
      <div className="w-full h-full flex flex-col items-center justify-center z-20 relative px-4">
        <AnimatePresence mode="wait">
          {isLoaded && (
            <motion.main
              key="home-view"
              className="flex flex-col items-center text-center px-6 sm:px-12 md:px-24 max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >

              {/* Main Title */}
              <motion.h1
                className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] md:leading-[1.05] font-light tracking-tight text-white mb-6 md:mb-8 drop-shadow-lg"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              >
                emmaCompanionship
              </motion.h1>

              {/* Divider Line */}
              <motion.div
                className="w-20 h-px bg-gradient-to-r from-white/0 via-white/40 to-white/0 mb-8 md:mb-10"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              />

              {/* Subtitle */}
              <motion.p
                className="max-w-xl text-base sm:text-lg md:text-xl leading-relaxed text-white/85 font-sans font-light tracking-wide drop-shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              >
                Serwis dla Delegatów ds. Akompaniamentów
              </motion.p>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                className="mt-12 md:mt-16 px-8 sm:px-12 py-3 sm:py-4 rounded-full bg-white/15 hover:bg-white/25 border border-white/35 text-white font-sans font-medium text-sm sm:text-base uppercase tracking-widest transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl"
              >
                Zaloguj się
              </motion.button>
            </motion.main>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info - Left */}
      <div className="absolute bottom-8 left-8 sm:bottom-16 sm:left-16 z-30 pointer-events-none">
        <div className="flex flex-col font-sans text-[11px] text-white/70 tracking-[0.3em] uppercase leading-relaxed text-left">
          <span>© Emmanuel Community 2026</span>
        </div>
      </div>

    </div>
  );
}
