'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { JSX } from 'react';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { DevSignInButton } from '@/components/DevSignInButton';
import { PageTitle } from '@/components/PageTitle';
import { PageCredit } from '@/components/PageCredit';

export default function Home(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoaded, _setIsLoaded] = useState(true);

  return (
    <PageBackground
      id="welcome-container"
      imageSource="/docs/img/Christ_and_st_Menas.webp"
      imageAlt="Christ and St. Menas Background"
    >
      <AppArea>
        <Navbar
          rightContent={
            <>
              {process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true' && (
                <>
                  <DevSignInButton providerId="dev-cd1" label="CD1" delay={0.2} />
                  <DevSignInButton providerId="dev-cd2" label="CD2" delay={0.3} />
                </>
              )}
              <GoogleSignInButton delay={0.5} />
            </>
          }
        />

        <div className="flex flex-1 flex-col items-center justify-center px-4">
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
                <PageTitle delay={0.3}>
                  emma Companionship
                </PageTitle>

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
                  Serwis dla Delegatów ds. Akompaniamentów
                </motion.p>
              </motion.main>
            )}
          </AnimatePresence>
        </div>

        <PageCredit />
      </AppArea>
    </PageBackground>
  );
}
