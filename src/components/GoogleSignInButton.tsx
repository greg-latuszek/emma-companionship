'use client';

import { motion } from 'motion/react';
import { signIn } from 'next-auth/react';
import type { JSX } from 'react';
import { semiTransparentControlClassName } from '@/components/SemiTransparentButton';

interface GoogleSignInButtonProps {
  delay?: number;
}

export function GoogleSignInButton({ delay = 0.5 }: GoogleSignInButtonProps): JSX.Element {
  return (
    <motion.button
      type="button"
      onClick={() => {
        void signIn('google', { callbackUrl: '/auth/continue' });
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      className={semiTransparentControlClassName}
    >
      Zaloguj się
    </motion.button>
  );
}
