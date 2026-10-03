'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useSession } from 'next-auth/react';
import type { JSX } from 'react';
import { decorativeFrame } from '@/components/decorative-frame';

interface NavbarProps {
  rightContent?: React.ReactNode;
  logoDelay?: number;
  homeHref?: string;
}

function UnsignedInLogo(): JSX.Element {
  return (
    <div className="relative w-60 h-20 sm:w-64 sm:h-24">
      <Image
        src="/docs/img/logo_emmanuel_en-1.png"
        alt="Emmanuel Community"
        fill
        className="object-contain object-left object-top"
        quality={90}
      />
    </div>
  );
}

function SignedInLogo(): JSX.Element {
  return (
    <>
      <div className="relative h-16 w-32 sm:hidden">
        <Image
          src="/docs/img/logo_emma_companionship_narrow.png"
          alt="emmaCompanionship"
          fill
          className="object-contain"
          quality={90}
        />
      </div>
      <div className="relative hidden h-22 w-72 sm:block">
        <Image
          src="/docs/img/logo_emma_companionship.png"
          alt="emmaCompanionship"
          fill
          className="object-contain"
          quality={90}
        />
      </div>
    </>
  );
}

export function Navbar({
  rightContent,
  logoDelay = 0,
  homeHref,
}: NavbarProps): JSX.Element {
  const { status } = useSession();
  const isSignedIn = status === 'authenticated';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: logoDelay }}
      className={`${decorativeFrame.paddingClassName} relative w-full shrink-0 sticky top-0 z-30 backdrop-blur-sm`}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: logoDelay + 0.1 }}
        className="flex items-start pr-14 sm:pr-0"
      >
        {isSignedIn ? <SignedInLogo /> : <UnsignedInLogo />}
      </motion.div>

      {homeHref && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: logoDelay + 0.15 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Link
            href={homeHref}
            aria-label="Strona główna"
            className="flex items-center justify-center rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-12 w-12"
              aria-hidden="true"
            >
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a.075.075 0 0 1 .016-.018L12 5.432Z" />
            </svg>
          </Link>
        </motion.div>
      )}

      {rightContent && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: logoDelay + 0.2 }}
          className={`absolute ${decorativeFrame.topRightClassName}`}
        >
          {rightContent}
        </motion.div>
      )}
    </motion.nav>
  );
}
