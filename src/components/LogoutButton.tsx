'use client';

import { motion } from 'motion/react';
import { signOut } from 'next-auth/react';
import type { JSX } from 'react';
import { semiTransparentControlClassName } from '@/components/SemiTransparentButton';

interface LogoutButtonProps {
  userName: string;
  userEmail: string;
  delay?: number;
}

export function LogoutButton({
  userName,
  userEmail,
  delay = 0,
}: LogoutButtonProps): JSX.Element {
  return (
    <motion.button
      type="button"
      onClick={() => {
        void signOut({ callbackUrl: '/' });
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      className={semiTransparentControlClassName}
    >
      <div className="flex items-center justify-between gap-6 min-w-min">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
          className="text-right normal-case tracking-normal"
        >
          <p className="font-medium text-sm sm:text-base">{userName}</p>
          <p className="text-xs sm:text-sm text-white/75">{userEmail}</p>
        </motion.div>

        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="font-sans font-medium text-sm sm:text-base"
        >
          Wyloguj mnie
        </motion.span>
      </div>
    </motion.button>
  );
}
