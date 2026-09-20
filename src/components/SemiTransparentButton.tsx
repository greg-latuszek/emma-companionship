'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import type { JSX } from 'react';

export const semiTransparentControlSurfaceClassName =
  'rounded-full bg-white/15 hover:bg-white/25 border border-white/35 text-white font-sans font-medium text-sm sm:text-base uppercase tracking-widest transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl';

export const semiTransparentControlClassName =
  `inline-block px-8 sm:px-12 py-3 sm:py-4 ${semiTransparentControlSurfaceClassName}`;

interface SemiTransparentButtonProps {
  href: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Reusable button styled with semi-transparent effect
 * Used on home page and other pages for consistency
 *
 * Default styling: white/15 bg, white/35 border, white/25 on hover
 * Includes backdrop blur and smooth transitions
 */
export function SemiTransparentButton({
  href,
  children,
  delay = 0.7,
  className = '',
}: SemiTransparentButtonProps): JSX.Element {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      className={`${semiTransparentControlClassName} ${className}`}
    >
      {children}
    </motion.a>
  );
}

/**
 * Alternative version using Next.js Link for client-side navigation
 */
interface SemiTransparentLinkProps extends SemiTransparentButtonProps {
  href: string;
}

export function SemiTransparentLink({
  href,
  children,
  delay = 0.7,
  className = '',
}: SemiTransparentLinkProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
    >
      <Link
        href={href}
        className={`${semiTransparentControlClassName} ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}
