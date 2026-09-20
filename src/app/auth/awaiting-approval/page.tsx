'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { JSX } from 'react';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { PageTitle } from '@/components/PageTitle';
import { PageCredit } from '@/components/PageCredit';

export default function AwaitingApprovalPage(): JSX.Element {
  return (
    <PageBackground
      id="awaiting-approval-container"
      imageSource="/docs/img/Christ_and_st_Menas.webp"
      imageAlt="Christ and St. Menas Background"
    >
      <AppArea>
        <Navbar />

        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.main
              key="awaiting-approval-view"
              className="flex flex-col items-center text-center px-6 sm:px-12 md:px-24 max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <PageTitle delay={0.3}>emmaCompanionship</PageTitle>

              <motion.div
                className="w-20 h-px bg-gradient-to-r from-white/0 via-white/40 to-white/0 mb-8 md:mb-10"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              />

              <motion.p
                className="max-w-xl text-base sm:text-lg md:text-xl leading-relaxed text-white/85 font-sans font-light tracking-wide drop-shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              >
                Oczekujemy akceptacji Administratora serwisu
              </motion.p>
            </motion.main>
          </AnimatePresence>
        </div>

        <PageCredit />
      </AppArea>
    </PageBackground>
  );
}
