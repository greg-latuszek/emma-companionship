'use client';

import { motion } from 'motion/react';
import type { JSX } from 'react';
import { SemiTransparentButton } from '@/components/SemiTransparentButton';

interface LogoutButtonProps {
  userName: string;
  userEmail: string;
  href?: string;
  delay?: number;
}

/**
 * Logout button component that displays user info + logout action
 * Styled with SemiTransparentButton for consistency across the app
 *
 * Layout: User name and email on left, "Wyloguj mnie" text on right
 */
export function LogoutButton({
  userName,
  userEmail,
  href = '/',
  delay = 0,
}: LogoutButtonProps): JSX.Element {
  return (
    <SemiTransparentButton href={href} delay={delay}>
      <div className="flex items-center justify-between gap-6 min-w-min">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: (delay || 0) + 0.1 }}
          className="text-right"
        >
          <p className="font-medium text-sm sm:text-base">{userName}</p>
          <p className="text-xs sm:text-sm text-white/75">{userEmail}</p>
        </motion.div>

        {/* Logout Text */}
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: (delay || 0) + 0.2 }}
          className="font-sans font-medium text-sm sm:text-base"
        >
          Wyloguj mnie
        </motion.span>
      </div>
    </SemiTransparentButton>
  );
}
