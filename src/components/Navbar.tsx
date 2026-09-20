'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useSession } from 'next-auth/react';
import type { JSX } from 'react';
import { decorativeFrame } from '@/components/decorative-frame';

interface NavbarProps {
  rightContent?: React.ReactNode;
  logoDelay?: number;
}

function UnsignedInLogo(): JSX.Element {
  return (
    <div className="relative w-60 h-60 sm:w-64 sm:h-24">
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
      <div className="relative h-32 w-32 sm:hidden">
        <Image
          src="/docs/img/logo_emma_companionship_square.png"
          alt="emmaCompanionship"
          fill
          className="object-contain"
          quality={90}
        />
      </div>
      <div className="relative hidden h-24 w-72 sm:block">
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
}: NavbarProps): JSX.Element {
  const { status } = useSession();
  const isSignedIn = status === 'authenticated';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: logoDelay }}
      className={`${decorativeFrame.paddingClassName} relative w-full shrink-0`}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: logoDelay + 0.1 }}
        className="flex items-start pr-14 sm:pr-0"
      >
        {isSignedIn ? <SignedInLogo /> : <UnsignedInLogo />}
      </motion.div>

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
