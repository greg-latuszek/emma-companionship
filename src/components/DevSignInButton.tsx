'use client';

import { motion } from 'motion/react';
import { signIn } from 'next-auth/react';
import type { JSX } from 'react';
import { semiTransparentControlSurfaceClassName } from '@/components/SemiTransparentButton';

interface DevSignInButtonProps {
  providerId: string;
  label: string;
  delay?: number;
}

export function DevSignInButton({ providerId, label, delay = 0.3 }: DevSignInButtonProps): JSX.Element {
  return (
    <motion.button
      type="button"
      aria-label={`Dev sign in as ${label} (bypass Google OAuth)`}
      onClick={async () => {
        const result = await signIn(providerId, { redirect: false });
        if (result?.ok !== false) {
          window.location.href = '/auth/continue';
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      className={`${semiTransparentControlSurfaceClassName} inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2 text-xs opacity-70`}
    >
      <span>⚙ {label}</span>
    </motion.button>
  );
}
