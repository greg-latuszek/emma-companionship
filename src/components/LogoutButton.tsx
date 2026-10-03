'use client';

import { motion } from 'motion/react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import type { JSX } from 'react';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';

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
  const surfaces = visualSurfaces(useVisualStyle());

  return (
    <motion.button
      type="button"
      aria-label="Wyloguj mnie"
      onClick={async () => {
        if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true') {
          await signOut({ redirect: false });
          window.location.href = '/';
        } else {
          void signOut({ callbackUrl: '/' });
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      className={`${surfaces.control} inline-flex items-center gap-3 px-4 sm:px-6`}
    >
      {showPicture ? (
        <span className={surfaces.face}>
          <img
            src={profilePicture ?? undefined}
            alt=""
            referrerPolicy="no-referrer"
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

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 shrink-0 sm:hidden"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span className="hidden sm:inline font-sans font-medium sm:text-base whitespace-nowrap">
        Wyloguj mnie
      </span>
    </motion.button>
  );
}
