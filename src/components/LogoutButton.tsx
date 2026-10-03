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

      <span className="font-sans font-medium text-sm sm:text-base whitespace-nowrap">
        Wyloguj mnie
      </span>
    </motion.button>
  );
}
