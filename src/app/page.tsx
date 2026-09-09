'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { JSX } from 'react';
import { PageBackground } from '@/components/PageBackground';
import { Navbar } from '@/components/Navbar';
import { SemiTransparentLink } from '@/components/SemiTransparentButton';

export default function Home(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoaded, _setIsLoaded] = useState(true);

  return (
    <div
      id="welcome-container"
      className="min-h-screen w-full flex flex-col items-center justify-center text-white font-serif select-none overflow-hidden relative"
    >
      <PageBackground
        imageSource="/docs/img/Christ_and_st_Menas.webp"
        imageAlt="Christ and St. Menas Background"
      />

      {/* Navigation Bar */}
      <Navbar />

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
                className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] md:leading-[1.05] font-light tracking-tight mb-6 md:mb-8 drop-shadow-lg"
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '2px rgba(176, 205, 232, 0.4)',
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))',
                } as React.CSSProperties}
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
              <SemiTransparentLink href="/app/companionship-panel" delay={0.7} className="mt-12 md:mt-16">
                Zaloguj się
              </SemiTransparentLink>
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
