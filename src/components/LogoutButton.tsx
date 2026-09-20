'use client';

import { motion } from 'motion/react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import type { JSX } from 'react';
import { semiTransparentControlClassName } from '@/components/SemiTransparentButton';

interface LogoutButtonProps {
  profilePicture?: string | null;
  email: string;
  delay?: number;
}

export function LogoutButton({
  profilePicture,
  email,
  delay = 0,
}: LogoutButtonProps): JSX.Element {
  const [pictureFailed, setPictureFailed] = useState(false);
  const showPicture = Boolean(profilePicture) && !pictureFailed;

  return (
    <motion.button
      type="button"
      aria-label="Wyloguj mnie"
      onClick={() => {
        void signOut({ callbackUrl: '/' });
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      className={`${semiTransparentControlClassName} inline-flex items-center gap-3 px-4 sm:px-6`}
    >
      {showPicture ? (
        <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/20 ring-1 ring-white/40">
          <img
            src={profilePicture ?? undefined}
            alt=""
            className="h-full w-full object-cover"
            onError={() => {
              setPictureFailed(true);
            }}
          />
        </span>
      ) : (
        <span className="max-w-[12rem] truncate normal-case tracking-normal text-sm font-medium">
          {email}
        </span>
      )}

      <span className="font-sans font-medium text-sm sm:text-base whitespace-nowrap">
        Wyloguj mnie
      </span>
    </motion.button>
  );
}
